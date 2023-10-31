import React, { useState } from 'react';
import MaterialIcon from '../commons/MaterialIcon';
import RightPanelModal from '../modal/RightPanelModal';
import { ManageNotifications } from './notifications.content';
import { NotificationsList } from './allNotifications';

export const Notifications = ({
  showSelectComponentModal,
  setShowSelectComponentModal,
  hideManage,
  hideViewAll,
  hideRightPanel,
}) => {
  const [showManageNotifications, setShowManageNotifications] = useState(false);
  return (
    <>
      {showSelectComponentModal ? (
        <RightPanelModal
          showModal={showSelectComponentModal}
          setShowModal={hideRightPanel}
          containerWidth={450}
          showOverlay={true}
          containerBgColor={'bg-gray-200 pb-0'}
          containerPosition={'position-fixed'}
          Title={
            <div className="d-flex py-2 align-items-center justify-content-between">
              <MaterialIcon
                icon={'notifications'}
                filled
                clazz="font-size-2xl text-primary icon-circle p-1 mr-2"
              />
              <h3 className="mb-0">Activity Log</h3>
            </div>
          }
        >
          {!showManageNotifications && (
            <NotificationsList
              showSelectComponentModal={showSelectComponentModal}
              setShowSelectComponentModal={hideRightPanel}
              detail={hideViewAll}
            />
          )}
          {showManageNotifications && (
            <ManageNotifications
              goBack={() => {
                setShowManageNotifications(false);
              }}
            />
          )}
        </RightPanelModal>
      ) : (
        <></>
      )}
    </>
  );
};
