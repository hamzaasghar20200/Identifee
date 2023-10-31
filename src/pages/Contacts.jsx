import React from 'react';
import { TabContent, TabPane } from 'reactstrap';
import Peoples from '../views/Deals/contacts/Peoples';

const TabTitle = ({ icon, title }) => (
  <div className="d-flex align-items-center tab-title">
    <span className="material-icons-outlined m-1 ">{icon}</span>
    <span>{title}</span>
  </div>
);

const Contacts = () => {
  const tabsData = {
    title: <TabTitle title="People" />,
    component: <Peoples />,
    tabId: 2,
  };

  return (
    <>
      <TabContent>
        <TabPane className="position-relative">{tabsData.component}</TabPane>
      </TabContent>
    </>
  );
};

export default Contacts;
