import { useState, useEffect } from 'react';
import { FormGroup, Label } from 'reactstrap';

import dealService from '../../../services/deal.service';
import AutoComplete from '../../AutoComplete';

const IdfSelectDeal = ({
  id,
  name,
  label,
  onChange,
  value,
  contactId,
  organizationId,
  title,
  feedInfo,
  deal,
  dealSelected,
  setDealSelected,
  setDealInfo,
  changeOrgName,
  setChangeOrgName,
}) => {
  const [dealsData, setDealsData] = useState([]);
  const [, setSelectedDeal] = useState('');
  const [searchDeal, setSearchDeal] = useState({
    search: '',
  });

  useEffect(() => {
    getDeals();
  }, [searchDeal.search]);

  useEffect(() => {
    if (!dealSelected && !value) {
      setSelectedDeal('');
    }
  }, [dealSelected]);

  useEffect(() => {
    if (value) {
      getDeal();
    } else {
      setSelectedDeal('');
    }
  }, [value]);

  const getDeal = async () => {
    const deal = await dealService
      .getDealById(value)
      .catch((err) => console.log(err));

    setDealInfo(deal);
    fieldInFields(deal);
  };

  const getDeals = () => {
    const dealsFilter = {};

    if (contactId) dealsFilter.contact_person_id = contactId;
    if (organizationId) dealsFilter.contact_organization_id = organizationId;

    dealService
      .getDeals(dealsFilter, { limit: 10 }, searchDeal.search)
      .then(({ data }) => {
        const { deals } = data;
        setDealsData(
          deals?.map((d) => ({
            ...d,
            name: `${d.name} (${d?.organization?.name})`,
            icon: 'monetization_on',
          }))
        );
      })
      .catch((err) => console.log(err));
  };

  const fieldInFields = (item) => {
    onChange({
      target: {
        name: name || 'contact_deal_id',
        value: item.id,
      },
    });

    setSelectedDeal(item?.name);
  };

  const stateChange = (e) => {
    setSearchDeal({
      ...searchDeal,
      search: e.target.value,
    });
  };

  return (
    <FormGroup>
      {label && <Label>{label}</Label>}
      <AutoComplete
        id={id}
        placeholder={title || 'Search for deal'}
        name={name}
        showAvatar={false}
        loading={false}
        showIcon={true}
        onChange={stateChange}
        data={dealsData}
        onHandleSelect={(item) => {
          fieldInFields(item);
        }}
        customKey="name"
        selected={feedInfo?.deal?.name || deal?.name || ''}
      />
    </FormGroup>
  );
};

export default IdfSelectDeal;
