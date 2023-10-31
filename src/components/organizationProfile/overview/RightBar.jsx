import React from 'react';

import ProspectLookup from './ProspectLookup';
import { isModuleAllowed, isPermissionAllowed } from '../../../utils/Utils';
import WriteAI from './WriteAI';
import PreCallPlanPanel from './PreCallPlanPanel';
import RightBarLoader from '../../loaders/RightBarLoader';
import { useTenantContext } from '../../../contexts/TenantContext';

const RightBar = ({ profileInfo, isPeople, isLoading, moduleName }) => {
  const rightBarOptions = [
    {
      id: 'precallPlan',
      component: <PreCallPlanPanel />,
      module: moduleName,
    },
    {
      id: 'prospectLookup',
      component: <ProspectLookup />,
      module: 'prospecting_prospect_lookup_sidebar',
      permission: {
        collection: 'prospects',
        action: 'view',
      },
    },
    {
      id: 'write',
      component: <WriteAI />,
      module: 'ai_assist_write',
    },
  ];
  const { tenant } = useTenantContext();
  return (
    <div className="right-sidebar insights-bar border-left">
      <div className="splitted-content-mini splitted-content-mini-right splitted-content-bordered pb-3 pt-4 sticky-top z-index-2 w-auto">
        <ul className="nav nav-compact-icon list-unstyled-py-3 nav-compact-icon-circle justify-content-center">
          {!isLoading ? (
            <li>
              {rightBarOptions.map((option) => {
                const { id, component } = option;
                if (isPeople && id === 'industryinsights') {
                  return [];
                }

                return (
                  <>
                    {option.permission
                      ? isPermissionAllowed(
                          option.permission.collection,
                          option.permission.action
                        ) &&
                        isModuleAllowed(tenant?.modules, option.module) && (
                          <div key={id}>
                            {React.cloneElement(component, {
                              profileInfo,
                            })}
                          </div>
                        )
                      : isModuleAllowed(tenant?.modules, option.module) && (
                          <div key={id}>
                            {React.cloneElement(component, {
                              profileInfo,
                            })}
                          </div>
                        )}
                  </>
                );
              })}
            </li>
          ) : (
            <li>
              <RightBarLoader count={3} />
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default RightBar;
