import React, { createContext, useContext, useEffect, useState } from 'react';
import authHeader from '../services/auth-header';
import { useAppContext } from './appContext';

export const ModuleContext = createContext({
  moduleName: {},
  setModuleName: () => null,
});
export const ModuleProvider = (props) => {
  const defaultNames = {
    organization: { singular: 'Company', plural: 'Companies' },
    contact: { singular: 'Contact', plural: 'Contacts' },
    deal: { singular: 'Pipeline', plural: 'Pipelines' },
    product: { singular: 'Product', plural: 'Products' },
    task: { singular: 'Task', plural: 'Tasks' },
    call: { singular: 'Call', plural: 'Calls' },
    event: { singular: 'Event', plural: 'Events' },
  };
  const [moduleName, setModuleName] = useState();
  const [moduleMap, setModuleMap] = useState({ ...defaultNames });
  const { isAuthenticated } = useAppContext();
  const page = 1;
  const limit = 7;

  const getModuleNames = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/modules?page=${page}&limit=${limit}`,
        {
          headers: authHeader(),
        }
      );
      const data = await response.json();
      let updatedModuleNames = { ...defaultNames };
      for (const module of data.data) {
        updatedModuleNames = {
          ...updatedModuleNames,
          [module.name]: {
            singular: module.singularName,
            plural: module.pluralName,
          },
        };
      }
      setModuleMap(updatedModuleNames);
      setModuleName(data);
    } catch (error) {
      console.error('Error fetching modules:', error);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      getModuleNames();
    }
  }, [isAuthenticated]);

  return (
    <ModuleContext.Provider
      value={{ moduleName, setModuleName, getModuleNames, moduleMap }}
    >
      {props.children}
    </ModuleContext.Provider>
  );
};

export const useModuleContext = () => {
  return useContext(ModuleContext);
};
