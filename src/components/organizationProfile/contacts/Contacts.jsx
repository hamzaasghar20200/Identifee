import React, { useState, useEffect } from 'react';

import Alert from '../../Alert/Alert';
import AddContact from './AddContact';
import OrgContactsList from './OrgContactsList';
import AlertWrapper from '../../Alert/AlertWrapper';
import contactService from '../../../services/contact.service';
import EmptyDataButton from '../../emptyDataButton/EmptyDataButton';
import { isPermissionAllowed } from '../../../utils/Utils';
import ContactsTableModal from './ContactsTableModal';

const Contacts = ({
  organizationId = '',
  moduleMap,
  getProfileInfo,
  isPrincipalOwner,
  profileInfo,
  mainOwner,
}) => {
  const [contacts, setContacts] = useState([]);
  const [showContactsModal, setShowContactsModal] = useState(false);
  const [pagination, setPagination] = useState({});
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showAddContactModal, setShowAddContactModal] = useState(false);

  const contactLimit = 5;

  useEffect(() => {
    if (organizationId) {
      getContacts();
    }
  }, [organizationId]);

  const getContacts = () => {
    contactService
      .getContactsByorganizationId({ organizationId }, { limit: contactLimit })
      .then((res) => {
        setContacts(res.contacts);
        setPagination(res.pagination);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const getProfile = () => {
    getProfileInfo();
    getContacts();
  };

  useEffect(() => {
    if (showContactsModal) {
      getContacts();
    }
  }, [showContactsModal]);

  return (
    <div className="card mt-3">
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
      <ContactsTableModal
        moduleMap={moduleMap}
        showModal={showContactsModal}
        setShowModal={setShowContactsModal}
        organizationId={organizationId}
        profileInfo={profileInfo}
      />
      <div className="card-header px-3 py-2">
        <h4 className="card-title">{moduleMap}</h4>
        <div className="ml-auto">
          <AddContact
            organizationId={organizationId}
            getContacts={getProfile}
            moduleMap={moduleMap}
            setShowAddContactModal={setShowAddContactModal}
            showAddContactModal={showAddContactModal}
            onHandleShowAlertSuccess={setSuccessMessage}
            onHandleShowAlertFailed={setErrorMessage}
          >
            {isPermissionAllowed('contacts', 'create') && (
              <button
                className="btn btn-icon btn-sm rounded-circle"
                onClick={() => setShowAddContactModal(true)}
              >
                <i className="material-icons-outlined">add</i>
              </button>
            )}
          </AddContact>
        </div>
      </div>

      <div className="card-body pt-2 pb-3">
        <div className="list-group list-group-lg list-group-flush list-group-no-gutters py-1">
          {contacts.length === 0 && (
            <AddContact
              organizationId={organizationId}
              getContacts={getContacts}
              moduleMap={moduleMap}
              setShowAddContactModal={setShowAddContactModal}
              showAddContactModal={showAddContactModal}
              onHandleShowAlertSuccess={setSuccessMessage}
              onHandleShowAlertFailed={setErrorMessage}
            >
              {isPermissionAllowed('contacts', 'create') && (
                <EmptyDataButton
                  setOpenModal={setShowAddContactModal}
                  message=""
                  buttonLabel={`Add ${moduleMap}`}
                />
              )}
            </AddContact>
          )}
          {contacts?.slice(0, contactLimit)?.map((item) => (
            <OrgContactsList
              item={item}
              key={item.id}
              isPrincipalOwner={isPrincipalOwner}
              mainOwner={mainOwner}
            />
          ))}
        </div>
      </div>
      {pagination.count > 0 && (
        <div className="card-footer px-3">
          <button
            className="btn btn-white btn-sm"
            onClick={() => {
              setShowContactsModal(true);
            }}
          >
            View all
            <span className="material-icons-outlined">chevron_right</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default Contacts;
