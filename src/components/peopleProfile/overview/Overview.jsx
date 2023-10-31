import React, { useEffect, useState } from 'react';

import OverviewCard from './OverviewCard';
import OverviewForm from './OverviewForm';
import { VIEW_CARD, VIEW_FORM } from '../../peoples/constantsPeople';
import fieldService from '../../../services/field.service';
import stringConstants from '../../../utils/stringConstants.json';
import AlertWrapper from '../../Alert/AlertWrapper';
import Alert from '../../Alert/Alert';
import { isPermissionAllowed } from '../../../utils/Utils';
import { groupBy } from 'lodash';
import { ProspectTypes } from '../../prospecting/v2/constants';
import AutoAwesomeImport from '../../commons/AutoAwesomeImport';
const constants = stringConstants.deals;

const Overview = ({
  data,
  getProfileInfo,
  isPrincipalOwner,
  labelType,
  moduleMap,
}) => {
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [editMode, setEditMode] = useState(VIEW_CARD);
  const [isFieldsData, setIsFieldsData] = useState([]);
  const [fieldData, setFieldsData] = useState([]);
  const [breakLoop, setIsBreakLoop] = useState(2);
  const currentView = 'contact';
  const groupBySection = (fieldsList) => {
    setIsFieldsData(groupBy(fieldsList, 'section'));
  };
  const getData = async () => {
    const { data } = await fieldService.getFields(currentView, {
      usedField: true,
    });
    setFieldsData(data);
    groupBySection(data);
  };

  useEffect(() => {
    if (fieldData?.length === 0) {
      getData();
    }
  }, [data]);
  const handleEdit = (item) => {
    setEditMode(item);
    setIsBreakLoop(isFieldsData.length);
  };
  return (
    <div className="card">
      <AlertWrapper>
        <Alert message={successMessage} setMessage={setSuccessMessage} />
        <Alert
          color="danger"
          message={errorMessage}
          setMessage={setErrorMessage}
        />
      </AlertWrapper>
      <div className="card-header px-3 py-2">
        <h4 className="card-title d-flex align-items-center gap-1">
          <span>{constants.contacts.profile.overviewTitle}</span>
          <AutoAwesomeImport
            data={data}
            type={ProspectTypes.people}
            refresh={getProfileInfo}
          />
        </h4>
        {Object.keys(data).length !== 0 &&
          isPermissionAllowed('contacts', 'edit') && (
            <button
              className={`btn btn-icon btn-sm rounded-circle ${
                editMode !== VIEW_CARD ? 'hide cursor-default' : 'visible'
              }`}
              title="Edit all fields"
              onClick={() => {
                handleEdit(VIEW_FORM);
              }}
            >
              <i className="material-icons-outlined">edit</i>
            </button>
          )}
      </div>

      {editMode === VIEW_FORM && (
        <OverviewForm
          moduleMap={moduleMap}
          labelType={labelType}
          overviewData={data}
          fieldData={fieldData}
          breakLoop={breakLoop}
          setEditMode={setEditMode}
          setSuccessMessage={setSuccessMessage}
          setErrorMessage={setErrorMessage}
          getProfileInfo={getProfileInfo}
          isFieldsData={isFieldsData}
        />
      )}
      {editMode === VIEW_CARD && (
        <OverviewCard overviewData={data} fieldData={fieldData} />
      )}
    </div>
  );
};

export default Overview;
