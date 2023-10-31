import { useState, useEffect } from 'react';
import { FormGroup, Label } from 'reactstrap';

import organizationService from '../../../services/organization.service';
import AutoComplete from '../../AutoComplete';
import {
  SEARCH_FOR_COMPANY,
  SEARCH_FOR_INSIGHT,
} from '../../../utils/constants';
import useIsTenant from '../../../hooks/useIsTenant';

const IdfSelectOrganization = ({
  id,
  name,
  label,
  onChange,
  value,
  title,
  contactInfo,
  organization,
  dealInfo,
  setOrganizationSelected,
  organizationSelected,
  feedInfo,
  changeOrgName,
  setChangeOrgName,
  setAddNewOrg,
}) => {
  const [organizationsData, setOrganizationsData] = useState([]);
  const [, setSelectedOrganization] = useState(null);
  const [charactersRequire, setCharactersRequire] = useState('');
  const [searchOrganization, setSearchOrganization] = useState({
    search: '',
  });

  useEffect(() => {
    if (dealInfo && !organizationSelected) {
      setSelectedOrganization(dealInfo?.organization?.name);
      setOrganizationSelected(dealInfo?.organization);
    }
  }, [dealInfo]);

  useEffect(() => {
    if (contactInfo) {
      setSelectedOrganization(contactInfo?.organization?.name);
      setOrganizationSelected(contactInfo?.organization);
    }
  }, [contactInfo]);

  useEffect(() => {
    onGetOrganzations();
  }, [searchOrganization.search]);

  useEffect(() => {
    if (value) {
      fieldInFields(value);
    } else {
      setSelectedOrganization('');
    }
  }, [value]);

  const fieldInFields = (item) => {
    onChange({
      target: {
        name: name || 'contact_organization_id',
        value: changeOrgName?.id || item.id,
      },
    });

    setSelectedOrganization(item.name);
  };

  async function onGetOrganzations() {
    const response = await organizationService
      .getOrganizations(searchOrganization, { limit: 10 })
      .catch((err) => err);

    const { organizations } = response?.data;
    setOrganizationsData(
      organizations
        ?.filter((o) => !!o.name)
        ?.map((o) => ({ ...o, icon: 'corporate_fare' }))
    );
  }

  const stateChange = (e) => {
    const match = e.target.value.match(/([A-Za-z])/g);
    if (match && match.length >= 2) {
      setCharactersRequire('');
      setSearchOrganization({
        ...searchOrganization,
        search: e.target.value,
      });
    } else {
      return setCharactersRequire(match?.length);
    }
  };

  return (
    <FormGroup>
      {label && <Label>{label}</Label>}
      <AutoComplete
        id={id}
        placeholder={
          title ||
          (useIsTenant().isSynovusBank
            ? SEARCH_FOR_INSIGHT
            : SEARCH_FOR_COMPANY)
        }
        name={name}
        showAvatar={false}
        loading={false}
        onChange={stateChange}
        charactersRequire={charactersRequire}
        data={organizationsData}
        extraTitles={['address_street', 'address_city', 'address_state']}
        showIcon={true}
        onHandleSelect={(item) => {
          fieldInFields(item);
        }}
        customKey="name"
        selected={value?.name || organization?.name || ''}
      />
    </FormGroup>
  );
};

export default IdfSelectOrganization;
