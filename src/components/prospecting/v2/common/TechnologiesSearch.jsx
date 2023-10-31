import React, { useEffect, useState } from 'react';

import DropdownWrapper from './DropdownWrapper';
import {
  getKeysWithData,
  TECHNOLOGIES_STORAGE_KEY,
} from '../../../../utils/Utils';
import prospectService from '../../../../services/prospect.service';
import _ from 'lodash';

function searchNumberStringsAndSort(strings, query) {
  const filtered = [];
  const regex = new RegExp(query, 'i');
  for (let i = 0; i < strings.length; i++) {
    if (regex.test(strings[i])) {
      filtered.push(strings[i]);
    }
  }
  filtered.sort((a, b) => {
    const aNum = Number(a.match(/\d+/)[0]);
    const bNum = Number(b.match(/\d+/)[0]);
    return aNum - bNum;
  });
  return filtered;
}
const TechnologiesSearch = ({
  name,
  data = [],
  setData,
  keyType,
  keyFilter,
  placeholder,
  onEnter,
  showLabelColon = true,
  callKey = TECHNOLOGIES_STORAGE_KEY,
  callType = 'getTechnologies',
}) => {
  const limit = 15;
  const [list, setList] = useState([]);
  const [options, setOptions] = useState([]);
  const [selects, setSelects] = useState(data[keyType][keyFilter] || []);
  const [refresh, setRefresh] = useState(0);

  // this detects if the string has this patter (111) Cattle farming, then this would return 1111 only
  const detectAndExtractNaicsOrSic = (str) => {
    const regex = /\((.*?)\)/;
    const match = str.match(regex);
    if (match !== null) {
      return match[1];
    }
    return str;
  };
  const codeTitleCombine = (item) => {
    return `(${item.code}) ${item.title}`;
  };
  const getDataByKey = async (key, func) => {
    const localTech = prospectService.getListLocallyByKey(key);
    if (!localTech || !localTech.length) {
      const { data } = await prospectService[func]();
      let concatData = data;
      // special handling
      if (callType === 'getNaicsCodes') {
        concatData = data?.data.map(codeTitleCombine);
      } else if (callType === 'getSicCodes') {
        concatData = data?.map(codeTitleCombine);
      }
      const uniqData = _.uniq(concatData);
      setOptions(uniqData.slice(0, limit));
      setList(uniqData);
      prospectService.saveListLocallyByKey(key, uniqData);
    } else {
      setOptions(localTech.slice(0, limit));
      setList(localTech);
    }
  };

  useEffect(() => {
    getDataByKey(callKey, callType);
  }, []);

  const updateData = (newData = []) => {
    const payload = {
      ...data,
      [keyType]: {
        ...data[keyType],
        [keyFilter]: newData,
      },
    };

    setSelects(newData);
    setData({ type: 'set', payload });
    setRefresh((prevState) => prevState + 1);
  };

  const onHandleChange = (value) => {
    let found = [];
    if (callType === 'getNaicsCodes' || callType === 'getSicCodes') {
      found = searchNumberStringsAndSort(list, value);
    } else {
      found = list.filter((item) => {
        return (
          item?.toLowerCase().includes(value.toLowerCase()) &&
          !selects.includes(value)
        );
      });
    }

    // remove the already selected items from the list to avoid duplicates selection
    if (!value && selects.length) {
      const selectsSet = new Set(selects);
      found = list.filter((element) => {
        const extractedValue = detectAndExtractNaicsOrSic(element);
        return !selectsSet.has(extractedValue);
      });
    }
    setOptions(found.slice(0, limit));
  };

  const onHandleSelect = (item) => {
    updateData(_.uniqBy([...selects, detectAndExtractNaicsOrSic(item)]));
  };

  const onHandleRemoveSelect = (value) => {
    const items = selects.slice();
    const index = items.findIndex((item) => {
      return item.toLowerCase() === value.toLowerCase();
    });

    items.splice(index, 1);
    updateData(items);
  };

  const onHandleClear = () => {
    updateData([]);
  };

  useEffect(() => {
    onEnter();
  }, [refresh]);

  useEffect(() => {
    try {
      setSelects(data[keyType][keyFilter] || []);
    } catch (e) {}
  }, [data]);

  useEffect(() => {
    if (!Object.keys(getKeysWithData(data)).length) {
      setSelects([]);
    }
  }, [data]);

  return (
    <>
      {name && (
        <div className="mt-2 mb-2 text-capitalize font-weight-semi-bold fs-7">
          {name}
          {showLabelColon && <span>:</span>}
        </div>
      )}
      <DropdownWrapper
        placeholder={placeholder}
        onChange={onHandleChange}
        onSelect={onHandleSelect}
        options={options}
        selects={selects}
        onRemoveSelect={onHandleRemoveSelect}
        onClear={onHandleClear}
      />
    </>
  );
};

export default TechnologiesSearch;
