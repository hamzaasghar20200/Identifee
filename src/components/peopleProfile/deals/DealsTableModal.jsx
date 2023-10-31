import React, { useState, useEffect } from 'react';
import { Modal, ModalBody, ModalHeader } from 'reactstrap';

import DealsTable from '../../deals/DealTableModal';
import dealService from '../../../services/deal.service';

const DealsTableModal = ({
  showModal,
  moduleMap,
  setShowModal,
  contactId,
  organizationId,
}) => {
  const [pagination, setPagination] = useState({ limit: 10, page: 1 });
  const [deals, setDeals] = useState([]);
  const [dataInDB, setDataInDB] = useState(false);

  const getDeals = (count) => {
    const dealsFilter = {};

    if (contactId) dealsFilter.contact_person_id = contactId;
    if (organizationId) dealsFilter.contact_organization_id = organizationId;

    dealService
      .getDeals(dealsFilter, pagination)
      .then(({ data }) => {
        setDeals(data.deals);
        setPagination(data.pagination);
        if (count) setDataInDB(Boolean(data?.pagination?.totalPages));
      })
      .catch((err) => console.log(err));
  };

  const onPageChange = (page) => {
    setPagination({ ...pagination, page });
  };

  useEffect(() => {
    if (showModal) {
      getDeals(true);
    }
  }, [pagination.page, showModal]);

  return (
    <Modal isOpen={showModal} size="lg" fade={false}>
      <ModalHeader tag="h3" className="p-3" toggle={() => setShowModal(false)}>
        {moduleMap.singular}
      </ModalHeader>
      <ModalBody className="border-top mb-0 p-3">
        <DealsTable
          data={deals}
          paginationInfo={pagination}
          onPageChange={onPageChange}
          dataInDB={dataInDB}
        />
      </ModalBody>
    </Modal>
  );
};

export default DealsTableModal;
