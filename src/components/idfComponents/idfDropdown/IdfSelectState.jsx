import { useState } from 'react';
import { FormGroup, Label } from 'reactstrap';

import IdfDropdownSearch from './IdfDropdownSearch';
import usaStates from '../../organizations/Constants.states.json';

const IdfSelectState = ({ label, value, onChange, ...restProps }) => {
  const [searchState, setSearchState] = useState({
    search: '',
  });
  const [charactersRequire, setCharactersRequire] = useState('');
  const filteredData = usaStates.filter((state) =>
    state.name.toLowerCase().includes(searchState.search.toLowerCase())
  );

  const fieldInFields = (item) => {
    onChange({
      target: {
        name: 'address_state',
        value: item.name,
      },
    });
  };

  const stateChange = (e) => {
    const match = e.target.value.match(/([A-Za-z])/g);
    if (match && match.length >= 2) {
      setCharactersRequire('');
      setSearchState({
        ...searchState,
        search: e.target.value,
      });
    } else {
      return setCharactersRequire(match?.length);
    }
  };

  return (
    <FormGroup>
      <Label>{label}</Label>
      <IdfDropdownSearch
        id="address_state"
        title="Search for state"
        data={filteredData}
        charactersRequire={charactersRequire}
        customTitle="name"
        onHandleSelect={(_, item) => fieldInFields(item)}
        value={value.address_state}
        onChange={stateChange}
        {...restProps}
      />
    </FormGroup>
  );
};

export default IdfSelectState;
