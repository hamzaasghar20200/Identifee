import React, { useContext, useState } from 'react';
import AnimatedTabs from '../components/commons/AnimatedTabs';
import { TabsContext } from '../contexts/tabsContext';
import ModuleFields from './ModuleFields';
import { FieldTypeEnum } from '../components/fields/fields.constants';
import ChecklistFields from './ChecklistFields';
import useIsTenant from '../hooks/useIsTenant';
import { useModuleContext } from '../contexts/moduleContext';

const FieldsTab = {
  ModuleFields: 1,
  PipelineFields: 2,
  ChecklistFields: 3,
};

const Fields = () => {
  const { moduleMap } = useModuleContext();
  const [activeTabId, setActiveTabId] = useState(FieldsTab.ModuleFields);
  const { setActivatedTab } = useContext(TabsContext);
  const { isExcelBank } = useIsTenant();
  const toggle = (tabId) => {
    if (activeTabId !== tabId) {
      setActiveTabId(tabId);
      setActivatedTab({
        [location.pathname]: tabId,
      });
    }
  };

  const tabsData = [
    {
      title: 'Module Fields',
      tabId: FieldsTab.ModuleFields,
      byModule: 'settings_fields_module_fields',
    },
    {
      title: `${
        moduleMap.deal === undefined ? '' : moduleMap.deal.singular
      } Fields`,
      tabId: FieldsTab.PipelineFields,
      byModule: 'settings_fields_pipeline_fields',
    },
    {
      title: 'Checklist Fields',
      tabId: FieldsTab.ChecklistFields,
      clazz: isExcelBank ? '' : 'd-none',
      byModule: 'settings_fields_checklist_fields',
    },
  ];

  return (
    <>
      <div className="mb-2">
        <AnimatedTabs
          tabsData={tabsData}
          activeTab={activeTabId}
          toggle={(tab) => toggle(tab.tabId)}
        />
      </div>
      {activeTabId === FieldsTab.ModuleFields && (
        <ModuleFields filter={(f) => f.type !== FieldTypeEnum.deal} />
      )}
      {activeTabId === FieldsTab.PipelineFields && (
        <ModuleFields filter={(f) => f.type === FieldTypeEnum.deal} />
      )}
      {activeTabId === FieldsTab.ChecklistFields && <ChecklistFields />}
    </>
  );
};

export default Fields;
