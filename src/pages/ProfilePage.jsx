import React, { useContext, useEffect, useState } from 'react';
import { TabContent, TabPane } from 'reactstrap';
import { useHistory } from 'react-router';
import Heading from '../components/heading';
import { TabsContext } from '../contexts/tabsContext';
import Security from './Security';
import Profile from './Profile';
import AnimatedTabs from '../components/commons/AnimatedTabs';

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState(1);
  const history = useHistory();
  const { activatedTab, setActivatedTab } = useContext(TabsContext);

  useEffect(() => {
    if (activatedTab[location.pathname]) {
      setActiveTab(activatedTab[location.pathname]);
    }
    const tab = new URLSearchParams(history.location.search).get('tab');
    if (tab === 'Security') {
      setActiveTab(2);
    }
  }, []);

  const tabsData = [
    {
      title: 'Profile',
      component: <Profile />,
      tabId: 1,
    },
    {
      title: 'Security',
      component: <Security />,
      tabId: 2,
    },
  ];

  const toggle = (tab) => {
    if (activeTab !== tab.tabId) {
      setActiveTab(tab.tabId);

      setActivatedTab({
        [location.pathname]: tab.tabId,
      });
    }
  };

  return (
    <>
      <Heading pageHeaderDivider="mb-0" useBc={true} showGreeting>
        <div className="row justify-content-center">
          <div className="col-lg-9">
            <AnimatedTabs
              activeTab={activeTab}
              tabsData={tabsData}
              toggle={toggle}
            />
          </div>
        </div>
      </Heading>
      <TabContent>
        <TabPane className="position-relative">
          {tabsData.find((item) => item.tabId === activeTab)?.component}
        </TabPane>
      </TabContent>
    </>
  );
};

export default ProfilePage;
