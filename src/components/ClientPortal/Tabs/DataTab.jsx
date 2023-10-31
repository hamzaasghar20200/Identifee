import React, { useContext, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { isModuleAllowed } from '../../../utils/Utils';
import { TenantContext } from '../../../contexts/TenantContext';
import TreasuryManagementReport from '../../peopleProfile/contentFeed/TreasuryManagementReport';
import { ReportTypes } from '../../reports/reports.constants';
import { PermissionsConstants } from '../../../utils/permissions.constants';
import WorkingCapitalAnalysisReport from '../../peopleProfile/contentFeed/WorkingCapitalAnalysisReport';

const DataTab = ({ organization, organizationId }) => {
  const { tenant } = useContext(TenantContext);

  const isTreasuryReportEnabled = isModuleAllowed(
    tenant?.modules,
    PermissionsConstants.Reports.Treasury
  );

  const isWorkingCapitalReportEnabled = isModuleAllowed(
    tenant?.modules,
    PermissionsConstants.Reports.WorkingCapital
  );

  const [reportResultsTab, setReportResultsTab] = useState(
    isTreasuryReportEnabled
      ? ReportTypes.Treasury
      : isWorkingCapitalReportEnabled
      ? ReportTypes.WorkingCapital
      : ''
  );
  return (
    <>
      <Row className={`m-0 py-3 border-bottom align-items-center`}>
        <Col md={6} className="px-0">
          <nav
            className="modal-report-tabs nav mx-3"
            style={{ width: 'fit-content' }}
          >
            {isTreasuryReportEnabled && (
              <a
                onClick={(e) => {
                  e.preventDefault();
                  setReportResultsTab(ReportTypes.Treasury);
                }}
                className={`mb-0 nav-item ${
                  reportResultsTab === ReportTypes.Treasury
                    ? 'cursor-default active'
                    : 'cursor-pointer'
                } nav-link mr-1`}
              >
                Treasury
              </a>
            )}

            {isWorkingCapitalReportEnabled && (
              <a
                onClick={(e) => {
                  e.preventDefault();
                  setReportResultsTab(ReportTypes.WorkingCapital);
                }}
                className={`mb-0 nav-item ${
                  reportResultsTab === ReportTypes.WorkingCapital
                    ? 'cursor-default active'
                    : 'cursor-pointer'
                } nav-link mr-1`}
              >
                Working Capital
              </a>
            )}
          </nav>
        </Col>
      </Row>
      {organizationId ? (
        <div className="position-relative">
          {reportResultsTab === ReportTypes.Treasury && (
            <TreasuryManagementReport
              organization={organization}
              currentTab={reportResultsTab}
              readOnly={true}
            />
          )}

          {reportResultsTab === ReportTypes.WorkingCapital && (
            <WorkingCapitalAnalysisReport
              organization={organization}
              readOnly={true}
            />
          )}
        </div>
      ) : (
        <div></div>
      )}
    </>
  );
};

export default DataTab;
