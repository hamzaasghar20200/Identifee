import { useContext, createContext, useState, useEffect } from 'react';
import TagManager from 'react-gtm-module';
import { getIdfToken } from '../utils/Utils';

export const AppContext = createContext({
  isAuthenticated: false,
  userHasAuthenticated: () => null,
});

export const AppProvider = (props) => {
  const isAuth = !!getIdfToken();

  const [isAuthenticated, userHasAuthenticated] = useState(isAuth);

  useEffect(() => {
    if (isAuth) {
      TagManager.dataLayer({
        dataLayer: {
          event: 'TEST',
        },
      });
    }
  }, [isAuth]);

  return (
    <AppContext.Provider value={{ isAuthenticated, userHasAuthenticated }}>
      {props.children}
    </AppContext.Provider>
  );
};

export function useAppContext() {
  return useContext(AppContext);
}
