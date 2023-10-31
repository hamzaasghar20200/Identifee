import React from 'react';
import { Button, Modal } from 'react-bootstrap';
import { Spinner } from 'reactstrap';

export const DeactivateTeamModal = ({
  handleShowModal,
  handleHideModal,
  handleUpdateTeam,
  isActivate,
  isTeamName = '',
  isLoading,
}) => {
  return (
    <>
      <Modal show={handleShowModal || isActivate} onHide={handleHideModal}>
        <Modal.Header closeButton>
          {!isActivate ? (
            <Modal.Title>Deactivating team</Modal.Title>
          ) : (
            <Modal.Title>Activate team</Modal.Title>
          )}
        </Modal.Header>
        <Modal.Body>
          <p>
            {!isActivate
              ? `Are you sure you want to deactivated
            ${isTeamName.name} and remove it from all filters? You can reactivate
            it anytime. `
              : `By activating ${isTeamName.name} you will make it visible on all filters for
            all Identifee users.`}
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleHideModal}>
            Close
          </Button>
          {isActivate ? (
            <Button variant="primary" onClick={handleUpdateTeam}>
              {isLoading ? (
                <Spinner className="spinner-grow-xs" />
              ) : (
                <span>Activated</span>
              )}
            </Button>
          ) : (
            <Button variant="danger" onClick={handleUpdateTeam}>
              {isLoading ? (
                <Spinner className="spinner-grow-xs" />
              ) : (
                <span>Deactivate</span>
              )}
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </>
  );
};
