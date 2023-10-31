import { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';

import organizationService from '../../services/organization.service';
import {
  EMPTY_COMP_NAME,
  COMPANY_CREATED,
  ADD_INSIGHT,
  INSIGHT_CREATED,
  EMPTY_INSIGHT_NAME,
} from '../../utils/constants';
import OrganizationForm from './OrganizationForm';
import {
  RIGHT_PANEL_WIDTH,
  overflowing,
  splitAddress,
} from '../../utils/Utils';
import fieldService from '../../services/field.service';
import { useForm } from 'react-hook-form';
import RightPanelModal from '../modal/RightPanelModal';
import { groupBy } from 'lodash';
import routes from '../../utils/routes.json';
import { usePagesContext } from '../../contexts/pagesContext';
import { removeCustomFieldsFromActivityForm } from '../../views/Deals/contacts/utils';
import useIsTenant from '../../hooks/useIsTenant';

const AddOrganization = ({
  moduleMap,
  children,
  openOrganization,
  setOpenOrganization,
  successMessage,
  setSuccessMessage,
  errorMessage,
  setErrorMessage,
  getOrganizations,
  fromNavbar,
  setOpenList,
  searchValue,
  me,
}) => {
  const organizationObj = {
    name: '',
    employees: 0,
  };
  const {
    register,
    handleSubmit,
    reset,
    getFieldState,
    control,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: organizationObj,
  });
  const history = useHistory();

  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [preOwners, setPreOwners] = useState([]);
  const [isFieldsData, setIsFieldsData] = useState([]);
  const [isFieldsObj, setIsFieldsObj] = useState(organizationObj);
  const { pageContext, setPageContext } = usePagesContext();
  const [customFields, setCustomFields] = useState([]);
  const currentView = 'organization';
  const groupBySection = (fieldsList) => {
    setIsFieldsData(groupBy(fieldsList, 'section'));
  };
  const getFields = async () => {
    setIsLoading(true);
    const { data } = await fieldService.getFields(currentView, {
      preferred: true,
    });
    if (data.length > 0) {
      groupBySection(data);
      setIsLoading(false);
    } else {
      const { data } = await fieldService.createDefaultFields(currentView);
      groupBySection(data);
      setIsLoading(false);
    }
  };
  useEffect(() => {
    if (openOrganization === true) {
      getFields();
    }
  }, [openOrganization]);

  useEffect(() => {
    if (me) {
      const userSet = {
        ...isFieldsObj,
        assigned_user_id: me?.id,
        user: me,
      };
      setIsFieldsObj(userSet);
    }
  }, []);

  useEffect(() => {
    if (searchValue) {
      isFieldsObj.name = searchValue;
    }
  }, [searchValue]);

  const toggle = () => {
    setOpenOrganization(!openOrganization);
    setOpenList(false);
    reset(organizationObj);
    overflowing();
    setCustomFields([]);
  };

  const onClose = () => {
    setOpenOrganization(false);
    reset(organizationObj);
    overflowing();
    setCustomFields([]);
  };
  const onHandleSubmit = async () => {
    setLoading(true);

    if (!isFieldsObj.name) {
      setLoading(false);

      return setErrorMessage(
        isSynovus
          ? EMPTY_INSIGHT_NAME
          : EMPTY_COMP_NAME.replace(/Company/g, moduleMap)
      );
    }

    // set US as country for now
    isFieldsObj.address_country = 'USA';

    // here splitting address back to what API needs
    isFieldsObj.address_street = isFieldsObj?.address_full
      ? splitAddress(isFieldsObj.address_full)?.address
      : '';
    const updateFields = removeCustomFieldsFromActivityForm(
      isFieldsObj,
      customFields
    );
    const newContact = await organizationService
      .createOrganization(updateFields)
      .catch((err) => console.log(err));

    if (newContact) {
      await Promise.all(
        customFields?.map(async (item) => {
          await new Promise((resolve) => {
            organizationService
              .updateCustomField(newContact?.data?.id, item)
              .then(resolve);
          });
        }),
        preOwners?.map(async (item) => {
          await new Promise((resolve) => {
            organizationService
              .addOwner(newContact?.data?.id, item.user_id)
              .then(resolve);
          });
        })
      );
      if (getOrganizations) {
        getOrganizations();
      } else {
        setPageContext({ ...pageContext, RefreshCompanyList: true });
      }
      setLoading(false);
      setPreOwners([]);

      setSuccessMessage(
        isSynovus
          ? INSIGHT_CREATED
          : COMPANY_CREATED.replace(/Company/g, moduleMap)
      );

      toggle();

      if (fromNavbar) {
        history.push(
          `/${routes.companies}/${newContact?.data?.id}/organization/profile`
        );
      }
    }
  };
  const isSynovus = useIsTenant().isSynovusBank;

  return (
    <>
      {children}
      <RightPanelModal
        showModal={openOrganization}
        setShowModal={() => onClose()}
        showOverlay={true}
        containerBgColor={'pb-0'}
        containerWidth={RIGHT_PANEL_WIDTH}
        containerPosition={'possetMeition-fixed'}
        headerBgColor="bg-gray-5"
        Title={
          <div className="d-flex py-2 align-items-center">
            <h3 className="mb-0">
              {isSynovus ? ADD_INSIGHT : `Add ${moduleMap}`}
            </h3>
          </div>
        }
      >
        <OrganizationForm
          fields={isFieldsData}
          isFieldsObj={isFieldsObj}
          setIsFieldsObj={setIsFieldsObj}
          service={organizationService}
          preowners={preOwners}
          onClose={onClose}
          isLoading={isLoading}
          labelType={'organization'}
          loading={loading}
          me={me}
          onHandleSubmit={onHandleSubmit}
          customDataFields={customFields}
          setCustomDataFields={setCustomFields}
          handleSubmit={handleSubmit}
          register={register}
          setValue={setValue}
          getFieldState={getFieldState}
          control={control}
          isprincipalowner="true"
          errors={errors}
          setPreOwners={setPreOwners}
          fromNavBar
        />
      </RightPanelModal>
    </>
  );
};

export default AddOrganization;
