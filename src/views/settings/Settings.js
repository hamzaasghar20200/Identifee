import React, { useContext, useEffect } from 'react';
import SettingCardItem from '../../components/commons/SettingCardItem';
import { BRANDING_LABEL } from '../../utils/constants';
import { TenantContext } from '../../contexts/TenantContext';
import {
  isMatchInCommaSeperated,
  isPermissionAllowed,
} from '../../utils/Utils';
import { useProfileContext } from '../../contexts/profileContext';
import { useModuleContext } from '../../contexts/moduleContext';

const settingsValues = [
  {
    id: 1,
    title: 'Profile',
    label: 'profile',
    icon: 'account_circle',
    path: '/profile',
    requiredOwnerAccess: true,
    requiredAdminAccess: true,
    requiredAppAccess: true,
  },
  {
    id: 8,
    title: BRANDING_LABEL,
    icon: 'palette',
    label: 'branding',
    path: '/branding',
    requiredAdminAccess: true,
    requiredOwnerAccess: true,
  },

  {
    id: 5,
    title: 'Users and Controls',
    icon: 'group_add',
    label: 'users_and_controls',
    path: '/users',
    item: {
      action: 'view',
      collection: 'users',
    },
    requiredAdminAccess: true,
    requiredOwnerAccess: true,
  },
  {
    id: 4,
    title: 'Notifications',
    icon: 'notifications',
    label: 'notifications',
    path: '/notifications',
    requiredAdminAccess: false,
    requiredOwnerAccess: true,
    requiredAppAccess: true,
  },
  {
    id: 9,
    title: 'Products',
    icon: 'app_registration',
    label: 'products',
    path: '/products',
    item: {
      action: 'view',
      collection: 'products',
    },
    requiredAdminAccess: false,
    requiredOwnerAccess: true,
  },
  {
    id: 7,
    title: 'Learn',
    icon: 'school',
    path: '/learn',
    label: 'learn',
    item: {
      action: 'view',
      collection: 'lessons',
    },
    requiredAdminAccess: false,
    requiredOwnerAccess: true,
  },
  {
    id: 12,
    title: 'Pipelines and Stages',
    icon: 'view_carousel',
    path: '/pipelines-and-stages',
    label: 'pipeline_and_stages',
    item: {
      action: 'view',
      collection: 'pipelines',
    },
    requiredAdminAccess: false,
    requiredOwnerAccess: true,
  },
  {
    id: 13,
    title: 'Fields',
    icon: 'edit_note',
    path: '/fields',
    label: 'fields',
    item: {
      action: 'view',
      collection: 'fields',
    },
    requiredAdminAccess: false,
    requiredOwnerAccess: true,
  },
  {
    id: 11,
    title: 'Integrations',
    icon: 'view_comfy_alt',
    path: '/integrations',
    label: 'integrations',
    requiredAdminAccess: false,
    requiredOwnerAccess: true,
  },
  {
    id: 10,
    title: 'Bulk Import',
    icon: 'upload',
    path: '/bulk-import',
    label: 'data_mapper',
    item: {
      action: 'view',
      collection: 'contacts',
      tenantName: 'contacts',
    },
    requiredAdminAccess: false,
    requiredOwnerAccess: true,
  },
];
const Settings = () => {
  const { moduleMap } = useModuleContext();

  useEffect(() => {}, [moduleMap.deal]);
  const { tenant } = useContext(TenantContext);
  const settingFiltered = settingsValues.filter((setting) => {
    const settingsInput = 'settings_' + setting.label;
    return (
      !tenant.modules ||
      tenant.modules === '*' ||
      isMatchInCommaSeperated(tenant.modules, settingsInput)
    );
  });
  const { profileInfo } = useProfileContext();
  return (
    <>
      {moduleMap.deal && (
        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 font-weight-medium">
          {settingFiltered.map((item) => (
            <>
              {item.permissions ? (
                isPermissionAllowed(
                  item.permissions.collection,
                  item.permissions.action
                ) && (
                  <>
                    <div className="col mb-5">
                      <SettingCardItem
                        moduleMap={moduleMap.deal.singular}
                        item={item}
                        url={`/settings${item.path}`}
                      />
                    </div>
                  </>
                )
              ) : (
                <>
                  {!profileInfo?.role?.admin_access &&
                  profileInfo?.role?.owner_access ? (
                    <div className="col mb-5">
                      <SettingCardItem
                        moduleMap={moduleMap.deal.singular}
                        item={item}
                        url={`/settings${item.path}`}
                      />
                    </div>
                  ) : (
                    ''
                  )}
                  {profileInfo?.role?.admin_access &&
                  item.requiredAdminAccess === true ? (
                    <div className="col mb-5">
                      <SettingCardItem
                        moduleMap={moduleMap.deal.singular}
                        item={item}
                        url={`/settings${item.path}`}
                      />
                    </div>
                  ) : (
                    ''
                  )}
                  {profileInfo?.role?.app_access &&
                  !profileInfo?.role?.owner_access &&
                  !profileInfo?.role?.admin_access &&
                  item.requiredAppAccess === true ? (
                    <div className="col mb-5">
                      <SettingCardItem
                        moduleMap={moduleMap.deal.singular}
                        item={item}
                        url={`/settings${item.path}`}
                      />
                    </div>
                  ) : (
                    ''
                  )}
                </>
              )}
            </>
          ))}
        </div>
      )}
    </>
  );
};

export default Settings;
