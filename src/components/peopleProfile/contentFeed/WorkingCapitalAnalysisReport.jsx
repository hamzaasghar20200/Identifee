import Alert from '../../Alert/Alert';
import AlertWrapper from '../../Alert/AlertWrapper';
import React, { useContext, useEffect, useState } from 'react';
import { AlertMessageContext } from '../../../contexts/AlertMessageContext';
import ReportDragDrop from '../../reports/ReportDragDrop';
import IdfTooltip from '../../idfComponents/idfTooltip';
import ButtonIcon from '../../commons/ButtonIcon';
import Skeleton from 'react-loading-skeleton';
import DownloadReportDropdown from '../../reports/DownloadReportDropdown';
import AddNewReportButton from '../../reports/AddNewReportButton';
import GenerateWorkingCapitalReportModal from '../../reports/GenerateWorkingCapitalReportModal';
import WCOpportunityBlock from '../../reportbuilder/blocks/workingCapital/WCOpportunityBlock';
import AAAutoManualProcessBlock from '../../reportbuilder/blocks/AAAutoManualProcessBlock';
import AAPayablesPaymentBreakdownBlock from '../../reportbuilder/blocks/AAPayablesPaymentBreakdownBlock';
import naicsService from '../../../services/naics.service';
import OrganizationService from '../../../services/organization.service';
import WCDPOIndustryBenchmarkBlock from '../../reportbuilder/blocks/workingCapital/WCDPOIndustryBenchmarkBlock';
import {
  ActionTypes,
  PayableBlockTypes,
  ReportTypes,
} from '../../reports/reports.constants';
import WCOpportunityToImproveBlock from '../../reportbuilder/blocks/workingCapital/WCOpportunityToImproveBlock';
import ReportCover from '../../reports/ReportCover';
import ReportBlockWrapper from '../../reports/ReportBlockWrapper';
import IconHeadingBlock from '../../reportbuilder/blocks/IconHeadingBlock';
import { parseCurrency } from '../../../utils/Utils';
import ReportService from '../../../services/report.service';
import ReportBlocksSkeleton from '../../loaders/ReportBlocksSkeleton';
import ButtonFilterDropdown from '../../commons/ButtonFilterDropdown';
import ReportDropdownItem from '../../reports/ReportDropdownItem';
import NoDataFound from '../../commons/NoDataFound';
import {
  getCycleDate,
  getReportName,
} from '../../reports/reports.helper.functions';
import { useProfileContext } from '../../../contexts/profileContext';

const DOWNLOAD_OPTIONS = [
  {
    id: 1,
    icon: 'picture_as_pdf',
    key: 'downloadAsPdf',
    name: 'PDF Download',
  },
];

const calculatePercentage = (perc) => {
  if (perc > 100) {
    return 100;
  }

  return perc?.toFixed(2);
};

const workingCapitalMapping = (reportValues, insightsData) => {
  const yearly = 365;
  const mapping = {};

  const accountsPayable = parseCurrency(
    reportValues.accountsPayable || '$0.00'
  );
  const accountsReceivable = parseCurrency(
    reportValues.accountsReceivable || '$0.00'
  );
  const costOfGoodsSold = parseCurrency(
    reportValues.costOfGoodsSold || '$0.00'
  );
  const netSales = parseCurrency(reportValues.netSales || '$0.00');

  // Accounts Payable/Cost of Goods Sold*365
  const yourDPO = Math.round((accountsPayable / costOfGoodsSold) * yearly);
  // Accounts Receivable/Net Sales *365
  const yourDSO = Math.round((accountsReceivable / netSales) * yearly);

  const avgDPO = insightsData?.sp?.[PayableBlockTypes.DPO.key] || 0;
  const avgDSO = insightsData?.sp?.[PayableBlockTypes.DSO.key] || 0;

  const bestInClassDPO =
    insightsData?.sp?.aggregations?.find(
      (agr) => agr.aggregation_type === 'AVERAGE_TOP_10_PERCENT'
    )?.[PayableBlockTypes.DPO.key] || 0;

  const bestInClassDSO =
    insightsData?.sp?.aggregations?.find(
      (agr) => agr.aggregation_type === 'AVERAGE_BOTTOM_10_PERCENT'
    )?.[PayableBlockTypes.DSO.key] || 0;

  // AP: (Your DPO - Best in class DPO) * (Accounts Payable - (Your Days Payable+1)/365 * Cost of Good Sold)
  const apOpportunity =
    (yourDPO - bestInClassDPO) *
    (accountsPayable - ((yourDPO + 1) / yearly) * costOfGoodsSold);

  // AR: (Your DSO - Best in class DSO) * (Accounts Receivable - (Your Days Receivable-1)/365 * Net Sales)
  const arOpportunity =
    (yourDSO - bestInClassDSO) *
    (accountsReceivable - ((yourDSO + 1) / yearly) * netSales);

  const apOpportunityDPO = bestInClassDPO > apOpportunity ? 0 : apOpportunity;
  const arOpportunityDSO = bestInClassDSO < arOpportunity ? 0 : arOpportunity;
  // 1 - total annual value: AP + AR
  mapping.totalAnnualValue = apOpportunityDPO + arOpportunityDSO; // value 1
  mapping.apOpportunity = apOpportunity; // value 3
  mapping.arOpportunity = arOpportunity; // value 4

  const totalValue = mapping.totalAnnualValue;
  const apPercentage = (mapping.apOpportunity / totalValue) * 100;
  const arPercentage = (mapping.arOpportunity / totalValue) * 100;

  mapping.apPercentage = calculatePercentage(apPercentage); // value 3
  mapping.arPercentage = calculatePercentage(arPercentage); // value 4

  mapping.yourDPO = yourDPO;
  mapping.avgDPO = avgDPO;
  mapping.bestInClassDPO = bestInClassDPO;

  mapping.yourDSO = yourDSO;
  mapping.avgDSO = avgDSO;
  mapping.bestInClassDSO = bestInClassDSO;

  return mapping;
};

const WorkingCapitalAnalysisReport = ({
  organization,
  readOnly,
  selectedTenant,
}) => {
  const totalPages = 4;
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
  const [loaderInsights, setLoaderInsights] = useState(false);
  const [insightsData, setInsightsData] = useState({});
  const { profileInfo } = useProfileContext();
  const [rpmg, setRpmg] = useState({});

  const getReports = async (dontSelect) => {
    setLoadingPastReports(true);
    try {
      const { data } = await OrganizationService.getReports(organization.id, {
        limit: 100,
        page: 1,
        type: ReportTypes.WorkingCapital,
      });

      const reports = data.data.map((rpt) => {
        const rptObject = rpt.manualInput;
        return {
          key: rpt.reportId,
          customElement: <ReportDropdownItem item={rptObject} />,
          name: getReportName(rptObject),
          isManual: true,
          createdById: rpt.createdById,
        };
      });

      setPastReports(reports);

      if (!dontSelect) {
        const firstReport = reports.length ? reports[0] : {};
        // if we have the reportId then get it
        if (firstReport?.key) {
          setSelectedRpt(firstReport);
        }
      }
    } catch (e) {
      console.log(e);
    } finally {
      setLoadingPastReports(false);
    }
  };

  const displayValuesInView = (data, manualInput, insightsData) => {
    const mapping = workingCapitalMapping(manualInput, insightsData);
    setReport({
      reportId: data.reportId,
      createdById: data.createdById,
      companyName: data.name,
      valueN: manualInput.valueN,
      valueNaicsSic: manualInput.valueNaicsSic,
      ...manualInput,
      ...mapping,
      reportDate: getCycleDate(data.date),
    });
    setRptGenerated(true);
  };
  const getReportById = async (selectedReport) => {
    setLoadingReport(true);
    try {
      const data = await ReportService.getReport(selectedReport.key);
      const { manualInput } = data;
      if (manualInput.valueNaicsSic || organization.naics_code) {
        getInsights(
          manualInput.valueNaicsSic || organization.naics_code,
          (newInsightsData) => {
            displayValuesInView(data, manualInput, newInsightsData);
          }
        );
      } else {
        displayValuesInView(data, manualInput, {});
      }
    } catch (e) {
      console.log(e);
    } finally {
      setLoadingReport(false);
    }
  };

  const handleManualReport = () => {
    setSelectedRpt({});
    setIsEdited(false);
    setRptGenerated(false);
  };
  const handleEditReport = () => {
    setIsEdited(true);
    setOpenGenerateReport(true);
  };

  const getInsights = async (newNaics, callback) => {
    setLoaderInsights(true);
    try {
      let data = {};
      const naicsCode =
        newNaics || report?.valueNaicsSic || organization.naics_code;
      if (naicsCode) {
        // get rpmg/sp summary by naics if company has it
        const naicsFirstTwo = naicsCode.slice(0, 2);
        data = await Promise.all([
          naicsService.getNaicsRpmgSummary(naicsFirstTwo),
          naicsService.getNaicsSpSummary(naicsFirstTwo),
        ]);
        const insightsDataRpmgSp = {
          rpmg: data[0],
          sp: data[1],
        };
        setInsightsData(insightsDataRpmgSp);
        callback(insightsDataRpmgSp);
      } else {
        data = await OrganizationService.getInsightsByOrganization(
          organization.id
        );
        setInsightsData(data);
      }
    } catch (e) {
      console.log(e);
    } finally {
      setLoaderInsights(false);
    }
  };

  const handleGenerateReport = (newReport, action, newOrUpdatedReport) => {
    setRptGenerated(true);
    getInsights(
      newReport.valueNaicsSic || organization.naics_code,
      (newInsightsData) => {
        const mapping = workingCapitalMapping(newReport, newInsightsData);
        setOpenGenerateReport(false);

        if (action === ActionTypes.REMOVE) {
          const newReports = [
            ...pastReports.filter((rpt) => rpt.key !== newReport.key),
          ];
          const reportsAvailable = newReports.length > 0;
          setPastReports(reportsAvailable ? newReports : []);
          setSelectedRpt(reportsAvailable ? newReports.at(-1) : {});
          setRptGenerated(false);
        } else {
          setRptGenerated(true);
          if (newReport) {
            try {
              if ('key' in selectedRpt) {
                const newReports = [
                  ...pastReports.map((rpt) =>
                    rpt.key === selectedRpt.key
                      ? {
                          ...rpt,
                          customElement: (
                            <ReportDropdownItem item={newReport} />
                          ),
                          name: getReportName(newReport),
                          createdById: profileInfo.id,
                        }
                      : rpt
                  ),
                ];
                setPastReports(newReports);
                setSelectedRpt(
                  newReports.find((r) => r.key === selectedRpt.key)
                );
              } else {
                const rptObject = newReport;
                const pastReportObject = {
                  key: newOrUpdatedReport.reportId,
                  customElement: <ReportDropdownItem item={rptObject} />,
                  name: getReportName(rptObject),
                  isManual: true,
                  createdById: profileInfo.id,
                };
                const newReports = [...pastReports, pastReportObject];
                setPastReports(newReports);
                setSelectedRpt(pastReportObject);
              }
            } catch (e) {
              console.log(e);
            }
          }
        }

        const reportMapping = {
          ...report,
          ...mapping,
        };
        console.log('ssss-hg', reportMapping);
        setReport(reportMapping);
      }
    );
  };

  const handleGenerateManuallyReport = () => {
    setReport({
      companyName: organization.name,
      reportDate: getCycleDate(new Date().toISOString()),
      valueN: organization.naics_code ? [organization.naics_code] : [],
      valueNaicsSic: organization.naics_code,
    });
    setOpenGenerateReport(true);
  };

  useEffect(() => {
    if (organization?.naics_code) {
      setReport({
        ...report,
        companyName: organization.name,
        valueN: organization.naics_code ? [organization.naics_code] : [],
        valueNaicsSic: organization.naics_code,
      });
    }
  }, [organization?.naics_code]);

  useEffect(() => {
    if (organization?.id) {
      setReport({
        ...report,
        companyName: organization.name,
        valueN: organization.naics_code ? [organization.naics_code] : [],
        valueNaicsSic: organization.naics_code,
      });
      getReports();
    }
  }, [organization?.id]);

  useEffect(() => {
    if (selectedRpt?.key) {
      getReportById(selectedRpt);
    }
  }, [selectedRpt?.key]);

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
      <GenerateWorkingCapitalReportModal
        report={report}
        organization={organization}
        setReport={setReport}
        openGenerateReport={openGenerateReport}
        setOpenGenerateReport={setOpenGenerateReport}
        handleGenerateReport={handleGenerateReport}
        selectedReport={selectedRpt}
        isEdited={isEdited}
        insightsData={insightsData}
      />
      {pastReports.length === 0 && readOnly && (
        <NoDataFound
          icon="analytics"
          containerStyle="text-gray-search my-6 py-6"
          title={'No reports have been created or shared yet.'}
        />
      )}
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
            {pastReports.length > 0 && (
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
        {!rptGenerated && !loadingReport && !readOnly && (
          <ReportDragDrop
            file={null}
            setFile={() => {}}
            loader={false}
            onRemoveFile={() => {}}
            onLoadFile={() => {}}
            handleGenerate={handleGenerateManuallyReport}
            uploadIcon="edit_document"
            fileUpload="Enter data to generate Working Capital report."
          />
        )}
      </div>

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
                  <div id="rptPdf">
                    <ReportCover
                      name={report.companyName}
                      date={report.reportDate}
                      type={ReportTypes.WorkingCapital}
                      selectedTenant={selectedTenant}
                    />
                    <ReportBlockWrapper
                      showLogo={startDownload}
                      current={2}
                      total={totalPages}
                      report={report}
                      excelBankMode={false}
                      selectedTenant={selectedTenant}
                    >
                      <WCOpportunityBlock
                        report={{ ...report, opportunity: 538836 }}
                        whenPrinting={startDownload}
                        ignoreHeadings={false}
                      />
                      <div className="mb-5 px-3">
                        <AAAutoManualProcessBlock />
                        <br />
                      </div>
                    </ReportBlockWrapper>
                    <ReportBlockWrapper
                      showLogo={startDownload}
                      current={3}
                      total={totalPages}
                      report={report}
                      excelBankMode={false}
                      selectedTenant={selectedTenant}
                    >
                      <div className="text-left px-5">
                        <br />
                        <IconHeadingBlock
                          heading="Accounts Payable"
                          icon="arrow_upward"
                          containerStyle="gap-1 mb-2"
                        />
                      </div>
                      <div className="px-3">
                        <AAPayablesPaymentBreakdownBlock
                          report={report}
                          loader={loaderInsights}
                          insightsData={insightsData}
                          whenPrinting={false}
                          excelBankMode={false}
                          ignoreHeadings={true}
                          title="Overview"
                          fromWorkingCapitalReport={true}
                          type={PayableBlockTypes.DPO}
                          sponsorLogo={false}
                        />
                        <WCDPOIndustryBenchmarkBlock
                          report={report}
                          ignoreHeadings={true}
                          title="Days Payable Outstanding Industry Benchmark"
                          type={PayableBlockTypes.DPO}
                        />
                        <WCOpportunityToImproveBlock
                          report={report}
                          type={PayableBlockTypes.DPO}
                          organization={organization}
                          whenPrinting={startDownload}
                          rpmg={rpmg}
                          setRpmg={setRpmg}
                        />
                      </div>
                    </ReportBlockWrapper>
                    <ReportBlockWrapper
                      showLogo={startDownload}
                      selectedTenant={selectedTenant}
                      current={4}
                      total={totalPages}
                      report={report}
                      excelBankMode={false}
                    >
                      <div className="text-left px-5">
                        <br />
                        <IconHeadingBlock
                          heading="Accounts Receivable"
                          icon="arrow_downward"
                          containerStyle="gap-1 mb-2"
                        />
                      </div>
                      <div className="px-3">
                        <AAPayablesPaymentBreakdownBlock
                          report={report}
                          loader={loaderInsights}
                          insightsData={insightsData}
                          whenPrinting={false}
                          excelBankMode={false}
                          ignoreHeadings={true}
                          title="Overview"
                          fromWorkingCapitalReport={true}
                          type={PayableBlockTypes.DSO}
                          sponsorLogo={false}
                        />
                        <WCDPOIndustryBenchmarkBlock
                          report={report}
                          ignoreHeadings={true}
                          title="Days Sales Outstanding Industry Benchmark"
                          type={PayableBlockTypes.DSO}
                        />
                        <div className="mb-3">
                          <WCOpportunityToImproveBlock
                            report={report}
                            type={PayableBlockTypes.DSO}
                            organization={organization}
                            whenPrinting={startDownload}
                            rpmg={rpmg}
                            setRpmg={setRpmg}
                          />
                          <br />
                        </div>
                      </div>
                    </ReportBlockWrapper>
                  </div>
                </div>
              )}
              <WCOpportunityBlock
                report={{ ...report, opportunity: 538836 }}
                ignoreHeadings={true}
              />
              <div className="mb-3">
                <AAAutoManualProcessBlock />
              </div>
              <AAPayablesPaymentBreakdownBlock
                report={report}
                loader={loaderInsights}
                insightsData={insightsData}
                whenPrinting={false}
                excelBankMode={false}
                ignoreHeadings={true}
                title="Overview"
                fromWorkingCapitalReport={true}
                type={PayableBlockTypes.DPO}
                sponsorLogo={false}
              />
              <WCDPOIndustryBenchmarkBlock
                report={report}
                ignoreHeadings={true}
                title="Days Payable Outstanding Industry Benchmark"
                type={PayableBlockTypes.DPO}
              />
              <WCOpportunityToImproveBlock
                report={report}
                type={PayableBlockTypes.DPO}
                organization={organization}
                rpmg={rpmg}
                setRpmg={setRpmg}
              />
              <AAPayablesPaymentBreakdownBlock
                report={report}
                loader={loaderInsights}
                insightsData={insightsData}
                whenPrinting={false}
                excelBankMode={false}
                ignoreHeadings={true}
                title="Overview"
                fromWorkingCapitalReport={true}
                type={PayableBlockTypes.DSO}
                sponsorLogo={false}
              />
              <WCDPOIndustryBenchmarkBlock
                report={report}
                ignoreHeadings={true}
                title="Days Sales Outstanding Industry Benchmark"
                type={PayableBlockTypes.DSO}
              />
              <WCOpportunityToImproveBlock
                report={report}
                type={PayableBlockTypes.DSO}
                organization={organization}
                rpmg={rpmg}
                setRpmg={setRpmg}
              />
            </>
          )}
        </>
      )}
    </>
  );
};

export default WorkingCapitalAnalysisReport;
