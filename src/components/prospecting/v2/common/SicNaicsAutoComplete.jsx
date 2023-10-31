import DropdownWrapper from './DropdownWrapper';
import React, { useEffect, useState } from 'react';
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

const SicNaicsAutoComplete = ({
  data,
  placeholder,
  customKey,
  callType,
  callKey,
  limit = 15,
  onSelect,
}) => {
  const [list, setList] = useState([]);
  const [options, setOptions] = useState([]);
  const [selects, setSelects] = useState(data[customKey] || []);

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
    const newSelects = [item];
    setSelects(newSelects);
    const naicsSicOnly = detectAndExtractNaicsOrSic(item);
    onSelect(item, naicsSicOnly);
  };
  useEffect(() => {
    getDataByKey(callKey, callType);
  }, []);

  return (
    <DropdownWrapper
      placeholder={placeholder}
      onChange={onHandleChange}
      onSelect={onHandleSelect}
      options={options}
      selects={[]}
      onRemoveSelect={() => {}}
      onClear={() => {}}
      allowClear={true}
      inputVal={selects?.length ? selects[0] : ''}
    />
  );
};

export default SicNaicsAutoComplete;
