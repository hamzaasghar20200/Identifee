import { useState, useEffect } from 'react';
import { FormGroup, Label } from 'reactstrap';

import mapService from '../../../services/map.service';
import { splitAddress } from '../../../utils/Utils';
import AutoComplete from '../../AutoComplete';

const IdfSearchDirections = ({
  label,
  value,
  onChange,
  validationConfig,
  fieldState,
  isFieldsObj,
  name,
  setIsFieldsObj,
  clearState,
  addActivity,
  fromNavBar = false,
  ...restProps
}) => {
  const [dataLocations, setDataLocations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (value?.address_street || value) {
      onDirections(value?.address_street || value);
    }
  }, [value?.address_street || value]);

  const onDirections = async (value) => {
    setLoading(true);
    const addressData = {
      ...isFieldsObj,
      [name]: value,
    };
    setIsFieldsObj(addressData);
    const data = await mapService
      .getGoogleAddress(value)
      .catch((err) => console.log(err));

    setLoading(false);
    setDataLocations(data);
  };

  const fieldInFields = (e, item) => {
    const { city, state, country } = splitAddress(item);

    if (fromNavBar) {
      // just handling add organization popup flow where we need to show full address on selection
      onChange({
        item,
        target: {
          name: 'address_full',
          value: item,
        },
      });
      onChange({
        target: {
          name: 'address_street',
          value: item.name,
        },
      });
    } else {
      onChange({
        target: {
          name: 'address_street',
          value: item.name,
        },
      });
    }
    onChange({
      target: {
        name: 'address_country',
        value: country,
      },
    });
    onChange({
      target: {
        name: 'address_city',
        value: city,
      },
    });

    onChange({
      target: {
        name: 'address_state',
        value: state?.name || '',
      },
    });
    const addressData = {
      ...isFieldsObj,
      [name]:
        name === 'address_state'
          ? state.name
          : name === 'address_country'
          ? item?.structured_formatting?.secondary_text
          : name === 'address_city'
          ? city
          : name === 'address_street'
          ? item?.name
          : '',
    };
    setIsFieldsObj(addressData);
  };

  return (
    <FormGroup>
      {label && <Label className="mb-0 form-label">{label}</Label>}
      <AutoComplete
        id="search_directions_dropdown"
        placeholder="Search Address"
        name={name}
        customKey="name"
        loading={loading}
        validationConfig={validationConfig}
        fieldState={fieldState}
        clearState={(e) => clearState(e)}
        showAvatar={false}
        onChange={(e) => onDirections(e.target.value)}
        data={dataLocations}
        onHandleSelect={(item) => {
          fieldInFields({}, item);
        }}
        selected={
          !addActivity
            ? name === 'address_state'
              ? value?.address_state
              : name === 'address_country'
              ? value?.address_country
              : name === 'address_city'
              ? value?.address_city
              : name === 'address_street'
              ? value?.address_street
              : ''
            : ''
        }
        {...restProps}
      />
    </FormGroup>
  );
};

export default IdfSearchDirections;
