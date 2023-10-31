import React, { useEffect, useState } from 'react';
import { Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';

import Alert from '../Alert/Alert';
import AlertWrapper from '../Alert/AlertWrapper';
import Pagination from '../Pagination';
import contactService from '../../services/contact.service';
import OrgContactsList from '../organizationProfile/contacts/OrgContactsList';

const OrganizationContactsModal = ({
  showModal,
  setShowModal,
  organizationId,
  handleRemove,
  ...props
}) => {
  const [errorMessage, setErrorMessage] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 10 });
  const [followersInfo, setFollowersInfo] = useState([]);

  const getContacts = async () => {
    const result = await contactService.getContactsByorganizationId(
      { organizationId },
      pagination
    );

    setFollowersInfo(result.contacts);
    setPagination(result.pagination);
  };

  const changePage = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const removeContact = async (item) => {
    await handleRemove(item);
    getContacts();
  };

  useEffect(() => {
    if (showModal && organizationId) {
      getContacts();
    }
  }, [organizationId, pagination.page, showModal]);

  return (
    <Modal isOpen={showModal} fade={false}>
      <AlertWrapper>
        <Alert
          message={errorMessage}
          setMessage={setErrorMessage}
          color="danger"
        />
      </AlertWrapper>
      <ModalHeader tag="h3" toggle={() => setShowModal(false)} className="p-3">
        Contacts
      </ModalHeader>
      <ModalBody className="border-top mb-0 p-3">
        <div className="list-group list-group-lg list-group-flush list-group-no-gutters">
          {followersInfo.length === 0 ? (
            <div>No Contacts yet</div>
          ) : (
            <>
              {followersInfo.map((item) => (
                <OrgContactsList
                  key={item.id}
                  item={item}
                  handleRemove={removeContact.bind(null, item)}
                  {...props}
                />
              ))}
            </>
          )}
        </div>
      </ModalBody>
      {followersInfo.length > 10 && (
        <ModalFooter className="px-3">
          <Pagination paginationInfo={pagination} onPageChange={changePage} />
        </ModalFooter>
      )}
    </Modal>
  );
};

export default OrganizationContactsModal;
