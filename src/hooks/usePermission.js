import { useTenantContext } from '../contexts/TenantContext';
import { isModuleAllowed, isPermissionAllowed } from '../utils/Utils';

const usePermission = (permission, action = 'view', onlyModuleCheck) => {
  const { tenant } = useTenantContext();
  const isAllowed = onlyModuleCheck
    ? isModuleAllowed(tenant.modules, permission)
    : isModuleAllowed(tenant.modules, permission) &&
      isPermissionAllowed(permission, action);

  return { isAllowed };
};
export default usePermission;
