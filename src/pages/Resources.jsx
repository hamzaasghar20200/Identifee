import React, { useContext, useEffect, useState } from 'react';
import { TabContent, TabPane } from 'reactstrap';
import { useLocation } from 'react-router-dom';

import Categories from '../views/settings/Resources/Categories';
import Heading from '../components/heading';
import ManageLessons from '../pages/ManageLessons';
import { TabsContext } from '../contexts/tabsContext';
import Courses from '../views/settings/Resources/Courses';
import QuizConfigurationForm from '../components/quizConfiguration/QuizConfigurationForm';
import AnimatedTabs from '../components/commons/AnimatedTabs';
import PageTitle from '../components/commons/PageTitle';
import userService from '../services/user.service';

const Resources = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(1);
  const [itemsOption, setItemsOptions] = useState([]);
  const { activatedTab, setActivatedTab } = useContext(TabsContext);

  useEffect(() => {
    if (activatedTab[location.pathname]) {
      setActiveTab(activatedTab[location.pathname]);
    }
  }, []);

  const tabsData = [
    {
      title: 'Lessons',
      component: <ManageLessons />,
      icon: 'list_alt',
      tabId: 1,
      permission: {
        collection: 'lessons',
        action: 'view',
      },
    },
    {
      title: 'Courses',
      component: <Courses />,
      icon: 'summarize',
      tabId: '3',
      permission: {
        collection: 'courses',
        action: 'view',
      },
    },
    {
      title: 'Categories',
      component: <Categories />,
      icon: 'category',
      tabId: 2,
      permission: {
        collection: 'categories',
        action: 'view',
      },
    },
    {
      title: 'Customization',
      component: <QuizConfigurationForm />,
      tabId: 4,
    },
  ];
  const getCurrentUser = async () => {
    try {
      const user = await userService.getUserInfo();

      if (user.role.owner_access) {
        setItemsOptions(tabsData);
      } else {
        const newItems = tabsData.filter(
          (item) => item.title !== 'Customization'
        );

        setItemsOptions(newItems);
      }
    } catch (err) {
      console.error(err);
    }
  };
  const toggle = (tab) => {
    if (activeTab !== tab.tabId) {
      setActiveTab(tab.tabId);

      setActivatedTab({
        [location.pathname]: tab.tabId,
      });
    }
  };
  useEffect(() => {
    getCurrentUser();
  }, []);
  return (
    <>
      <PageTitle page={itemsOption.find((t) => t.tabId === activeTab)?.title} />
      <Heading title="Resources" useBc showGreeting={false}>
        <AnimatedTabs
          tabsData={itemsOption}
          activeTab={activeTab}
          toggle={toggle}
          permissionCheck={true}
        />
      </Heading>
      <TabContent>
        <TabPane className="position-relative">
          {tabsData.find((item) => item.tabId === activeTab)?.component}
        </TabPane>
      </TabContent>
    </>
  );
};

export default Resources;
