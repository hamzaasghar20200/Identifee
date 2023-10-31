import React, { Fragment, useState } from 'react';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import withOrganizationData from '../withOrganizationData';
import TreasuryManagementReport from '../../peopleProfile/contentFeed/TreasuryManagementReport';
import WorkingCapitalAnalysisReport from '../../peopleProfile/contentFeed/WorkingCapitalAnalysisReport';
import {
  getClientListStatus,
  staticChecklist,
} from '../../../utils/checklist.constants';
import { Card, CardBody } from 'reactstrap';
import TopicIcon from '../../commons/TopicIcon';
import ChecklistStatus from '../../checklist/ChecklistStatus';
import ChecklistItems from '../../checklist/ChecklistItems';
import MerchantReportAnalysisReport from '../../peopleProfile/contentFeed/MerchantReportAnalysisReport';

const HomeContainer = ({ children }) => {
  return (
    <div className="m-auto" style={{ maxWidth: 768 }}>
      {children}
    </div>
  );
};
const ChecklistDue = () => {
  const [checklist, setChecklist] = useState(staticChecklist);
  return (
    <HomeContainer>
      <Card className="mb-3 text-left required-action">
        <CardBody>
          <div className="d-flex align-items-center gap-1">
            <TopicIcon
              icon="message"
              iconBg="bg-primary-soft"
              iconStyle={{ width: 42, height: 42 }}
              iconClasses="font-size-em text-primary"
            />
            <h5 className="mb-0 font-weight-bold">Important Message</h5>
          </div>
          <div
            style={{ width: 520 }}
            className="pt-3 d-flex m-auto align-items-center justify-content-center text"
          >
            <p>{checklist?.clientMessage}</p>
          </div>
        </CardBody>
      </Card>
      <Card className="mb-3 text-left required-action">
        <CardBody>
          <div className="d-flex align-items-center justify-content-between gap-1">
            <div className="d-flex align-items-center gap-1">
              <TopicIcon
                icon="inventory"
                filled={false}
                iconBg="bg-primary-soft"
                iconStyle={{ width: 42, height: 42 }}
                iconClasses="font-size-2em text-primary"
              />
              <h5 className="mb-0 font-weight-bold">Required Checklist</h5>
            </div>
            <div className="d-flex align-items-center gap-1">
              <span className="fs-7">
                Checklist due: <b>09/01/2023</b>
              </span>
              <ChecklistStatus
                item={{ ...checklist, status: getClientListStatus(checklist) }}
              />
            </div>
          </div>
          <div className="pt-3 m-auto text" style={{ width: 520 }}>
            <ChecklistItems
              checklist={checklist}
              setChecklist={setChecklist}
              hideInternal={true}
            />
          </div>
        </CardBody>
      </Card>
    </HomeContainer>
  );
};

const HomeContent = ({ organization }) => {
  return (
    <Fragment>
      <div className="page-title pt-3 pl-4 pr-4 pt-4 d-flex justify-content-between align-items-center">
        <h1 className="mb-0">Home</h1>
      </div>
      <div className="dasboard p-4 position-relative">
        <Tabs
          defaultActiveKey="action"
          id="dash-tabs"
          className="mb-4 dash-tabs"
          variant={'pills'}
        >
          <Tab eventKey="action" title="Action Required">
            <ChecklistDue />
          </Tab>
          <Tab eventKey="treasury" title="Treasury">
            <HomeContainer>
              <TreasuryManagementReport
                organization={organization}
                readOnly={true}
              />
            </HomeContainer>
          </Tab>
          <Tab eventKey="working_capital" title="Working Capital">
            <HomeContainer>
              <WorkingCapitalAnalysisReport
                organization={organization}
                readOnly={true}
              />
            </HomeContainer>
          </Tab>
          <Tab eventKey="merchant" title="Merchant">
            <HomeContainer>
              <MerchantReportAnalysisReport
                organization={organization}
                readOnly={true}
              />
            </HomeContainer>
          </Tab>
        </Tabs>
      </div>
    </Fragment>
  );
};

export default withOrganizationData(HomeContent);
