import React, { useContext, useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import { TabsContext } from '../contexts/tabsContext';
import ProspectSearch from './Prospects-rocket';
import PageTitle from '../components/commons/PageTitle';
import useUrlSearchParams from '../hooks/useUrlSearchParams';
import Heading from '../components/heading';
import AnimatedTabs from '../components/commons/AnimatedTabs';

const TAB_KEYS = {
  organization: 1,
  people: 2,
  domain: 3,
};
const ProspectingTabs = {
  Prospects: 1,
  Write: 2,
  Summarizer: 3,
};
const tabsData = [
  {
    tabId: TAB_KEYS.organization,
    title: 'Companies',
    byModule: 'prospecting_companies',
  },
  { tabId: TAB_KEYS.people, title: 'People', byModule: 'prospecting_peoples' },
];
const Resrcs = () => {
  const params = useUrlSearchParams();
  const history = useHistory();
  const viewType = params?.get('viewType');
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(ProspectingTabs.Prospects);
  const { activatedTab, setActivatedTab } = useContext(TabsContext);
  const [, setProspect] = useState({});
  const [activeChildTab, setActiveChildTab] = useState(TAB_KEYS.organization);

  useEffect(() => {
    if (activatedTab[location.pathname]) {
      setActiveTab(ProspectingTabs.Prospects);
    }
    return () => {
      setActiveTab(ProspectingTabs.Prospects);
      setActivatedTab({
        [location.pathname]: ProspectingTabs.Prospects,
      });
      setProspect({});
    };
  }, [viewType]);

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

  const toggleTab = (tab) => {
    if (activeChildTab !== tab.tabId) {
      setActiveChildTab(tab.tabId);
      history.replace({ search: '' });
      setActivatedTab({
        [location.pathname]: tab.tabId,
      });
    }
  };

  return (
    <>
      <PageTitle page="Prospecting" />
      <div className="resources-title mb-1">
        <Heading title="" useBc showGreeting={false}>
          <AnimatedTabs
            tabsData={tabsData}
            activeTab={activeChildTab}
            toggle={toggleTab}
            permissionCheck={true}
          />
        </Heading>
      </div>
      <ProspectSearch
        switchTab={toggle}
        activeTab={activeChildTab}
        setActiveTab={setActiveChildTab}
      />
    </>
  );
};

export default Resrcs;
