import { useState } from 'react';
import { Notifications } from '../Notifcations/notifications';
import { overflowing } from '../../utils/Utils';

export default function NotificationsModal({ hideManage, hideViewAll }) {
  const [modal, setModal] = useState(false);

  const toggle = () => {
    return setModal(!modal);
  };

  return (
    <>
      <section className="ml-auto mr-1" onClick={toggle}>
        <span className="material-icons-outlined text-gray-700 icon-hover-bg font-size-xl2 cursor-pointer">
          notifications
        </span>
      </section>
      {modal && (
        <Notifications
          showSelectComponentModal={modal}
          setShowSelectComponentModal={setModal}
          hideManage={hideManage}
          hideViewAll={hideViewAll}
          hideRightPanel={() => {
            overflowing();
            setModal(false);
          }}
        />
      )}
    </>
  );
}
