import React, { useContext, useEffect, useState } from 'react';
import { TabContent, TabPane } from 'reactstrap';
import { useHistory, useLocation } from 'react-router-dom';

import Heading from '../components/heading';
import { TabsContext } from '../contexts/tabsContext';
import AnimatedTabs from '../components/commons/AnimatedTabs';
import Write from './Write';
import Summarizer from './Summarizer';
import PageTitle from '../components/commons/PageTitle';
import AIAsk from './AIAsk';
import { PermissionsConstants } from '../utils/permissions.constants';
import { isModuleAllowed } from '../utils/Utils';
import { useTenantContext } from '../contexts/TenantContext';

const AIAssistTabs = {
  Write: 1,
  Summarizer: 2,
  Ask: 4,
};

const AIAssist = () => {
  const history = useHistory();
  const location = useLocation();
  const { tenant } = useTenantContext();

  const [activeTab, setActiveTab] = useState(AIAssistTabs.Write);
  const { setActivatedTab } = useContext(TabsContext);
  const [prospect, setProspect] = useState({});

  const tabsData = [
    {
      title: 'Write',
      icon: 'feed',
      tabId: AIAssistTabs.Write,
      byModule: PermissionsConstants.AIAssist.Write,
    },
    {
      title: 'Summarize',
      icon: 'description',
      tabId: AIAssistTabs.Summarizer,
      byModule: PermissionsConstants.AIAssist.Summarize,
    },
    {
      title: 'Ask',
      icon: 'person_search',
      tabId: AIAssistTabs.Ask,
      byModule: PermissionsConstants.AIAssist.Ask,
    },
  ];

  useEffect(() => {
    if (tenant?.id) {
      const isWriteAllowed = isModuleAllowed(
        tenant?.modules,
        PermissionsConstants.AIAssist.Write
      );
      const isSummarizeAllowed = isModuleAllowed(
        tenant?.modules,
        PermissionsConstants.AIAssist.Summarize
      );
      const isAskAllowed = isModuleAllowed(
        tenant?.modules,
        PermissionsConstants.AIAssist.Ask
      );
      setActiveTab(
        isWriteAllowed
          ? AIAssistTabs.Write
          : isSummarizeAllowed
          ? AIAssistTabs.Summarizer
          : isAskAllowed
          ? AIAssistTabs.Ask
          : -1
      );
    }
  }, [tenant]);

  const toggle = (tab, selectedProspect) => {
    setProspect(selectedProspect);
    if (activeTab !== tab.tabId) {
      setActiveTab(tab.tabId);
      history.replace({ search: '' });
      setActivatedTab({
        [location.pathname]: tab.tabId,
      });
    }
  };

  return (
    <>
      <PageTitle page={tabsData.find((t) => t.tabId === activeTab)?.title} />
      <div className="resources-title mb-1">
        <Heading title="" useBc showGreeting={false}>
          <AnimatedTabs
            tabsData={tabsData}
            activeTab={activeTab}
            toggle={toggle}
            permissionCheck={true}
          />
        </Heading>
      </div>
      <TabContent activeTab={activeTab}>
        <TabPane tabId={AIAssistTabs.Write}>
          <Write activeTab={activeTab} prospect={prospect} />
        </TabPane>
        <TabPane tabId={AIAssistTabs.Summarizer}>
          <Summarizer activeTab={activeTab} />
        </TabPane>
        <TabPane tabId={AIAssistTabs.Ask}>
          <AIAsk activeTab={activeTab} />
        </TabPane>
      </TabContent>
    </>
  );
};

export default AIAssist;
