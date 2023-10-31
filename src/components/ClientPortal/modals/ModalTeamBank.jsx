import React, { Fragment, useEffect, useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import BankTeamTable from '../BankTeamTable';
import { getClientPortalToken } from '../../../layouts/constants';
import { usePagesContext } from '../../../contexts/pagesContext';

const ModalTeamBank = (props) => {
  const [organizationId, setOrganizationId] = useState('');
  const { pageContext } = usePagesContext();
  useEffect(() => {
    const clientPortalToken = getClientPortalToken();
    setOrganizationId(clientPortalToken?.resource_access?.organization[0]?.id);
  }, [pageContext]);
  return (
    <Fragment>
      <Modal
        {...props}
        size="lg"
        aria-labelledby="team_bank"
        centered
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton className="p-3">
          <Modal.Title id="team_bank">Your Bank Team</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0 border-top">
          <div style={{ minHeight: 300 }}>
            <BankTeamTable organizationId={organizationId} />
          </div>
        </Modal.Body>
      </Modal>
    </Fragment>
  );
};

export default ModalTeamBank;
