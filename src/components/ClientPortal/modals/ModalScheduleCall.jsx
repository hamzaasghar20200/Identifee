import React, { Fragment } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import ButtonIcon from '../../commons/ButtonIcon';
import MaterialIcon from '../../commons/MaterialIcon';
import Avatar from '../../Avatar';

const ModalScheduleCall = (props) => {
  const handleRequestCall = () => {
    props.onModalOpen();
  };
  const handleBankTeam = () => {
    props.onModalModalTeamBank();
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
        <Modal.Header closeButton className="p-3">
          <Modal.Title id="bank_rep">Your Bank Rep</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-3">
          <div className="modal-bank-rep">
            <div className="rep-info p-4 d-flex justify-content-between align-items-center gap-3">
              <div className="info-left d-flex justify-content-between align-items-center gap-3">
                <Avatar user={props.data} />
                <div className="text">
                  {props.data?.name && (
                    <h4 className="mb-0">{props.data?.name}</h4>
                  )}
                  {props.data?.title && (
                    <p className="text-muted mb-0">{props.data?.title}</p>
                  )}
                </div>
              </div>
              <div className="info-right d-flex justify-content-center align-items-center gap-3">
                <Button variant="light " size="lg">
                  <a href={`tel:${props.data?.phone}`}>
                    <MaterialIcon
                      clazz={'text-blue abs-center-xy'}
                      icon="call"
                      filled
                    />
                  </a>
                </Button>
                <Button variant="light " size="lg">
                  <a href={`mailto:${props.data?.email}`}>
                    <MaterialIcon
                      clazz={'text-blue abs-center-xy'}
                      icon="mail"
                      filled
                    />
                  </a>
                </Button>
              </div>
            </div>
            <div className="row gy-2">
              <div className="col-xxl-6 col-xl-6 col-lg-6 col-md-6 col-sm-6 col-xs-12">
                <ButtonIcon
                  icon="call"
                  iconClass="text-blue"
                  color="light "
                  classnames="btn-lg btn-block d-flex justify-content-center align-items-center gap-3"
                  label="Request a Call"
                  onClick={handleRequestCall}
                />
              </div>
              <div className="col-xxl-6 col-xl-6 col-lg-6 col-md-6 col-sm-6 col-xs-12">
                <ButtonIcon
                  icon="group"
                  iconClass="text-blue"
                  color="light "
                  classnames="btn-lg btn-block d-flex justify-content-center align-items-center gap-3"
                  label="Your Bank Team"
                  onClick={handleBankTeam}
                />
              </div>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </Fragment>
  );
};

export default ModalScheduleCall;
