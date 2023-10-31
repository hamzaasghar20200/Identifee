import React, { useContext, useEffect, useState } from 'react';
import ButtonIcon from '../../../components/commons/ButtonIcon';
import Avatar from '../../../components/Avatar';
import { useProfileContext } from '../../../contexts/profileContext';
import { TabsContext } from '../../../contexts/tabsContext';
import { TabContent, TabPane } from 'reactstrap';
import AnimatedTabs from '../../../components/commons/AnimatedTabs';
import Heading from '../../../components/heading';
import ButtonFilterDropdown from '../../../components/commons/ButtonFilterDropdown';
import Engagement from './Engagement';
import InsightsComponent from './Insigths';
import { useHistory } from 'react-router-dom';
import CoreData from './CoreData';
import CRM from './CRM';
import { clearMenuSelection } from '../../../utils/Utils';
import { AlertMessageContext } from '../../../contexts/AlertMessageContext';
import AlertWrapper from '../../../components/Alert/AlertWrapper';
import Alert from '../../../components/Alert/Alert';
import CoreDataV2 from './CoreDataV2';
const defaultAllFilter = [
  {
    key: 'AllFilters',
    name: 'Filters',
    filter: '',
  },
  {
    key: 'CoreV2',
    name: 'Core V2',
    filter: '',
  },
];
export const NewHomePage = () => {
  const [activeTab, setActiveTab] = useState(null);
  const { activatedTab, setActivatedTab } = useContext(TabsContext);
  const { profileInfo } = useProfileContext();
  const [filterSelected, setFilterSelected] = useState(defaultAllFilter[0]);
  const [openFilter, setOpenFilter] = useState(false);
  const [isShow, setIsShow] = useState(false);
  const [filterTabs, setFilterTabs] = useState('filters');
  const [filterOptionSelected, setFilterOptionSelected] = useState(
    defaultAllFilter[0]
  );
  const { successMessage, setSuccessMessage } = useContext(AlertMessageContext);
  const history = useHistory();
  const handleFilterSelect = (item) => {
    if (activeTab === 3 && item?.name === 'Core V2') {
      setIsShow(true);
    }
    setFilterSelected(item);
  };
  const tabsData = [
    {
      tabId: 1,
      title: 'Engagement',
      key: 'engagement',
      component: <Engagement />,
    },
    {
      tabId: 2,
      title: 'Insights',
      key: 'insights',
      component: <InsightsComponent />,
    },
    {
      tabId: 3,
      title: 'Core Data',
      key: 'core_data',
      component: isShow ? <CoreDataV2 /> : <CoreData />,
    },
    {
      tabId: 4,
      title: 'CRM',
      key: 'crm',
      component: <CRM />,
    },
  ];
  useEffect(() => {
    return () => {
      setActivatedTab({
        all: 1,
      });
    };
  }, []);
  useEffect(() => {
    setActiveTab(1);
    if (activatedTab[location.pathname]) {
      setActiveTab(activatedTab[location.pathname]);
    }
    // const tab = new URLSearchParams(history.location.search).get('tab');
  }, []);
  const toggle = (tab) => {
    if (activeTab !== tab.tabId) {
      setActiveTab(tab.tabId);
      setIsShow(false);
      setActivatedTab({
        [location.pathname]: tab.tabId,
      });
    }
  };
  const handleNavigate = (e, menuItem) => {
    clearMenuSelection(document.querySelector(menuItem));
    if (e.target.name === 'Prospecting') {
      history.push('/prospecting');
    } else if (e.target.name === 'assist') {
      history.push('/ai-assist');
    } else if (e.target.name === 'Insight') {
      history.push('/companies');
    } else {
      setSuccessMessage('Identifee Chat is coming soon. Stay tuned!');
    }
  };
  return (
    <>
      <AlertWrapper>
        <Alert
          color="info"
          message={successMessage}
          setMessage={setSuccessMessage}
        />
      </AlertWrapper>
      <div className="bg-white pt-3 px-4 border-bottom border-gray-300">
        <div className="d-flex align-items-center justify-content-between mt-4">
          <div>
            <div className="d-flex align-items-center gap-2">
              <Avatar
                user={profileInfo}
                defaultSize="md"
                sizeIcon="avatar-dark"
              />
              <div>
                <p className="mb-0 font-weight-bold font-size-lg">
                  Welcome, {profileInfo?.first_name}!
                </p>
              </div>
            </div>
            <h3 className="mb-0 text-gray-800 mt-2 font-weight-normal">
              What would you like to do today?
            </h3>
          </div>
          <div className="d-flex gap-1 align-items-center">
            <ButtonIcon
              onclick={(e) => handleNavigate(e, '#menu-companies')}
              label="Create Insight"
              icon="add_circle"
              color="primary"
              name="Insight"
              classnames="border-0"
            />
            <ButtonIcon
              onclick={(e) => handleNavigate(e, '#menu-prospecting')}
              label="Prospecting"
              icon="person_search"
              name="Prospecting"
              color="white"
              classnames="px-3"
            />
            <ButtonIcon
              onclick={(e) => handleNavigate(e, '#menu-ai assist')}
              label="Al Assist"
              icon="auto_awesome"
              name="assist"
              color="white"
              classnames="px-5"
            />
            <ButtonIcon
              onclick={handleNavigate}
              label="Ask IDA"
              name="ask"
              icon="splitscreen"
              color="white"
              classnames="px-5"
            />
          </div>
        </div>
        <div className="d-flex align-items-center justify-content-between mt-5">
          <Heading pageHeaderDivider="mb-0 pb-0" useBc={true} showGreeting>
            <AnimatedTabs
              tabItemClasses="text-gray-800"
              tabsData={tabsData}
              activeTab={activeTab}
              toggle={toggle}
            />
          </Heading>
          <div>
            <ButtonFilterDropdown
              onclick={() => setIsShow(true)}
              openFilter={openFilter}
              options={defaultAllFilter}
              defaultSelection={defaultAllFilter[0]}
              btnToggleStyle="py-2 btn-sm bg-gray-300 rounded-lg"
              setOpenFilter={setOpenFilter}
              filterOptionSelected={filterOptionSelected}
              filterSelected={filterSelected}
              filterTabs={filterTabs}
              handleFilterSelect={(e, item) => handleFilterSelect(item)}
              setFilterOptionSelected={setFilterOptionSelected}
              setFilterSelected={setFilterSelected}
              setFilterTabs={setFilterTabs}
            />
          </div>
        </div>
      </div>
      <TabContent className="w-100 p-3">
        <TabPane className="position-relative p-0">
          {tabsData.find((item) => item.tabId === activeTab)?.component}
        </TabPane>
      </TabContent>
    </>
  );
};
