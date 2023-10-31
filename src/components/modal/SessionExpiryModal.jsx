import { useCallback, useMemo, useState } from 'react';
import { overflowing, setIdfToken } from '../../utils/Utils';
import SimpleModalCreation from './SimpleModalCreation';
import AuthService from '../../services/auth.service';
const SessionExpiryModal = ({ show, setShow }) => {
  const [loading, setLoading] = useState(false);

  const handleCancel = () => {
    AuthService.logout();
    setShow(false);
    document.removeEventListener('visibilitychange', () => {});
    document.location.href = '/login';
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const { access_token, refresh_token, expires } =
        await AuthService.refreshToken();
      setIdfToken(
        JSON.stringify({
          access_token,
          refresh_token,
          expires,
        })
      );
      setShow(false);
      window.location.reload();
    } catch (e) {
      console.log(e);
      handleCancel();
    } finally {
      setLoading(false);
    }
  };

  return (
    <SimpleModalCreation
      modalTitle="Session Expiring"
      open={show}
      bankTeam={false}
      isLoading={loading}
      saveButton="Refresh"
      handleSubmit={handleSubmit}
      onHandleCloseModal={() => {
        overflowing();
        handleCancel();
      }}
    >
      <p>Your session will expire soon. Do you want to refresh your session?</p>
    </SimpleModalCreation>
  );
};

const useSessionExpiryModal = () => {
  const [showModal, setShowModal] = useState(false);

  const SessionExpiryModalCallback = useCallback(() => {
    return <SessionExpiryModal show={showModal} setShow={setShowModal} />;
  }, [showModal, setShowModal]);

  return useMemo(
    () => ({
      setShowModal,
      SessionExpiryModal: SessionExpiryModalCallback,
    }),
    [setShowModal, SessionExpiryModalCallback]
  );
};

export default useSessionExpiryModal;
