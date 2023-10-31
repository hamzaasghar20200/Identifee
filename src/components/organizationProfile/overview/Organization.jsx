import React, { useState, useReducer, useEffect } from 'react';

import Alert from '../../Alert/Alert';
import AlertWrapper from '../../Alert/AlertWrapper';
import OrganizationCard from './OrganizationCard';
import stringConstants from '../../../utils/stringConstants.json';
import CustomFieldsForm from '../../peoples/CustomFieldsForm';
import {
  VIEW_CARD,
  VIEW_CUSTOM,
  VIEW_FORM,
  iconByTypeField,
  reducer,
} from '../../peoples/constantsPeople';
import fieldService from '../../../services/field.service';
import { isPermissionAllowed } from '../../../utils/Utils';
import OrganizationForm from '../../organizations/OrganizationForm';
import { useForm } from 'react-hook-form';
import { groupBy } from 'lodash';
import AutoAwesomeImport from '../../commons/AutoAwesomeImport';
import { ProspectTypes } from '../../prospecting/v2/constants';

const constants = stringConstants.deals.contacts.profile;
const Organization = ({
  children,
  data,
  getProfileInfo,
  setProfileInfo,
  updateLabel,
  labelType,
  me,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    getFieldState,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: data,
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [editMode, setEditMode] = useState(VIEW_CARD);
  const [loading, setLoading] = useState(false);
  const [isCustomFields, dispatchOrgData] = useReducer(reducer, []);
  const [isFieldObj, setIsFieldObj] = useState({});
  const [customDataFields, setCustomDataFields] = useState([]);
  const [organizationFields, setOrganizationFields] = useState([]);
  const groupBySection = (fieldsList) => {
    setOrganizationFields(groupBy(fieldsList, 'section'));
  };
  const getFields = async () => {
    const fieldsData = await fieldService.getFields('organization', {
      usedField: true,
    });
    groupBySection(fieldsData?.data);
  };
  useEffect(() => {
    if (editMode) {
      getFields();
    }
  }, [editMode]);
  const currentView = 'organization';

  const getData = async () => {
    await fieldService
      .getFieldsByType(currentView, {})
      .then((result) => {
        const { data } = result;

        const payload = data?.data.map((item) => {
          const { key, field_type } = item;
          return {
            ...item,
            name: key,
            type: { ...iconByTypeField(field_type) },
          };
        });

        dispatchOrgData({ type: 'create', payload });
      })
      .catch((e) => {
        console.log(e);
      });
  };
  useEffect(() => {
    getData();
  }, []);
  return (
    <>
      {children}
      <AlertWrapper>
        <Alert message={successMessage} setMessage={setSuccessMessage} />
        <Alert
          color="danger"
          message={errorMessage}
          setMessage={setErrorMessage}
        />
      </AlertWrapper>
      <div className="card">
        <div className="card-header py-2 px-3">
          <h4 className="card-title d-flex align-items-center gap-1">
            <span>{constants.overviewTitle}</span>
            <AutoAwesomeImport
              data={data}
              type={ProspectTypes.company}
              refresh={getProfileInfo}
            />
          </h4>
          {Object.keys(data)?.length !== 0 && (
            <div className="ml-auto">
              {isPermissionAllowed('contacts', 'edit') && (
                <button
                  className={`btn btn-icon btn-sm rounded-circle ${
                    editMode !== VIEW_CARD ? 'hide cursor-default' : 'visible'
                  }`}
                  title="Edit all fields"
                  onClick={() => {
                    setEditMode(VIEW_FORM);
                  }}
                >
                  <i className="material-icons-outlined">edit</i>
                </button>
              )}
            </div>
          )}
        </div>

        {editMode === VIEW_FORM && (
          <OrganizationForm
            fields={organizationFields}
            data={data}
            editMode={editMode}
            setOrganizationFields={setOrganizationFields}
            setEditMode={setEditMode}
            isFieldsObj={isFieldObj}
            register={register}
            handleSubmit={handleSubmit}
            reset={reset}
            loading={loading}
            setLoading={setLoading}
            setValue={setValue}
            customDataFields={customDataFields}
            setCustomDataFields={setCustomDataFields}
            getFieldState={getFieldState}
            control={control}
            errors={errors}
            labelType={labelType}
            setIsFieldsObj={setIsFieldObj}
            setSuccessMessage={setSuccessMessage}
            setErrorMessage={setErrorMessage}
            getProfileInfo={getProfileInfo}
            setProfileInfo={setProfileInfo}
            fromNavBar
            updateLabel={updateLabel}
          />
        )}
        {editMode === VIEW_CARD && <OrganizationCard data={data} />}
        {editMode === VIEW_CUSTOM && (
          <CustomFieldsForm
            state={isCustomFields}
            dispatch={dispatchOrgData}
            currentView={currentView}
          />
        )}
      </div>
    </>
  );
};

export default Organization;
