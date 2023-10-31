import { useState, useEffect } from 'react';
import { getIdfToken } from '../utils/Utils';
import AuthService from '../services/auth.service';
import { useAppContext } from '../contexts/appContext';
const WARNING_THRESHOLD_SECONDS = 300; // 5 minutes

const useCheckTokenValidity = (showSessionExpiredModal) => {
  const { isAuthenticated } = useAppContext();

  const [alertShown, setAlertShown] = useState(false);

  const localStorageToken = getIdfToken(true) || {};
  const expiryTime = Number(localStorageToken?.expires || 0);

  const isTokenExpired = () => {
    const expirationTimeInSeconds = (expiryTime - Date.now()) / 1000;
    return expirationTimeInSeconds < WARNING_THRESHOLD_SECONDS;
  };

  useEffect(() => {
    if (isAuthenticated || AuthService.isTokenValid()) {
      const checkTokenExpiration = () => {
        if (isTokenExpired()) {
          // just additional check to avoid modal opening more than once.
          if (!alertShown) {
            setAlertShown(true);
            showSessionExpiredModal(true);
          }
        }
      };

      // when tab gets active or browser gets resumed
      document.addEventListener('visibilitychange', checkTokenExpiration);

      return () => {
        document.removeEventListener('visibilitychange', checkTokenExpiration);
      };
    }

    return undefined;
  }, [isAuthenticated]);

  return { isAuthenticated };
};

export default useCheckTokenValidity;
