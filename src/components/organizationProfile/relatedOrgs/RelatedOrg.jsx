import React, { useEffect, useState } from 'react';

import Alert from '../../Alert/Alert';
import AddRelated from './AddRelated';
import OrgRelatedList from './OrgRelatedList';
import organizationService from '../../../services/organization.service';
import AlertWrapper from '../../Alert/AlertWrapper';
import stringConstants from '../../../utils/stringConstants.json';
import EmptyDataButton from '../../emptyDataButton/EmptyDataButton';
import { isPermissionAllowed } from '../../../utils/Utils';
import useIsTenant from '../../../hooks/useIsTenant';

const constants = stringConstants.deals.organizations.profile;

const RelatedOrg = ({
  moduleMap,
  organizationId,
  getProfileInfo,
  isPrincipalOwner,
  mainOwner,
}) => {
  const [allRelatedOrgs, setAllRelatedOrgs] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showAddRelatedModal, setShowAddRelatedModal] = useState(false);

  useEffect(() => {
    getRelated();
  }, [organizationId]);

  const getRelated = async () => {
    const resp = await organizationService
      .getRelations(organizationId)
      .catch((err) => {
        console.log(err);
      });
    setAllRelatedOrgs(resp);
    return resp;
  };

  const getProfile = () => {
    getProfileInfo();
    getRelated();
  };

  const handleRemove = async (item) => {
    try {
      await organizationService.deleteRelation(item.id);
      setSuccessMessage('Relation is deleted successfully');
    } catch (error) {
      setErrorMessage('Relation is not deleted successfully');
    }
    getRelated();
  };

  return (
    <div className="card my-3">
      <AlertWrapper>
        <Alert
          message={errorMessage}
          setMessage={setErrorMessage}
          color="danger"
        />
        <Alert
          message={successMessage}
          setMessage={setSuccessMessage}
          color="success"
        />
      </AlertWrapper>
      <div className="card-header px-3 py-2">
        <h4 className="card-title">
          {useIsTenant().isSynovusBank
            ? constants.relatedInsightTitle
            : constants.relatedOrganizationTitle.replace(/Company/g, moduleMap)}
        </h4>
        <div className="ml-auto">
          <AddRelated
            moduleMap={moduleMap}
            organizationId={organizationId}
            getRelated={getProfile}
            setShowAddRelatedModal={setShowAddRelatedModal}
            showAddRelatedModal={showAddRelatedModal}
            onHandleShowAlertSuccess={setSuccessMessage}
            onHandleShowAlertFailed={setErrorMessage}
            handleRemove={handleRemove}
            isPrincipalOwner={isPrincipalOwner}
            mainOwner={mainOwner}
            allRelatedOrgs={allRelatedOrgs}
          >
            {isPermissionAllowed('contacts', 'create') && (
              <button
                className="btn btn-icon btn-sm rounded-circle"
                onClick={() => setShowAddRelatedModal(true)}
              >
                <i className="material-icons-outlined">add</i>
              </button>
            )}
          </AddRelated>
        </div>
      </div>

      <div className="card-body py-0">
        <div className="list-group list-group-lg list-group-flush list-group-no-gutters py-1">
          {allRelatedOrgs.length === 0 ? (
            <>
              {isPermissionAllowed('contacts', 'create') && (
                <AddRelated
                  moduleMap={moduleMap}
                  organizationId={organizationId}
                  getRelated={getRelated}
                  setShowAddRelatedModal={setShowAddRelatedModal}
                  showAddRelatedModal={showAddRelatedModal}
                  onHandleShowAlertSuccess={setSuccessMessage}
                  onHandleShowAlertFailed={setErrorMessage}
                  handleRemove={handleRemove}
                  allRelatedOrgs={allRelatedOrgs}
                  isPrincipalOwner={isPrincipalOwner}
                  mainOwner={mainOwner}
                >
                  <EmptyDataButton
                    setOpenModal={setShowAddRelatedModal}
                    message=""
                    buttonLabel={`Add Related ${
                      useIsTenant().isSynovusBank ? 'Insight' : `${moduleMap}`
                    }`}
                  />
                </AddRelated>
              )}
            </>
          ) : (
            allRelatedOrgs.map((item) => (
              <OrgRelatedList
                item={item}
                key={item.id}
                isPrincipalOwner={isPrincipalOwner}
                mainOwner={mainOwner}
                getProfile={getProfile}
              />
            ))
          )}
        </div>
      </div>
      {allRelatedOrgs.length > 0 && (
        <div className="card-footer px-3">
          <button
            className="btn btn-white btn-sm"
            onClick={() => {
              setShowAddRelatedModal(true);
            }}
          >
            View Details
            <span className="material-icons-outlined">chevron_right</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default RelatedOrg;
