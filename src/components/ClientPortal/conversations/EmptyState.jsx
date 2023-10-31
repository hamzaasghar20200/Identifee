import React, { Fragment } from 'react';
import ButtonIcon from '../../commons/ButtonIcon';

const EmptyState = ({ showConvGrid }) => {
  return (
    <Fragment>
      <div className="conversation d-flex flex-column align-items-center vh-100 justify-content-center p-3">
        <div className="card text-center bg-transparent border-0 shadow-none">
          <div className="card-body d-flex flex-column justify-content-center align-items-center">
            <img
              className="img-fluid w-100 mb-3"
              src="/img/clint-portal/no-conv-skaleton.png"
              alt="No Coversation yet"
            />
            <h3>No Conversations Yet</h3>
            <p className="card-text">
              You don’t have any started conversations. Click the <br /> button
              below and start a new one.
            </p>
            <ButtonIcon
              icon="add_circle"
              iconClass="font-size-3xl"
              color="primary "
              classnames="d-flex align-items-center w-75 gap-2 rounded-3 font-size-lg"
              label="New Conversation"
              onClick={showConvGrid}
            />
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default EmptyState;
