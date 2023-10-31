import Alert from '../../Alert/Alert';
import AlertWrapper from '../../Alert/AlertWrapper';
import React, { useContext, useEffect, useState } from 'react';
import { AlertMessageContext } from '../../../contexts/AlertMessageContext';
import ReportDragDrop from '../../reports/ReportDragDrop';
import IdfTooltip from '../../idfComponents/idfTooltip';
import ButtonIcon from '../../commons/ButtonIcon';
import Skeleton from 'react-loading-skeleton';
import AddNewReportButton from '../../reports/AddNewReportButton';
import OrganizationService from '../../../services/organization.service';
import { ActionTypes, ReportTypes } from '../../reports/reports.constants';
import {
  getCycleDate,
  getReportName,
} from '../../reports/reports.helper.functions';
import GenerateMerchantReportModal from '../../reports/GenerateMerchantReportModal';
import { ProcessingSummary } from '../../reports/Merchants/ProcessSummary';
import { MerchantFees } from '../../reports/Merchants/MerchantFees';
import ReportBlocksSkeleton from '../../loaders/ReportBlocksSkeleton';
import reportService from '../../../services/report.service';
import DownloadReportDropdown from '../../reports/DownloadReportDropdown';
import ButtonFilterDropdown from '../../commons/ButtonFilterDropdown';
import ReportCover from '../../reports/ReportCover';
import ReportBlockWrapper from '../../reports/ReportBlockWrapper';
import { useProfileContext } from '../../../contexts/profileContext';
import ReportDropdownItem from '../../reports/ReportDropdownItem';

const DOWNLOAD_OPTIONS = [
  {
    id: 1,
    icon: 'picture_as_pdf',
    key: 'downloadAsPdf',
    name: 'PDF Download',
  },
];
const totalPages = 3;

const MerchantReportAnalysisReport = ({
  organization,
  readOnly,
  selectedTenant,
}) => {
  const { profileInfo } = useProfileContext();
  const { successMessage, setSuccessMessage, errorMessage, setErrorMessage } =
    useContext(AlertMessageContext);
  const [rptGenerated, setRptGenerated] = useState(false);
  const [loadingReport, setLoadingReport] = useState(false);
  const [report, setReport] = useState({});
  const [pastReports, setPastReports] = useState([]);
  const [loadingPastReports, setLoadingPastReports] = useState(false);
  const [selectedRpt, setSelectedRpt] = useState({});
  const [startDownload, setStartDownload] = useState(false);
  const [openGenerateReport, setOpenGenerateReport] = useState(false);
  const [isEdited, setIsEdited] = useState(false);

  const getReports = async (dontSelect) => {
    setLoadingPastReports(true);
    setLoadingReport(true);
    try {
      const { data } = await OrganizationService.getReports(organization.id, {
        limit: 100,
        page: 1,
        type: ReportTypes.Merchant,
      });
      if (data?.data?.length > 0) {
        const reports = data.data.map((rpt) => {
          const rptObject = rpt.manualInput;
          return {
            key: rpt.reportId,
            name: rpt?.name,
            isManual: true,
            ...rptObject,
            customElement: (
              <ReportDropdownItem name={rpt?.name} item={rptObject} />
            ),
            createdById: rpt.createdById,
          };
        });
        const sortedReports = reports.slice().sort((a, b) => {
          const dateA = new Date(a.reportDate);
          const dateB = new Date(b.reportDate);

          return dateB - dateA;
        });
        setRptGenerated(true);
        setPastReports(sortedReports);
        if (!dontSelect) {
          const firstReport = sortedReports.length ? sortedReports[0] : {};
          if (firstReport?.key) {
            setSelectedRpt(firstReport);
          }
        }
      }
    } catch (e) {
      console.log(e);
    } finally {
      setLoadingPastReports(false);
      setLoadingReport(false);
    }
  };

  const displayValuesInView = (data, manualInput, insightsData) => {
    setReport({
      key: data.reportId,
      createdById: data.createdById,
      ...manualInput,
      name: data?.name,
      reportDate: getCycleDate(data.date),
    });
    setRptGenerated(true);
  };
  const getReportById = async (selectedReport) => {
    setReport({});
    try {
      const data = await reportService.getReport(selectedReport.key);
      const { manualInput } = data;
      displayValuesInView(data, manualInput, {});
      setRptGenerated(true);
    } catch (e) {
      console.log(e);
    }
  };

  const handleManualReport = () => {
    setSelectedRpt({});
    setIsEdited(false);
    setRptGenerated(false);
  };
  const handleEditReport = () => {
    setReport({});
    setIsEdited(true);
    getReportById(selectedRpt);
    setOpenGenerateReport(true);
  };

  const handleGenerateReport = (selectedReport, action, newOrUpdatedReport) => {
    setOpenGenerateReport(false);
    setRptGenerated(true);
    setLoadingReport(true);

    if (action === ActionTypes.REMOVE) {
      const newReports = [
        ...pastReports.filter((rpt) => rpt.key !== selectedReport.key),
      ];
      const latestReport = newReports.reverse();
      const reportsAvailable = latestReport.length > 0;
      setPastReports(reportsAvailable ? latestReport : []);
      setSelectedRpt(reportsAvailable ? latestReport.at(-1) : {});
      setRptGenerated(false);
      setLoadingReport(false);
    } else {
      setRptGenerated(true);
      if (selectedReport) {
        try {
          if ('key' in selectedRpt) {
            const newReports = [
              ...pastReports.map((rpt) =>
                rpt.key === selectedRpt.key
                  ? {
                      ...rpt,
                      name: getReportName(selectedReport),
                      createdById: profileInfo.id,
                      customElement: (
                        <ReportDropdownItem
                          name={rpt?.name}
                          item={rpt.manualInput}
                        />
                      ),
                    }
                  : rpt
              ),
            ];
            const latestReport = {
              name: newOrUpdatedReport?.name,
              reportDate: newOrUpdatedReport?.date,
            };
            const pastReportObject = {
              key: newOrUpdatedReport.reportId,
              name: getReportName(latestReport),
              isManual: true,
              createdById: profileInfo.id,
              ...newOrUpdatedReport?.manualInput,
              customElement: (
                <ReportDropdownItem
                  name={newOrUpdatedReport?.name}
                  item={newOrUpdatedReport.manualInput}
                />
              ),
            };
            setPastReports(newReports.reverse());
            setReport(pastReportObject);
            setSelectedRpt(newReports.find((r) => r.key === selectedRpt.key));
          } else {
            const latestReport = {
              name: newOrUpdatedReport?.name,
              reportDate: newOrUpdatedReport?.date,
            };
            const pastReportObject = {
              key: newOrUpdatedReport.reportId,
              name: getReportName(latestReport),
              isManual: true,
              createdById: profileInfo.id,
              ...newOrUpdatedReport?.manualInput,
              customElement: (
                <ReportDropdownItem
                  name={newOrUpdatedReport?.name}
                  item={newOrUpdatedReport.manualInput}
                />
              ),
            };
            const newReports = [...pastReports, pastReportObject];
            setPastReports(newReports.reverse());
            setSelectedRpt(pastReportObject);
          }
        } catch (e) {
          console.log(e);
        } finally {
          setLoadingReport(false);
        }
      }
    }
  };

  const handleGenerateManuallyReport = () => {
    setReport({
      name: organization.name,
      reportDate: getCycleDate(new Date().toISOString()),
    });
    setOpenGenerateReport(true);
    if (pastReports.length > 0) {
      pastReports.sort(
        (a, b) => new Date(b.reportDate) - new Date(a.reportDate)
      );
      const latestObject = pastReports[0];
      setReport({
        mid: latestObject?.mid,
      });
    }
  };
  useEffect(() => {
    if (selectedRpt?.key) {
      getReportById(selectedRpt);
    }
  }, [selectedRpt?.key]);
  useEffect(() => {
    if (organization?.id) {
      getReports();
    }
  }, [organization?.id]);
  return (
    <>
      <AlertWrapper className="alert-position">
        <Alert
          color="info"
          message={successMessage}
          setMessage={setSuccessMessage}
          time={8000}
        />
        <Alert
          color="danger"
          message={errorMessage}
          setMessage={setErrorMessage}
          time={8000}
        />
      </AlertWrapper>
      <GenerateMerchantReportModal
        report={report}
        organization={organization}
        setReport={setReport}
        openGenerateReport={openGenerateReport}
        setOpenGenerateReport={setOpenGenerateReport}
        handleGenerateReport={handleGenerateReport}
        selectedReport={selectedRpt}
        isEdited={isEdited}
        pastReports={pastReports}
      />
      <div
        className={`position-absolute d-flex align-items-center gap-1 report-controls ${
          readOnly ? 'end-0' : ''
        }`}
        style={{ top: readOnly ? -60 : -57 }}
      >
        {loadingPastReports ? (
          <Skeleton height={12} width={120} />
        ) : (
          <div className="d-flex align-items-center gap-1">
            {rptGenerated && !readOnly && (
              <IdfTooltip text="Edit">
                <ButtonIcon
                  icon="edit"
                  color="white"
                  label=""
                  onclick={() => handleEditReport()}
                  classnames="btn-sm"
                />
              </IdfTooltip>
            )}
            {pastReports?.length > 0 && (
              <ButtonFilterDropdown
                buttonText="Select Reports"
                menuClass="rpt-history-dd-width max-h-300"
                btnToggleStyle="text-truncate max-w-150 btn-h-sm"
                options={pastReports}
                filterOptionSelected={selectedRpt}
                handleFilterSelect={(e, item) => {
                  setSelectedRpt(item);
                }}
              />
            )}
            {(rptGenerated || pastReports.length > 0) && (
              <>
                {rptGenerated && (
                  <DownloadReportDropdown
                    report={report}
                    startDownload={startDownload}
                    setStartDownload={setStartDownload}
                    downloadOptions={DOWNLOAD_OPTIONS}
                  />
                )}
              </>
            )}
          </div>
        )}
        <AddNewReportButton
          reports={pastReports}
          readOnly={readOnly}
          handleManualReport={handleManualReport}
          addView={!rptGenerated && !loadingReport && !readOnly}
        />
      </div>
      <div className="text-center">
        {((!rptGenerated && !loadingReport && !readOnly) ||
          pastReports?.length === 0) && (
          <ReportDragDrop
            file={null}
            setFile={() => {}}
            loader={false}
            onRemoveFile={() => {}}
            onLoadFile={() => {}}
            handleGenerate={handleGenerateManuallyReport}
            uploadIcon="edit_document"
            fileUpload="Enter data to generate Merchant Service report."
          />
        )}
        {loadingReport ? (
          <ReportBlocksSkeleton />
        ) : (
          <>
            {rptGenerated && (
              <>
                {startDownload && (
                  <div
                    className="position-absolute opacity-0 h-100"
                    style={{ left: '-9999', width: 682 }}
                  >
                    <div className="merchant-card" id="rptPdf">
                      <ReportCover
                        name={report.name}
                        date={report.reportDate}
                        type={ReportTypes.Merchant}
                        selectedTenant={selectedTenant}
                        report={report}
                      />
                      <ReportBlockWrapper
                        showLogo={startDownload}
                        current={2}
                        total={totalPages}
                        report={report}
                        excelBankMode={false}
                        selectedTenant={selectedTenant}
                      >
                        <ProcessingSummary
                          startDownload={startDownload}
                          report={report}
                        />
                      </ReportBlockWrapper>
                      <ReportBlockWrapper
                        showLogo={startDownload}
                        current={3}
                        total={totalPages}
                        report={report}
                        excelBankMode={false}
                        selectedTenant={selectedTenant}
                      >
                        <MerchantFees
                          startDownload={startDownload}
                          report={report}
                        />
                      </ReportBlockWrapper>
                    </div>
                  </div>
                )}
                <div className="merchant-card">
                  <ProcessingSummary report={report} />
                  <MerchantFees readOnly={readOnly} report={report} />
                </div>
              </>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default MerchantReportAnalysisReport;
