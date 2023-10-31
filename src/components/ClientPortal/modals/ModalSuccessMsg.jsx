import React, { Fragment } from 'react';
import ButtonIcon from '../../commons/ButtonIcon';
import Modal from 'react-bootstrap/Modal';

const ModalSuccessMsg = (props) => {
  const handleRequestCall = () => {
    props.closeModal();
  };
  return (
    <Fragment>
      <Modal
        {...props}
        size="sm"
        aria-labelledby="bank_rep"
        centered
        backdrop="static"
        keyboard={false}
      >
        <Modal.Body className="success-message text-center shadow-green p-3">
          <figure className="mt-5 mb-4">
            <img
              className="img-fluid"
              src="/img/clint-portal/icon-success.png"
              alt="Icon Success"
            />
          </figure>
          <h2 className="mb-3">Request Sent!</h2>
          <p className="text-gray font16">
            Your request has been submitted. The bank <br /> rep will contact
            you in you at the estimated <br /> date and time.
          </p>
          <ButtonIcon
            color="light"
            classnames="btn-lg mt-2 w-100"
            label="Done"
            onClick={handleRequestCall}
          />
        </Modal.Body>
      </Modal>
    </Fragment>
  );
};

export default ModalSuccessMsg;
