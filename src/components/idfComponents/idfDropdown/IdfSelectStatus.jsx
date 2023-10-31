import { useState } from 'react';
import { FormGroup, Label } from 'reactstrap';

import IdfDropdownSearch from './IdfDropdownSearch';

const labelsStatus = [
  { name: 'none', title: 'None' },
  { name: 'won', title: 'Won' },
  { name: 'hot', title: 'Hot Lead' },
  { name: 'warm', title: 'Warm Lead' },
  { name: 'cold', title: 'Cold Lead' },
];

const IdfSelectStatus = ({ label, value, onChange, ...restProps }) => {
  const [searchLabel, setSearchLabel] = useState({
    search: '',
  });
  const [charactersRequire, setCharactersRequire] = useState('');
  const filteredData = labelsStatus.filter((status) =>
    status.name.toLowerCase().includes(searchLabel.search.toLowerCase())
  );

  const fieldInFields = (item) => {
    onChange({
      target: {
        name: 'status',
        value: item.name,
      },
    });
  };

  const stateChange = (e) => {
    const match = e.target.value.match(/([A-Za-z])/g);
    if (match && match.length >= 2) {
      setCharactersRequire('');
      setSearchLabel({
        ...searchLabel,
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
        title="Search for label"
        data={filteredData}
        charactersRequire={charactersRequire}
        customTitle="title"
        onHandleSelect={(_, item) => fieldInFields(item)}
        value={value.status || labelsStatus[0].title}
        onChange={stateChange}
        {...restProps}
      />
    </FormGroup>
  );
};

export default IdfSelectStatus;
