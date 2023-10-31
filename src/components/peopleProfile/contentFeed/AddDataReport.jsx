import React, { useContext, useEffect, useState } from 'react';
import { Row, Col } from 'react-bootstrap';

import { CardSection } from '../../layouts/CardLayout';
import { DemoTenants, ReportTypes } from '../../reports/reports.constants';
import { TenantContext } from '../../../contexts/TenantContext';
import TreasuryManagementReport from './TreasuryManagementReport';
import WorkingCapitalAnalysisReport from './WorkingCapitalAnalysisReport';
import { isModuleAllowed } from '../../../utils/Utils';
import { PermissionsConstants } from '../../../utils/permissions.constants';
import ButtonFilterDropdown from '../../commons/ButtonFilterDropdown';
import useIsTenant from '../../../hooks/useIsTenant';
import MerchantReportAnalysisReport from './MerchantReportAnalysisReport';

const Report = ({ children, className }) => (
  <Col xs={12} className={`${className || `p-0`}`}>
    {children}
  </Col>
);

const AddDataReport = ({ organizationId, profileInfo, isPrincipalOwner }) => {
  const { tenant } = useContext(TenantContext);

  const isTreasuryReportEnabled = isModuleAllowed(
    tenant?.modules,
    PermissionsConstants.ModulesReportNames.Treasury
  );

  const isWorkingCapitalReportEnabled = isModuleAllowed(
    tenant?.modules,
    PermissionsConstants.ModulesReportNames.WorkingCapital
  );

  const isMerchantReportEnabled = isModuleAllowed(
    tenant?.modules,
    PermissionsConstants.ModulesReportNames.Merchant
  );

  const [reportResultsTab, setReportResultsTab] = useState(
    isTreasuryReportEnabled
      ? ReportTypes.Treasury
      : isWorkingCapitalReportEnabled
      ? ReportTypes.WorkingCapital
      : isMerchantReportEnabled
      ? ReportTypes.Merchant
      : ''
  );
  const [showResults, setShowResults] = useState(false);
  useEffect(() => {
    setShowResults(true);
  }, []);

  const { isExcelBank } = useIsTenant();
  const [demoTenant, setDemoTenant] = useState(
    isExcelBank ? DemoTenants[0] : {}
  );
  return (
    <>
      <CardSection className="m-0 p-0">
        {isExcelBank && (
          <div className="py-1 px-3 text-center w-100 justify-content-center">
            <div className="d-flex align-items-center shadow p-1 mb-2 bg-gray-200 card justify-content-center gap-2">
              <ButtonFilterDropdown
                buttonText="Select"
                filterOptionSelected={demoTenant}
                options={DemoTenants}
                withTooltip={true}
                handleFilterSelect={(e, item) => {
                  setDemoTenant(item);
                }}
              />
            </div>
          </div>
        )}
        {showResults && (
          <Report className={`p-0`}>
            <Row className={`m-0 pt-0 align-items-center`}>
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

                  {isMerchantReportEnabled && (
                    <a
                      onClick={(e) => {
                        e.preventDefault();
                        setReportResultsTab(ReportTypes.Merchant);
                      }}
                      className={`mb-0 nav-item ${
                        reportResultsTab === ReportTypes.Merchant
                          ? 'cursor-default active'
                          : 'cursor-pointer'
                      } nav-link mr-1`}
                    >
                      Merchant
                    </a>
                  )}
                </nav>
              </Col>
              <Col
                className={`text-right d-flex align-items-center justify-content-end pr-3`}
              ></Col>
            </Row>
            <div className="position-relative border-top mt-3">
              {reportResultsTab === ReportTypes.Treasury && (
                <TreasuryManagementReport
                  organization={profileInfo}
                  currentTab={reportResultsTab}
                  selectedTenant={demoTenant}
                  readOnly={false}
                />
              )}
              {reportResultsTab === ReportTypes.WorkingCapital && (
                <WorkingCapitalAnalysisReport
                  organization={profileInfo}
                  currentTab={reportResultsTab}
                  selectedTenant={demoTenant}
                  readOnly={false}
                />
              )}
              {reportResultsTab === ReportTypes.Merchant && (
                <MerchantReportAnalysisReport
                  organization={profileInfo}
                  currentTab={reportResultsTab}
                  selectedTenant={demoTenant}
                  readOnly={false}
                />
              )}
            </div>
          </Report>
        )}
      </CardSection>
    </>
  );
};

export default AddDataReport;
