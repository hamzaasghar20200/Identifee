import { useEffect, useState } from 'react';
import { FormGroup } from 'reactstrap';
import searchService from '../../../services/search.service';
import AutoComplete from '../../AutoComplete';

const correctField = {
  organization: {
    id: 'organization_id',
    title: 'organization_name',
    icon: 'corporate_fare',
  },
  contact: {
    id: 'contact_id',
    title: 'contact_name',
    icon: 'person',
  },
  deal: {
    id: 'deal_id',
    title: 'deal_name',
    icon: 'monetization_on',
  },
};

const IdfSelectMultiOpp = ({
  label,
  onChange,
  value,
  name,
  clearState,
  noDefault,
  ...restProps
}) => {
  const [multiData, setMultiData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(value);
  const [searchItem, setSearchItem] = useState({
    search: '',
  });
  const [charactersRequire, setCharactersRequire] = useState('');
  useEffect(() => {
    if (searchItem.search) {
      termFinder();
    }
  }, [searchItem.search]);

  const termFinder = () => {
    setLoading(true);
    searchService
      .getSearchResults({ s: searchItem.search })
      .then((response) => setMultiData(response?.data))
      .catch((err) => console.log(err));
    setLoading(false);
  };

  const fieldInFields = (item) => {
    clearState(item.sectionId);
    onChange({
      target: {
        name: item.sectionId,
        value: item.id,
      },
    });
    setSelectedItem(item.title);
  };

  const stateChange = (e) => {
    const match = e.target.value.match(/([A-Za-z])/g);
    if (match && match.length >= 2) {
      setCharactersRequire('');
      setSearchItem({
        ...searchItem,
        search: e.target.value,
      });
    } else {
      return setCharactersRequire(match?.length);
    }
  };
  const compare = (itemA, itemB) => {
    if (itemA.kind < itemB.kind) {
      return -1;
    }
    if (itemA.kind > itemB.kind) {
      return 1;
    }
    return 0;
  };

  const renderData = () => {
    const newMultiData = [];

    multiData?.forEach((item) => {
      if (item.kind in correctField && item[correctField[item.kind].title]) {
        newMultiData.push({
          id: item[correctField[item.kind].id] || '',
          kind: item.kind,
          sectionId: correctField[item.kind].id,
          title:
            Boolean(item[correctField[item.kind].title]) &&
            `${item[correctField[item.kind].title] || ''}`,
          icon: correctField[item.kind].icon,
        });
      }
    });

    return newMultiData.sort(compare);
  };
  return (
    <FormGroup>
      <AutoComplete
        placeholder="Search for Contact, Company or Deal"
        data={renderData()}
        customKey="title"
        id={label || 'ddFromNavbar'}
        loading={loading}
        name={name}
        charactersRequire={charactersRequire}
        onHandleSelect={(item) => fieldInFields(item)}
        clearState={(item) => clearState(item)}
        selected={label ? selectedItem?.title : selectedItem}
        onChange={stateChange}
        showIcon
        {...restProps}
      />
    </FormGroup>
  );
};

export default IdfSelectMultiOpp;
