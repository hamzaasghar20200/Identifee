import React from 'react';
import RightPanelModal from '../modal/RightPanelModal';
import EmailFields from './EmailFields';
import TaskFields from './taskFields';
import UpdateFields from './updateFields';

export const SidePenalWorkFlow = ({
  showSelectComponentModal,
  setShowSelectComponentModal,
  isFieldName,
}) => {
  return (
    <RightPanelModal
      showModal={showSelectComponentModal}
      setShowModal={setShowSelectComponentModal}
      containerWidth={390}
      showOverlay={true}
      containerBgColor={'bg-gray-200 pb-0'}
      containerPosition={'position-fixed'}
      Title={
        <div className="d-flex py-2 align-items-center">
          <h3 className="mb-0">{isFieldName}</h3>
        </div>
      }
    >
      {isFieldName === 'Create Email Notification' && <EmailFields />}
      {isFieldName === 'Add WorkFlow Task' && <TaskFields />}
      {isFieldName === 'Update Field' && <UpdateFields />}
    </RightPanelModal>
  );
};
