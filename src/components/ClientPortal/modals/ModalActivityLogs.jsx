import React, { Fragment, useEffect, useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import { getClientPortalToken } from '../../../layouts/constants';
import { usePagesContext } from '../../../contexts/pagesContext';
import ActivityTimeline from '../../ActivityTimeline/ActivityTimeline';
import MaterialIcon from '../../commons/MaterialIcon';

const ModalActivityLogs = (props) => {
  const [organizationId, setOrganizationId] = useState('');
  const { pageContext } = usePagesContext();

  useEffect(() => {
    const clientPortalToken = getClientPortalToken();
    setOrganizationId(clientPortalToken?.resource_access?.organization[0]?.id);
  }, [pageContext]);

  const showModalActivityLog = async () => {
    props.onModalOpen();
  };
  return (
    <Fragment>
      <section className="ml-auto mr-1" onClick={showModalActivityLog}>
        <span className="material-icons-outlined text-gray-700 icon-hover-bg font-size-xl2 cursor-pointer">
          notifications
        </span>
      </section>
      <Modal
        {...props}
        size="lg"
        aria-labelledby="activity_logs"
        backdrop="static"
        keyboard={false}
        className="right"
      >
        <Modal.Header closeButton className="p-2 py-3">
          <Modal.Title id="activity_logs">
            <div className="d-flex align-items-center justify-content-between">
              <MaterialIcon
                icon={'notifications'}
                filled
                clazz="font-size-2xl text-primary icon-circle p-1 mr-2"
              />
              <h3 className="mb-0">Activity Log</h3>
            </div>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-2 border-top">
          <ActivityTimeline
            showFilter={false}
            type="organization"
            id={organizationId}
            extraFilters={{ contactId: getClientPortalToken().contact_id }}
          />
        </Modal.Body>
      </Modal>
    </Fragment>
  );
};

export default ModalActivityLogs;
