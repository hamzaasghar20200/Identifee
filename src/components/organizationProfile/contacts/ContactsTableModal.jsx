import React, { useState, useEffect } from 'react';
import { Modal, ModalBody, ModalHeader } from 'reactstrap';

import ContactTableModal from './ContactTableModal';
import contactService from '../../../services/contact.service';

const ContactsTableModal = ({
  moduleMap,
  showModal,
  setShowModal,
  organizationId,
  profileInfo,
}) => {
  const [pagination, setPagination] = useState({ limit: 10, page: 1 });
  const [contacts, setContacts] = useState([]);
  const [dataInDB, setDataInDB] = useState(false);
  const getContacts = async (count) => {
    const result = await contactService.getContactsByorganizationId(
      { organizationId },
      pagination
    );

    setContacts(result.contacts);
    setPagination(result.pagination);
    if (count) setDataInDB(Boolean(result?.pagination?.totalPages));
  };

  const onPageChange = (page) => {
    setPagination({ ...pagination, page });
  };

  useEffect(() => {
    if (showModal) {
      getContacts(true);
    }
  }, [showModal]);

  return (
    <Modal isOpen={showModal} size="lg" fade={false}>
      <ModalHeader tag="h3" className="p-3" toggle={() => setShowModal(false)}>
        {moduleMap}
      </ModalHeader>
      <ModalBody className="border-top mb-0 p-3">
        <ContactTableModal
          data={contacts}
          paginationInfo={pagination}
          onPageChange={onPageChange}
          dataInDB={dataInDB}
          profileInfo={profileInfo}
        />
      </ModalBody>
    </Modal>
  );
};

export default ContactsTableModal;
