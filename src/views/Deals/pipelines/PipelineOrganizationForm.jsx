import { useEffect, useReducer, useState } from 'react';
import { Form, FormGroup } from 'reactstrap';

import DropdownSearch from '../../../components/DropdownSearch';
import organizationService from '../../../services/organization.service';
import {
  ALL_LABEL,
  CANCEL_LABEL,
  SAVE_LABEL,
  SEARCH_FOR_COMPANY,
  SEARCH_FOR_INSIGHT,
} from '../../../utils/constants';
import { onHandleSelect, onInputSearch, reducer } from '../contacts/utils';
import useIsTenant from '../../../hooks/useIsTenant';

const PipelineOrganizationForm = ({ setEditMode, onHandleSubmit }) => {
  const [allOrganizations, setAllOrganizations] = useState([]);
  const [searchOrg, setSearchOrg] = useState({
    search: '',
  });
  const [selectTitle, setSelectTitle] = useState(ALL_LABEL);

  const [dealFormData, dispatch] = useReducer(reducer, {});

  async function onGetOrganzations() {
    const response = await organizationService
      .getOrganizations(searchOrg, { limit: 10 })
      .catch((err) => err);

    setAllOrganizations(response?.data?.organizations);
  }

  useEffect(() => {
    onGetOrganzations();
  }, [searchOrg]);

  const onSubmit = async () => {
    onHandleSubmit(dealFormData);
  };

  return (
    <Form className="card-body bg-light">
      <FormGroup>
        <DropdownSearch
          id="contact_organization_id"
          title={
            useIsTenant().isSynovusBank
              ? SEARCH_FOR_INSIGHT
              : SEARCH_FOR_COMPANY
          }
          name="contact_organization_id"
          onChange={(e) => onInputSearch(e, searchOrg, setSearchOrg)}
          data={allOrganizations}
          onHandleSelect={(item) =>
            onHandleSelect(
              item,
              'contact_organization_id',
              dispatch,
              setSelectTitle
            )
          }
          customTitle="name"
          selected={selectTitle}
        />
      </FormGroup>

      <div className="text-right">
        <button
          className="btn btn-white btn-sm mr-2"
          onClick={() => {
            setEditMode(false);
          }}
        >
          {CANCEL_LABEL}
        </button>
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={onSubmit}
        >
          {SAVE_LABEL}
        </button>
      </div>
    </Form>
  );
};

export default PipelineOrganizationForm;
