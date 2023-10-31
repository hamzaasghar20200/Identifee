import React from 'react';
import { TabContent, TabPane } from 'reactstrap';
import Organizations from '../views/Deals/contacts/Organizations';

const TabTitle = ({ icon, title }) => (
  <div className="d-flex align-items-center tab-title">
    <span className="material-icons-outlined m-1 ">{icon}</span>
    <span>{title}</span>
  </div>
);

const OrganizationsPage = () => {
  const tabsData = {
    title: <TabTitle title="Organizations" />,
    component: <Organizations />,
    tabId: 1,
  };

  return (
    <>
      <TabContent>
        <TabPane className="position-relative">{tabsData.component}</TabPane>
      </TabContent>
    </>
  );
};

export default OrganizationsPage;
