import { createContext, useContext, useEffect, useState } from 'react';
import roleService from '../services/role.service';
import { useProfileContext } from './profileContext';

export const PermissionsContext = createContext({
  permissionChanges: [],
  setPermissionChanges: () => null,
});

export const newPermissionsProvider = (props) => {
  const [permissionChanges, setPermissionChanges] = useState([]);
  const { profileInfo } = useProfileContext();

  useEffect(() => {
    const getPermissions = async () => {
      const permissionsGet = await roleService.getPermissionsByRole(
        profileInfo?.role?.id
      );
      setPermissionChanges(permissionsGet);
    };

    if (profileInfo?.role?.id) {
      getPermissions();
    }
  }, [profileInfo]);

  return (
    <PermissionsContext.Provider
      value={{ permissionChanges, setPermissionChanges }}
    >
      {props.children}
    </PermissionsContext.Provider>
  );
};

export const useNewPermissionContext = () => {
  return useContext(PermissionsContext);
};
