import React, { useContext, useEffect, useState } from 'react';
import { defaultGlossary, MAX_WEIGHT } from '../../../utils/constants';
import { overflowing, parseCurrency } from '../../../utils/Utils';
import moment from 'moment/moment';
import OrganizationService from '../../../services/organization.service';
import ButtonIcon from '../../commons/ButtonIcon';
import naicsService from '../../../services/naics.service';
import Alert from '../../Alert/Alert';
import AlertWrapper from '../../Alert/AlertWrapper';
import { AlertMessageContext } from '../../../contexts/AlertMessageContext';
import IdfTooltip from '../../idfComponents/idfTooltip';
import ReportService from '../../../services/report.service';
import Skeleton from 'react-loading-skeleton';
import fakeCSVData from './excel-bank-fake-csv.json';
import NoDataFound from '../../commons/NoDataFound';
import {
  CenturyBankMapping,
  DemoTenantsKeys,
  EstimatedTotalPayablesPoints,
  EstimatedTotalReceivablesPoints,
  Pages,
  SVBMapping,
  PayablesDataPoints,
  PayablesDataPointsV2,
  PaymentRisksDataPoints,
  ReceivablesDataPoints,
  ReceivablesDataPointsV2,
  ReportTypes,
} from '../../reports/reports.constants';
import {
  getCycleDate,
  getEstimatedTotalPayablesValue,
  getReportName,
  updateJsonObject,
} from '../../reports/reports.helper.functions';
import GenerateTreasuryReportModal from '../../reports/GenerateTreasuryReportModal';
import ReportBlocksSkeleton from '../../loaders/ReportBlocksSkeleton';
import ReportCover from '../../reports/ReportCover';
import {
  calculateTotalFees,
  findAccountAndDate,
  findPagesBetweenSectionNames,
  findValueInPage,
  getPayablesOrReceivablesValues,
  getPayablesOrReceivablesValuesV2,
  getTablesDataBySection,
  processServiceDetailsPage,
} from '../../reports/pdf.scrape.engine';
import ReportDragDrop from '../../reports/ReportDragDrop';
import AddNewReportButton from '../../reports/AddNewReportButton';
import DownloadReportDropdown from '../../reports/DownloadReportDropdown';
import ReportDropdownItem from '../../reports/ReportDropdownItem';
import ButtonFilterDropdown from '../../commons/ButtonFilterDropdown';
import useIsTenant from '../../../hooks/useIsTenant';
import { useProfileContext } from '../../../contexts/profileContext';
import _ from 'lodash';
import {
  getCompanyNameAndStatementDate,
  processComericaBankStatement,
  processSVBBankStatement,
} from '../../reports/mozilla.pdf.parser';
import Overview from '../../reportbuilder/blocks/treasuryManagement/Overview';
import Payables from '../../reportbuilder/blocks/treasuryManagement/Payables';
import Receivables from '../../reportbuilder/blocks/treasuryManagement/Receivables';
import Fraud from '../../reportbuilder/blocks/treasuryManagement/Fraud';
import FeeSummary from '../../reportbuilder/blocks/treasuryManagement/FeeSummary';
import Glossary from '../../reportbuilder/blocks/treasuryManagement/Glossary';

const pdfJS = require('pdfjs-dist');
pdfJS.GlobalWorkerOptions.workerSrc =
  'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.9.179/build/pdf.worker.min.js';

const XLSX = require('sheetjs-style');

const TreasuryManagementReport = ({
  organization,
  currentTab,
  selectedTenant,
  readOnly, // this mean its open from client portal, we only allow download and switch between report nothing else
}) => {
  const [pdf, setPdf] = useState(null);
  const [loader, setLoader] = useState(false);
  const [report, setReport] = useState({});
  const [reportCreated, setReportCreated] = useState({});
  const totalPages = 6;
  const [feeAllocationData, setFeeAllocationData] = useState({});
  const [pastReports, setPastReports] = useState([]);
  const [loadingPastReports, setLoadingPastReports] = useState(false);
  const [loadingReport, setLoadingReport] = useState(false);
  const [selectedRpt, setSelectedRpt] = useState({});
  const [loaderInsights, setLoaderInsights] = useState(false);
  const [insightsData, setInsightsData] = useState({});
  const [accordionBlock, setAccordionBlock] = useState('0');
  const { successMessage, setSuccessMessage, errorMessage, setErrorMessage } =
    useContext(AlertMessageContext);
  const [cancelTokenSources] = useState([]);
  const [csvData, setCsvData] = useState([]);
  const [isEdited, setIsEdited] = useState(false);
  const { isExcelBank, isCenturyBank, isSVB } = useIsTenant();
  const excelBankMode = isExcelBank;
  const [downloadOptions, setDownloadOptions] = useState([
    {
      id: 1,
      icon: 'picture_as_pdf',
      key: 'downloadAsPdf',
      name: 'PDF Download',
    },
    {
      id: 2,
      icon: 'format_list_bulleted',
      key: 'downloadAsCSV',
      name: 'CSV',
      hide: false,
    },
  ]);
  const [rptGenerated, setRptGenerated] = useState(false);
  const [openGenerateReport, setOpenGenerateReport] = useState(false);
  const [startDownload, setStartDownload] = useState(false);
  const { profileInfo } = useProfileContext();

  const getReports = async (dontSelect) => {
    setLoadingPastReports(true);
    try {
      const { data } = await OrganizationService.getReports(organization.id, {
        limit: 100,
        page: 1,
        type: ReportTypes.Treasury,
      });

      const reports = data.data.map((rpt) => {
        const rptObject = rpt.input || rpt.manualInput;
        return {
          key: rpt.reportId,
          customElement: <ReportDropdownItem item={rptObject} />,
          name: getReportName(rptObject),
          isManual: !!rpt.manualInput,
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

  const getInsights = async (newNaics) => {
    setLoaderInsights(true);
    try {
      let data = {};
      const naicsCode = newNaics || organization.naics_code;
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

  const getReportById = async (selectedReport) => {
    setLoadingReport(true);
    try {
      const requests = [];
      if (!selectedReport.isManual) {
        requests.push(
          ReportService.getActiveFileExtractions(selectedReport.key)
        );
      }
      requests.push(ReportService.getReport(selectedReport.key));
      const responses = await Promise.all(requests);

      if (requests.length === 1) {
        const reportResponse = responses[0];
        const reportObject = reportResponse.manualInput;
        reportObject.paymentMethodsUsed = updateJsonObject(
          reportObject.paymentMethodsUsed
        );
        reportObject.typesOfReceivables = updateJsonObject(
          reportObject.typesOfReceivables
        );
        reportObject.paymentRisks.fraudPreventionProducts = updateJsonObject(
          reportObject.paymentRisks.fraudPreventionProducts
        );
        setReport({
          ...reportObject,
          value2: getCycleDate(reportObject.value2),
          glossary: reportObject?.glossary || defaultGlossary,
        });
        if (Object.hasOwn(reportObject, 'feeAllocation')) {
          setFeeAllocationData(reportObject.feeAllocation);
        }
      } else {
        const pdfResponse = responses[0];
        const reportResponse = responses[1];
        const pdfData = pdfResponse.body;
        let allData = {};
        if (document.URL.includes('clientportal') || readOnly) {
          allData = processPdfData(pdfData);
        } else {
          if (isCenturyBank || selectedTenant?.key === DemoTenantsKeys.centb) {
            allData = processPdfDataForCenturyBank(pdfData);
          } else if (isSVB || selectedTenant?.key === DemoTenantsKeys.svb) {
            allData = processPdfDataForSVBBank(pdfData);
          } else {
            allData = processPdfData(pdfData);
          }
        }
        const reportObject =
          reportResponse.input || reportResponse.manualInput || {};

        reportObject.paymentMethodsUsed = updateJsonObject(
          reportObject.paymentMethodsUsed
        );
        reportObject.typesOfReceivables = updateJsonObject(
          reportObject.typesOfReceivables
        );
        if (!reportObject.paymentRisks) {
          reportObject.paymentRisks = {};
        }
        reportObject.paymentRisks.fraudPreventionProducts = updateJsonObject(
          reportObject?.paymentRisks?.fraudPreventionProducts
        );
        const newReport = {
          ...allData,
          ...reportObject,
          value2: getCycleDate(reportObject.value2),
          glossary: reportObject?.glossary || defaultGlossary,
        };
        if (Object.hasOwn(newReport, 'feeAllocation')) {
          setFeeAllocationData(reportObject.feeAllocation);
        }
        setReport(newReport);
      }
      setRptGenerated(true);
    } catch (e) {
      console.log(e);
    } finally {
      setLoadingReport(false);
    }
  };

  useEffect(() => {
    if (organization?.naics_code) {
      setReport({
        ...report,
        value1: organization.name,
        valueN: organization.naics_code ? [organization.naics_code] : [],
        valueNaicsSic: organization.naics_code,
      });
    }
  }, [organization?.naics_code]);

  useEffect(() => {
    if (organization?.id) {
      getInsights();
      getReports();
    }
  }, [organization?.id]);

  useEffect(() => {
    if (report?.valueNaicsSic) {
      getInsights(report?.valueNaicsSic);
    }
  }, [report?.valueN, report?.valueNaicsSic]);

  useEffect(() => {
    if (selectedRpt?.key) {
      getReportById(selectedRpt);
    }
  }, [selectedRpt?.key, selectedTenant?.key]);

  useEffect(() => {
    if (currentTab === ReportTypes.Treasury) {
      setReport({});
      setPdf(null);
      setRptGenerated(false);
      setOpenGenerateReport(false);
      setDownloadOptions([
        {
          id: 1,
          icon: 'picture_as_pdf',
          key: 'downloadAsPdf',
          name: 'PDF Download',
        },
        {
          id: 2,
          icon: 'format_list_bulleted',
          key: 'downloadAsCSV',
          name: 'CSV Download',
          hide: false,
        },
      ]);
      setFeeAllocationData({
        Wires: '',
        ACH: '',
        Checks: '',
        Other: '',
      });
      setAccordionBlock('0');
    }
  }, [currentTab]);

  const handleGenerateReport = (newReport) => {
    setOpenGenerateReport(false);
    overflowing();

    if (newReport?.action === 'DELETED') {
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
                      customElement: <ReportDropdownItem item={report} />,
                      name: getReportName(report),
                      createdById: profileInfo.id,
                    }
                  : rpt
              ),
            ];
            setPastReports(newReports);
            setSelectedRpt(newReports.find((r) => r.key === selectedRpt.key));
          } else {
            const rptObject = newReport.input || newReport.manualInput;
            const pastReportObject = {
              key: newReport.reportId,
              customElement: <ReportDropdownItem item={rptObject} />,
              name: getReportName(rptObject),
              isManual: !!newReport.manualInput,
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
  };

  function exportToCSV(data) {
    const wb = XLSX.utils.book_new();
    data.forEach((sheet) => {
      const headers = sheet.data.headers;
      let values = sheet.data.values.map((row) => {
        const newRow = [];
        for (let i = 0; i < headers.length; i++) {
          newRow[i] = row[i] || '';
        }
        return newRow;
      });
      values = values.map((row) => {
        return row.filter((cell) => cell !== '');
      });
      const ws = XLSX.utils.aoa_to_sheet([headers, ...values]);

      // Bold headers
      const headerRange = XLSX.utils.decode_range(ws['!ref']);
      for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
        const cell = XLSX.utils.encode_cell({ r: headerRange.s.r, c: col });
        const header = ws[cell].v;
        ws[cell].s = { font: { bold: true } };
        ws[cell].v = header;
      }

      // Column auto-width
      let colWidths = sheet.data.headers.map((header) => header.length);
      sheet.data.values.forEach((row) => {
        row.forEach((cell, index) => {
          const len = cell ? cell.toString().length : 0;
          if (colWidths[index] < len) {
            colWidths[index] = len;
          }
        });
      });
      colWidths = colWidths.filter((f) => f !== 1);
      for (let col = 0; col < colWidths.length; col++) {
        const width = colWidths[col] + 2;
        const cell = XLSX.utils.encode_col(col) + '1';
        ws[cell].s = { font: { bold: true } };
        ws[cell].v = sheet.data.headers[col];
        ws['!cols'] = ws['!cols'] || [];
        ws['!cols'][col] = { width };
      }

      XLSX.utils.book_append_sheet(wb, ws, sheet.name);
    });

    const fileName = `${report.value1} ${moment(report.value2).format(
      'MMMM, YYYY'
    )}.xlsx`;
    XLSX.writeFile(wb, fileName);
  }
  const processPdfDataForSVBBank = (liveData) => {
    const pdfData = liveData;
    const pageData = pdfData.document.page[0];
    const allPdfData = _.flatten(pdfData.document.page.map((p) => p.row));
    const isSVBB = isSVB || selectedTenant?.key === DemoTenantsKeys.svb;
    const pageParsedData = findAccountAndDate(
      pageData,
      organization,
      false,
      isSVBB
    );

    const newCSVData = [
      getTablesDataBySection(
        pdfData,
        Pages.ServiceInformation,
        Pages.LastTwelveMonth
      ),
      getTablesDataBySection(
        pdfData,
        Pages.LastTwelveMonth,
        Pages.LastTwelveMonth,
        false
      ),
    ];

    setCsvData(newCSVData);

    const serviceDetailsPageIndex = findPagesBetweenSectionNames(
      pdfData,
      Pages.ServiceInformation.title
    );

    const payableData = getPayablesOrReceivablesValuesV2(
      pdfData,
      serviceDetailsPageIndex,
      SVBMapping.PayablesDataPoints,
      false,
      isSVBB
    );

    const receivableData = getPayablesOrReceivablesValuesV2(
      pdfData,
      serviceDetailsPageIndex,
      SVBMapping.ReceivablesDataPoints,
      false,
      isSVBB
    );

    // formula B+C+D+E+RTP (from Data Mapping Sheet)
    // this is F
    const totalPayables = getPayablesOrReceivablesValuesV2(
      pdfData,
      serviceDetailsPageIndex,
      SVBMapping.EstimatedTotalPayablesPoints,
      false,
      isSVBB
    );
    const estimatedTotalPayables = totalPayables.Payables['Total Volume'];

    const totalReceivables = getPayablesOrReceivablesValuesV2(
      pdfData,
      serviceDetailsPageIndex,
      SVBMapping.EstimatedTotalReceivablesPoints,
      false,
      isSVBB
    );
    // this is K
    const estimatedTotalReceivables =
      totalReceivables.Receivables['Total Volume'];

    const paymentMethodsUsed = {
      Wires: payableData['TPA Wire']['Total Volume'],
      ACH: payableData['ACH Origination']['Total Volume'],
      Check: payableData['Checks Paid']['Total Volume'],
      'Automated Payable Solution':
        payableData['Integrated Payables ACH']['Total Volume'],
    };

    const typesOfReceivables = {
      Wires: receivableData['Checks Paid']['Total Volume'],
      'ACH/Check': receivableData['Integrated Payables ACH']['Total Volume'],
      'Cash Vault': receivableData['Positive Pay Usage']['Total Volume'],
      'Automated Receivables Solution':
        receivableData['ACH Positive Pay Usage']['Total Volume'],
    };

    const paymentRisksData = getPayablesOrReceivablesValuesV2(
      pdfData,
      serviceDetailsPageIndex,
      SVBMapping.PaymentRisksDataPoints,
      false,
      isSVBB
    );

    // formula = F*.10*$2.49*12
    const opportunity = estimatedTotalPayables * 0.1 * 2.49 * 12;

    const paymentRisksValueD =
      paymentRisksData['Incoming Wires']['Total Volume'];
    const paymentRisksValueE =
      paymentRisksData['Incoming ACH/Check']['Total Volume'];
    const paymentRisks = {
      balance: {
        total: paymentRisksValueD + paymentRisksValueE,
        isChecked: paymentRisksValueD > 0 && paymentRisksValueE > 0,
      },
      fraudPreventionProducts: updateJsonObject({
        'Positive Pay': paymentRisksValueD,
        'ACH Positive Pay': paymentRisksValueE,
      }),
    };

    const totalFeesPaid = findValueInPage(allPdfData, [
      {
        keyToFind: 'Service Charges - Debited',
        keyToFindRegex: /Service Charges - Debited/,
        keyToFindValueIndex: 1,
        objectKeyName: 'totalFeesPaid',
      },
    ]);

    const totalBankFees = findValueInPage(allPdfData, [
      {
        keyToFind: 'Total Service Charges Listed',
        keyToFindRegex: /Total Service Charges Listed/,
        keyToFindValueIndex: 3,
        objectKeyName: 'totalBankFees',
      },
    ]);

    const earningsAllowance = findValueInPage(allPdfData, [
      {
        keyToFind: /\bEarnings Allowance\b/,
        keyToFindRegex: /\bEarnings Allowance\b/,
        keyToFindValueIndex: 1,
        objectKeyName: 'earningsAllowance',
      },
    ]);

    const ecrRate = findValueInPage(allPdfData, [
      {
        keyToFind: /\bEarnings Allowance Rate\b/,
        keyToFindRegex: /\bEarnings Allowance Rate\b/,
        keyToFindValueIndex: 2,
        objectKeyName: 'ecrRate',
      },
    ]);

    const avgNetCollectedBalance = findValueInPage(allPdfData, [
      {
        keyToFind: 'Balance To Support Services',
        keyToFindRegex: /Balance To Support Services/,
        keyToFindValueIndex: 2,
        objectKeyName: 'avgNetCollectedBalance',
      },
    ]);

    const nonBalanceServiceChargesListed = findValueInPage(allPdfData, [
      {
        keyToFind: 'Non-Balance Compensable Service Charges (F)',
        keyToFindRegex: /Non-Balance Compensable Service Charges (F)/,
        keyToFindValueIndex: 3,
        objectKeyName: 'nonBalanceServiceChargesListed',
      },
    ]);

    const totalServicesChargesListed = findValueInPage(allPdfData, [
      {
        keyToFind: 'Total Service Charges Listed',
        keyToFindRegex: /Total Service Charges Listed/,
        keyToFindValueIndex: 3,
        objectKeyName: 'totalServicesChargesListed',
      },
    ]);

    const reserveRequirementRate = findValueInPage(allPdfData, [
      {
        keyToFind: 'Reserve Requirement Rate',
        keyToFindRegex: /Reserve Requirement Rate/,
        keyToFindValueIndex: 2,
        objectKeyName: 'reserveRequirementRate',
      },
    ]);

    // formula: ("Total Service Charges Listed" - "Non-Balance Compensable Service Charges (F)")/(ECR Rate*(31/365)*((100-"Reserve Requirement Rate")/100)))
    const totalService = parseCurrency(
      totalServicesChargesListed?.totalServicesChargesListed || '$0'
    );
    const totalNonBalance = parseCurrency(
      nonBalanceServiceChargesListed?.nonBalanceServiceChargesListed || '$0'
    );
    const eRate = parseFloat(ecrRate?.ecrRate?.replace('%', ''));
    const reserveReq = parseFloat(
      reserveRequirementRate?.reserveRequirementRate || '0'
    );

    // wow
    const s = totalService - totalNonBalance;
    const e = (eRate / 100) * (31 / 365);
    const r = (100 - reserveReq) / 100;
    const balancesToOffset = s / (e * r);
    // fee allocation logic
    const feeAllocationData = processServiceDetailsPage(
      pdfData,
      serviceDetailsPageIndex
    );

    setFeeAllocationData(feeAllocationData);
    const allData = {
      value1: pageParsedData.name,
      value2: pageParsedData.date,
      valueN: [pageParsedData.naics],
      opportunity,
      estimatedTotalPayables: Math.round(estimatedTotalPayables),
      estimatedTotalReceivables: Math.round(estimatedTotalReceivables),
      payableData,
      receivableData,
      paymentMethodsUsed: updateJsonObject(paymentMethodsUsed),
      typesOfReceivables: updateJsonObject(typesOfReceivables),
      paymentRisks,
      totalFees: totalFeesPaid?.totalFeesPaid || '$0',
      value5: totalBankFees?.totalBankFees || '$0',
      value6: ecrRate?.ecrRate,
      value7: avgNetCollectedBalance?.avgNetCollectedBalance || '$0',
      value8: balancesToOffset || '$0',
      value9: earningsAllowance?.earningsAllowance || '$0',
    };
    setDownloadOptions([
      {
        id: 1,
        icon: 'picture_as_pdf',
        key: 'downloadAsPdf',
        name: 'PDF Download',
      },
      {
        id: 2,
        icon: 'format_list_bulleted',
        key: 'downloadAsCSV',
        name: 'CSV Download',
        hide: newCSVData.length === 0,
      },
    ]);
    setReport(allData);
    return allData;
  };
  const processPdfDataForCenturyBank = (liveData) => {
    const pdfData = liveData;
    const pageData = pdfData.document.page;
    const isCentB =
      isCenturyBank || selectedTenant?.key === DemoTenantsKeys.centb;
    const pageParsedData = findAccountAndDate(pageData, organization, isCentB);

    const payableData = getPayablesOrReceivablesValuesV2(
      pdfData,
      0,
      CenturyBankMapping.PayablesDataPoints,
      isCentB
    );

    const receivableData = getPayablesOrReceivablesValuesV2(
      pdfData,
      0,
      CenturyBankMapping.ReceivablesDataPoints,
      isCentB
    );

    // formula B+C+D+E+RTP (from Data Mapping Sheet)
    // this is F
    const totalPayables = getPayablesOrReceivablesValuesV2(
      pdfData,
      0,
      CenturyBankMapping.EstimatedTotalPayablesPoints,
      isCentB
    );
    const estimatedTotalPayables = totalPayables.Payables['Total Volume'];

    const totalReceivables = getPayablesOrReceivablesValuesV2(
      pdfData,
      0,
      CenturyBankMapping.EstimatedTotalReceivablesPoints,
      isCentB
    );
    // this is K
    const estimatedTotalReceivables =
      totalReceivables.Receivables['Total Volume'];

    const paymentMethodsUsed = {
      Wires: payableData['TPA Wire']['Total Volume'],
      ACH: payableData['ACH Origination']['Total Volume'],
      Check: payableData['Checks Paid']['Total Volume'],
      'Automated Payable Solution':
        payableData['Integrated Payables ACH']['Total Volume'],
    };

    const typesOfReceivables = {
      Wires: receivableData['Checks Paid']['Total Volume'],
      'ACH/Check': receivableData['Integrated Payables ACH']['Total Volume'],
      'Cash Vault': receivableData['Positive Pay Usage']['Total Volume'],
      'Automated Receivables Solution':
        receivableData['ACH Positive Pay Usage']['Total Volume'],
    };

    const paymentRisksData = getPayablesOrReceivablesValuesV2(
      pdfData,
      0,
      CenturyBankMapping.PaymentRisksDataPoints,
      isCentB
    );

    // formula = F*.10*$2.49*12
    const opportunity = estimatedTotalPayables * 0.1 * 2.49 * 12;

    const paymentRisksValueD =
      paymentRisksData['Incoming Wires']['Total Volume'];
    const paymentRisksValueE =
      paymentRisksData['Incoming ACH/Check']['Total Volume'];
    const paymentRisks = {
      balance: {
        total: paymentRisksValueD + paymentRisksValueE,
        isChecked: paymentRisksValueD > 0 && paymentRisksValueE > 0,
      },
      fraudPreventionProducts: updateJsonObject({
        'Positive Pay': paymentRisksValueD,
        'ACH Positive Pay': paymentRisksValueE,
      }),
    };

    const totalFeesPaid = findValueInPage(pageData, [
      {
        keyToFind: 'Your Account Will Be Charged',
        keyToFindRegex: /Your Account Will Be Charged:/,
        keyToFindValueIndex: 3,
        objectKeyName: 'totalFeesPaid',
      },
    ]);

    const totalBankFees = findValueInPage(pageData, [
      {
        keyToFind: 'Total Services Charges',
        keyToFindRegex: /Total Services Charges/,
        keyToFindValueIndex: 3,
        objectKeyName: 'totalBankFees',
      },
    ]);

    const ecrRate = findValueInPage(pageData, [
      {
        keyToFind: 'Earnings On',
        keyToFindRegex: /Earnings On/,
        keyToFindValueIndex: 3,
        nextRowValue: true,
        objectKeyName: 'ecrRate',
      },
    ]);

    const earningsAllowance = findValueInPage(pageData, [
      {
        keyToFind: 'Earnings On',
        keyToFindRegex: /Earnings On/,
        keyToFindValueIndex: 4,
        nextRowValue: true,
        objectKeyName: 'earningsAllowance',
      },
    ]);

    const avgNetCollectedBalance = findValueInPage(pageData, [
      {
        keyToFind: 'Average Net Collected Balance',
        keyToFindRegex: /Average Net Collected Balance/,
        keyToFindValueIndex: 3,
        objectKeyName: 'avgNetCollectedBalance',
      },
    ]);

    // formula: Calculation: (Total Services Charges)/((ECR Rate) * (31/365))
    const balancesToOffset =
      parseFloat(totalBankFees?.totalBankFees || '0') /
        (parseFloat(ecrRate?.ecrRate?.replace('%', '')) * (31 / 365)) +
      '';

    const allData = {
      value1: pageParsedData.name,
      value2: pageParsedData.date,
      valueN: [pageParsedData.naics],
      opportunity,
      estimatedTotalPayables: Math.round(estimatedTotalPayables),
      estimatedTotalReceivables: Math.round(estimatedTotalReceivables),
      payableData,
      receivableData,
      paymentMethodsUsed: updateJsonObject(paymentMethodsUsed),
      typesOfReceivables: updateJsonObject(typesOfReceivables),
      paymentRisks,
      totalFees: totalFeesPaid?.totalFeesPaid || '$0',
      value5: totalBankFees?.totalBankFees || '$0',
      value6: ecrRate?.ecrRate,
      value7: avgNetCollectedBalance?.avgNetCollectedBalance || '$0',
      value8: balancesToOffset || '$0',
      value9: earningsAllowance?.earningsAllowance || '$0',
    };
    setDownloadOptions([
      {
        id: 1,
        icon: 'picture_as_pdf',
        key: 'downloadAsPdf',
        name: 'PDF Download',
      },
    ]);
    setReport(allData);
    return allData;
  };
  const processPdfData = (liveData) => {
    const pdfData = liveData;
    const pageData = pdfData.document.page[0];
    const pageParsedData = findAccountAndDate(pageData, organization);
    const newCSVData = [
      getTablesDataBySection(
        pdfData,
        Pages.RelationshipSummary,
        Pages.BalanceSummary
      ),
      getTablesDataBySection(
        pdfData,
        Pages.BalanceSummary,
        Pages.ResultsSummary
      ),
      getTablesDataBySection(
        pdfData,
        Pages.ResultsSummary,
        Pages.ServiceDetails
      ),
      getTablesDataBySection(
        pdfData,
        Pages.ServiceDetails,
        Pages.HistoricalSummary
      ),
      getTablesDataBySection(
        pdfData,
        Pages.HistoricalSummary,
        Pages.HistoricalSummary,
        false
      ),
    ];

    setCsvData(newCSVData);
    const balanceSummaryPageIndex = findPagesBetweenSectionNames(
      pdfData,
      Pages.BalanceSummary.title
    );
    const resultsSummaryPageIndex = findPagesBetweenSectionNames(
      pdfData,
      Pages.ResultsSummary.title
    );
    const historySectionPageIndex = findPagesBetweenSectionNames(
      pdfData,
      Pages.HistoricalSummary.title
    );
    let serviceDetailsPageIndex = findPagesBetweenSectionNames(
      pdfData,
      Pages.ServiceDetails.title,
      !historySectionPageIndex.length ? null : Pages.HistoricalSummary.title
    );

    // handling when history page not found in statement
    if (!historySectionPageIndex.length) {
      const sdpi = new Set(serviceDetailsPageIndex);
      sdpi.add(pdfData.document.page.length - 1);
      serviceDetailsPageIndex = Array.from(sdpi);
    }

    // will give us value of points 7, 8
    const balanceSummaryPage =
      pdfData.document.page[balanceSummaryPageIndex[0]];

    const balanceSummaryPageData = findValueInPage(balanceSummaryPage, [
      {
        keyToFind: 'Average Collected Balance',
        keyToFindRegex: /Average Collected Balance/,
        keyToFindValueIndex: 2,
        objectKeyName: 'value7',
      },
      {
        keyToFind: 'Less Balance Required For Services',
        keyToFindRegex: /Less Balance Required For Services/,
        keyToFindValueIndex: 2,
        objectKeyName: 'value8',
      },
    ]);
    // will give us value of points 4, 5, 6, 9
    const resultsSummaryPage =
      pdfData.document.page[resultsSummaryPageIndex[0]];
    const summaryPageData = findValueInPage(resultsSummaryPage, [
      {
        keyToFind: 'Analyzed Results',
        keyToFindRegex: /\$\d{1,3}(?:,\d{3})*\.\d{2}/,
        keyToFindValueIndex: 1,
        objectKeyName: 'value4',
      },
      {
        keyToFind: 'Less Total Analyzed Fees',
        keyToFindRegex: /Less Total Analyzed Fees/,
        keyToFindValueIndex: 1,
        objectKeyName: 'value5',
      },
      {
        keyToFind: 'Earnings Credit at',
        keyToFindRegex: /(\d+\.\d{6})%/,
        keyToFindValueIndex: 1,
        objectKeyName: 'value6',
      },
      {
        keyToFind: 'The total fee-based charge',
        keyToFindRegex: /\$\d{1,3}(?:,\d{3})*\.\d{2}/,
        keyToFindValueIndex: -1,
        objectKeyName: 'totalAnalyzedFeeBasedCharge',
      },
      {
        keyToFind: 'The total analyzed charge',
        keyToFindRegex: /\$\d{1,3}(?:,\d{3})*\.\d{2}/,
        keyToFindValueIndex: -1,
        objectKeyName: 'totalAnalyzedCharge',
      },
    ]);

    const totalFees = calculateTotalFees(summaryPageData);

    const pData = getPayablesOrReceivablesValues(
      pdfData,
      serviceDetailsPageIndex,
      PayablesDataPoints,
      ['value11', 'value12', 'value13']
    );
    const pData2 = getPayablesOrReceivablesValuesV2(
      pdfData,
      serviceDetailsPageIndex,
      PayablesDataPointsV2
    );
    const rData = getPayablesOrReceivablesValues(
      pdfData,
      serviceDetailsPageIndex,
      ReceivablesDataPoints,
      ['value14', 'value15', 'value16']
    );

    const rData2 = getPayablesOrReceivablesValuesV2(
      pdfData,
      serviceDetailsPageIndex,
      ReceivablesDataPointsV2
    );

    const prData2 = getPayablesOrReceivablesValuesV2(
      pdfData,
      serviceDetailsPageIndex,
      PaymentRisksDataPoints
    );

    const estimatedDataPayables = getPayablesOrReceivablesValuesV2(
      pdfData,
      serviceDetailsPageIndex,
      EstimatedTotalPayablesPoints
    );

    const estimatedDataReceivables = getPayablesOrReceivablesValuesV2(
      pdfData,
      serviceDetailsPageIndex,
      EstimatedTotalReceivablesPoints
    );

    // formula B+C+D+E+RTP (from Data Mapping Sheet)
    // this is F
    const estimatedTotalPayables = getEstimatedTotalPayablesValue(
      estimatedDataPayables
    );

    // this is K
    const estimatedTotalReceivables = getEstimatedTotalPayablesValue(
      estimatedDataReceivables
    );

    const paymentMethodsUsed = {
      Wires: pData2['TPA Wire']['Total Volume'],
      ACH: pData2['ACH Origination']['Total Volume'],
      Check: pData2['Checks Paid']['Total Volume'],
      'Automated Payable Solution':
        pData2['Integrated Payables ACH']['Total Volume'],
    };

    const typesOfReceivables = {
      Wires: prData2['Incoming Wires']['Total Volume'],
      'ACH/Check': prData2['Incoming ACH/Check']['Total Volume'],
      'Cash Vault': prData2['Cash Vault']['Total Volume'],
      'Automated Receivables Solution':
        prData2['Integrated Receivables']['Total Volume'],
    };

    // formula = F*.10*$2.49*12
    const opportunity = estimatedTotalPayables * 0.1 * 2.49 * 12;

    const paymentRisksValueD = rData2['Positive Pay Usage']['Total Volume'];
    const paymentRisksValueE = rData2['ACH Positive Pay Usage']['Total Volume'];
    const paymentRisks = {
      balance: {
        total: paymentRisksValueD + paymentRisksValueE,
        isChecked: paymentRisksValueD > 0 && paymentRisksValueE > 0,
      },
      fraudPreventionProducts: updateJsonObject({
        'Positive Pay': paymentRisksValueD,
        'ACH Positive Pay': paymentRisksValueE,
      }),
    };

    // fee allocation logic
    const feeAllocationData = processServiceDetailsPage(
      pdfData,
      serviceDetailsPageIndex
    );

    setFeeAllocationData(feeAllocationData);
    const allData = {
      value1: pageParsedData.name,
      value2: pageParsedData.date,
      valueN: [pageParsedData.naics],
      ...balanceSummaryPageData,
      ...summaryPageData,
      ...pData,
      ...rData,
      opportunity,
      estimatedTotalPayables: Math.round(estimatedTotalPayables),
      estimatedTotalReceivables: Math.round(estimatedTotalReceivables),
      payableData: pData2,
      receivableData: rData2,
      paymentMethodsUsed: updateJsonObject(paymentMethodsUsed),
      typesOfReceivables: updateJsonObject(typesOfReceivables),
      paymentRisks,
      totalFees,
    };
    setDownloadOptions([
      {
        id: 1,
        icon: 'picture_as_pdf',
        key: 'downloadAsPdf',
        name: 'PDF Download',
      },
      {
        id: 2,
        icon: 'format_list_bulleted',
        key: 'downloadAsCSV',
        name: 'CSV Download',
        hide: newCSVData.length === 0,
      },
    ]);
    setReport(allData);
    return allData;
  };

  const onLoadPdf = async (event) => {
    // if excel bank mode skip all scraping and add random fake data
    if (excelBankMode && selectedTenant?.key === DemoTenantsKeys.eb) {
      const estimatedTotalPayables = 546;
      const estimatedTotalReceivables = 391;
      const paymentMethodsUsed = {
        Wires: 1,
        ACH: 1,
        Check: 1,
        'Automated Payable Solution': 0,
      };

      const typesOfReceivables = {
        Wires: 1,
        'ACH/Check': 1,
        'Cash Vault': 1,
        'Automated Receivables Solution': 0,
      };

      // formula = F*.10*$2.49*12
      const opportunity = '1577.40';

      const paymentRisksValueD = 0;
      const paymentRisksValueE = 0;
      const paymentRisks = {
        balance: {
          total: paymentRisksValueD + paymentRisksValueE,
          isChecked: paymentRisksValueD > 0 && paymentRisksValueE > 0,
        },
        fraudPreventionProducts: updateJsonObject({
          'Positive Pay': 0,
          'ACH Positive Pay': 0,
        }),
      };
      setLoader(false);
      setReport({
        value1: organization.name,
        valueN: organization.naics_code ? [organization.naics_code] : [],
        value2: new Date(),
        value4: '$0',
        value5: '$26,763.81',
        value6: '200',
        value7: '$20,117,166.17',
        value8: '$16,215,632.30',
        value9: '$33,069.31',
        value92: '$538,836.57',
        value11: '835',
        value12: ['509'],
        value13: ['51'],
        value14: ['2868'],
        value15: '1598',
        value16: ['379'],
        payableCreditCheck: '0',
        receiveableCreditCard: '0',
        opportunity,
        estimatedTotalPayables: Math.round(estimatedTotalPayables),
        estimatedTotalReceivables: Math.round(estimatedTotalReceivables),
        payableData: {},
        receivableData: {},
        paymentMethodsUsed: updateJsonObject(paymentMethodsUsed),
        typesOfReceivables: updateJsonObject(typesOfReceivables),
        paymentRisks,
        glossary: defaultGlossary,
        totalFees: '$0',
      });
      setFeeAllocationData({
        Wires: 29,
        Lockbox: 28,
        ACH: 1,
        Other: 42,
      });
      setCsvData(fakeCSVData);
      setDownloadOptions([
        {
          id: 1,
          icon: 'picture_as_pdf',
          key: 'downloadAsPdf',
          name: 'PDF Download',
        },
        {
          id: 2,
          icon: 'format_list_bulleted',
          key: 'downloadAsCSV',
          name: 'CSV Download',
          hide: false,
        },
      ]);
      setOpenGenerateReport(true);
    } else {
      const target = event.target.files[0];
      if (target?.type !== 'application/pdf') {
        return setErrorMessage('Only pdf files are allowed.');
      }

      if (target.size > MAX_WEIGHT) {
        return setErrorMessage('PDF file is too large to process.');
      }

      setLoader(true);
      setIsEdited(false);
      const fr = new FileReader();
      fr.onload = async () => {
        const buffer = fr.result;
        const doc = await pdfJS.getDocument(buffer).promise;
        const pageTexts = Array.from({ length: doc.numPages }, async (v, i) => {
          return (await (await doc.getPage(i + 1)).getTextContent()).items;
        });
        const allText = await Promise.all(pageTexts);
        const nameAndDate = getCompanyNameAndStatementDate(
          allText,
          organization,
          isCenturyBank || selectedTenant?.key === DemoTenantsKeys.centb,
          isSVB || selectedTenant?.key === DemoTenantsKeys.svb
        );
        let mapping = {};
        if (isSVB || selectedTenant?.key === DemoTenantsKeys.svb) {
          mapping = processSVBBankStatement(allText, nameAndDate);
        } else {
          mapping = processComericaBankStatement(allText, nameAndDate);
        }
        setDownloadOptions([
          {
            id: 1,
            icon: 'picture_as_pdf',
            key: 'downloadAsPdf',
            name: 'PDF Download',
          },
        ]);
        setFeeAllocationData(mapping.feeAllocationData);
        setReport(mapping);
        setAccordionBlock('0');
        setLoader(false);
        setReportCreated(true);
        setPdf(null);
        setOpenGenerateReport(true);
      };
      fr.readAsDataURL(target);
    }
  };

  const handleManualReport = () => {
    const estimatedTotalPayables = 0;
    const estimatedTotalReceivables = 0;
    const paymentMethodsUsed = {
      Wires: 0,
      ACH: 0,
      Check: 0,
      'Automated Payable Solution': 0,
    };

    const typesOfReceivables = {
      Wires: 0,
      'ACH/Check': 0,
      'Cash Vault': 0,
      'Automated Receivables Solution': 0,
    };

    // formula = F*.10*$2.49*12
    const opportunity = estimatedTotalPayables * 0.1 * 2.49 * 12;

    const paymentRisksValueD = 0;
    const paymentRisksValueE = 0;
    const paymentRisks = {
      balance: {
        total: paymentRisksValueD + paymentRisksValueE,
        isChecked: paymentRisksValueD > 0 && paymentRisksValueE > 0,
      },
      fraudPreventionProducts: updateJsonObject({
        'Positive Pay': 0,
        'ACH Positive Pay': 0,
      }),
    };

    setReport({
      value1: organization.name,
      valueN: organization.naics_code ? [organization.naics_code] : [],
      value2: new Date(),
      value4: '',
      value5: '',
      value6: '',
      value7: '',
      value8: '',
      value9: '',
      value11: '',
      value12: [''],
      value13: [''],
      value14: [''],
      value15: '',
      value16: [''],
      opportunity,
      estimatedTotalPayables: Math.round(estimatedTotalPayables),
      estimatedTotalReceivables: Math.round(estimatedTotalReceivables),
      payableData: {},
      receivableData: {},
      paymentMethodsUsed: updateJsonObject(paymentMethodsUsed),
      typesOfReceivables: updateJsonObject(typesOfReceivables),
      paymentRisks,
      glossary: defaultGlossary,
      totalFees: '',
    });
    setLoader(false);
    setDownloadOptions([
      {
        id: 1,
        icon: 'picture_as_pdf',
        key: 'downloadAsPdf',
        name: 'PDF Download',
      },
      {
        id: 2,
        icon: 'format_list_bulleted',
        key: 'downloadAsCSV',
        name: 'CSV Download',
        hide: false,
      },
    ]);
    setFeeAllocationData({
      Wires: '',
      ACH: '',
      Checks: '',
      Other: '',
    });
    setPdf(null);
    setAccordionBlock('0');
    setSelectedRpt({});
    setIsEdited(false);
    setRptGenerated(false);
  };

  const handleGenerateManualReport = () => {
    let estimatedTotalPayables = 0;
    let estimatedTotalReceivables = 0;
    let paymentMethodsUsed = {
      Wires: 0,
      ACH: 0,
      Check: 0,
      'Automated Payable Solution': 0,
    };

    let typesOfReceivables = {
      Wires: 0,
      'ACH/Check': 0,
      'Cash Vault': 0,
      'Automated Receivables Solution': 0,
    };

    // formula = F*.10*$2.49*12
    let opportunity = estimatedTotalPayables * 0.1 * 2.49 * 12;

    const paymentRisksValueD = 0;
    const paymentRisksValueE = 0;
    const paymentRisks = {
      balance: {
        total: paymentRisksValueD + paymentRisksValueE,
        isChecked: paymentRisksValueD > 0 && paymentRisksValueE > 0,
      },
      fraudPreventionProducts: updateJsonObject({
        'Positive Pay': 0,
        'ACH Positive Pay': 0,
      }),
    };
    if (excelBankMode) {
      estimatedTotalPayables = 546;
      estimatedTotalReceivables = 391;
      paymentMethodsUsed = {
        Wires: 1,
        ACH: 1,
        Check: 1,
        'Automated Payable Solution': 0,
      };

      typesOfReceivables = {
        Wires: 1,
        'ACH/Check': 1,
        'Cash Vault': 1,
        'Automated Receivables Solution': 0,
      };

      // formula = F*.10*$2.49*12
      opportunity = '1577.40';

      setReport({
        value1: organization.name,
        valueN: organization.naics_code ? [organization.naics_code] : [],
        value2: new Date(),
        value4: '$0',
        value5: '$26,763.81',
        value6: '200',
        value7: '$20,117,166.17',
        value8: '$16,215,632.30',
        value9: '$33,069.31',
        value92: '$538,836.57',
        value11: '835',
        value12: ['509'],
        value13: ['51'],
        value14: ['2868'],
        value15: '1598',
        value16: ['379'],
        payableCreditCheck: '0',
        receiveableCreditCard: '0',
        opportunity,
        estimatedTotalPayables: Math.round(estimatedTotalPayables),
        estimatedTotalReceivables: Math.round(estimatedTotalReceivables),
        payableData: {},
        receivableData: {},
        paymentMethodsUsed: updateJsonObject(paymentMethodsUsed),
        typesOfReceivables: updateJsonObject(typesOfReceivables),
        paymentRisks,
        glossary: defaultGlossary,
        totalFees: '$0',
      });
      setFeeAllocationData({
        Wires: 29,
        Lockbox: 28,
        ACH: 1,
        Other: 42,
      });
      setCsvData(fakeCSVData);
      setDownloadOptions([
        {
          id: 1,
          icon: 'picture_as_pdf',
          key: 'downloadAsPdf',
          name: 'PDF Download',
        },
        {
          id: 2,
          icon: 'format_list_bulleted',
          key: 'downloadAsCSV',
          name: 'CSV Download',
          hide: false,
        },
      ]);
    } else {
      setReport({
        value1: organization.name,
        valueN: organization.naics_code ? [organization.naics_code] : [],
        value2: new Date(),
        value4: '',
        value5: '',
        value6: '',
        value7: '',
        value8: '',
        value9: '',
        value11: '',
        value12: [''],
        value13: [''],
        value14: [''],
        value15: '',
        value16: [''],
        opportunity,
        estimatedTotalPayables: Math.round(estimatedTotalPayables),
        estimatedTotalReceivables: Math.round(estimatedTotalReceivables),
        payableData: {},
        receivableData: {},
        paymentMethodsUsed: updateJsonObject(paymentMethodsUsed),
        typesOfReceivables: updateJsonObject(typesOfReceivables),
        paymentRisks,
        glossary: defaultGlossary,
        totalFees: '',
      });
      setFeeAllocationData({
        Wires: '',
        ACH: '',
        Checks: '',
        Other: '',
      });
      setDownloadOptions([
        {
          id: 1,
          icon: 'picture_as_pdf',
          key: 'downloadAsPdf',
          name: 'PDF Download',
        },
        {
          id: 2,
          icon: 'format_list_bulleted',
          key: 'downloadAsCSV',
          name: 'CSV Download',
          hide: false,
        },
      ]);
    }
    setLoader(false);
    setPdf(null);
    setSelectedRpt({});
    setAccordionBlock('0');
    setOpenGenerateReport(true);
    setIsEdited(false);
    setRptGenerated(false);
  };

  const handleEditReport = (page) => {
    setAccordionBlock(page);
    setIsEdited(true);
    setOpenGenerateReport(true);
  };

  const onRemoveFile = () => {
    setPdf(null);
    setLoader(false);
    // abort api request here
    cancelTokenSources.forEach((src) => {
      src.cancel('Request cancelled.');
    });
  };

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
      <GenerateTreasuryReportModal
        report={report}
        organization={organization}
        setReport={setReport}
        selectedTenant={selectedTenant}
        openGenerateReport={openGenerateReport}
        setOpenGenerateReport={setOpenGenerateReport}
        handleGenerateReport={handleGenerateReport}
        feeAllocationData={feeAllocationData}
        setFeeAllocationData={setFeeAllocationData}
        loaderInsights={loaderInsights}
        insightsData={insightsData}
        accordionBlock={accordionBlock}
        isManual={pdf === null}
        scrapeMetaData={reportCreated}
        selectedReport={selectedRpt}
        isEdited={isEdited}
        excelBankMode={excelBankMode}
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
                  onclick={() => handleEditReport('0')}
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
                    downloadOptions={downloadOptions}
                    csvData={csvData}
                    exportToCSV={exportToCSV}
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
            file={pdf}
            setFile={setPdf}
            loader={loader}
            onRemoveFile={onRemoveFile}
            onLoadFile={onLoadPdf}
            uploadIcon="upload_file"
            handleGenerate={handleGenerateManualReport}
            lineBreak={true}
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
                    <div id="rptPdf">
                      <ReportCover
                        name={report.value1}
                        date={report.value2}
                        excelBankMode={excelBankMode}
                        selectedTenant={selectedTenant}
                        report={report}
                        type={ReportTypes.Treasury}
                        organization={organization}
                      />
                      <Overview
                        report={report}
                        excelBankMode={excelBankMode}
                        whenPrinting={startDownload}
                        ignoreHeadings={false}
                        selectedTenant={selectedTenant}
                      />
                      <Payables
                        report={report}
                        ignoreHeadings={false}
                        whenPrinting={startDownload}
                        insightsData={insightsData}
                        selectedTenant={selectedTenant}
                        loaderInsights={loaderInsights}
                      />
                      <Receivables
                        whenPrinting={startDownload}
                        excelBankMode={excelBankMode}
                        ignoreHeadings={false}
                        setReport={setReport}
                        selectedTenant={selectedTenant}
                        report={report}
                        insightsData={insightsData}
                        loaderInsights={loaderInsights}
                      />
                      <Fraud
                        report={report}
                        insightsData={insightsData}
                        selectedTenant={selectedTenant}
                        loaderInsights={loaderInsights}
                        excelBankMode={excelBankMode}
                        whenPrinting={startDownload}
                        ignoreHeadings={false}
                      />
                      <FeeSummary
                        report={report}
                        excelBankMode={excelBankMode}
                        selectedTenant={selectedTenant}
                        feeAllocationData={feeAllocationData}
                        totalPages={totalPages}
                        whenPrinting={startDownload}
                        ignoreHeadings={false}
                      />
                      <Glossary
                        selectedTenant={selectedTenant}
                        ignoreHeadings={false}
                        report={report}
                        whenPrinting={startDownload}
                        setReport={setReport}
                      />
                    </div>
                  </div>
                )}
                <div>
                  <Overview
                    report={report}
                    excelBankMode={excelBankMode}
                    whenPrinting={false}
                    ignoreHeadings={true}
                    selectedTenant={selectedTenant}
                  />
                  <Payables
                    report={report}
                    ignoreHeadings={true}
                    whenPrinting={false}
                    insightsData={insightsData}
                    selectedTenant={selectedTenant}
                    loaderInsights={loaderInsights}
                  />
                  <Receivables
                    whenPrinting={false}
                    excelBankMode={excelBankMode}
                    ignoreHeadings={true}
                    setReport={setReport}
                    selectedTenant={selectedTenant}
                    report={report}
                    insightsData={insightsData}
                    loaderInsights={loaderInsights}
                  />
                  <Fraud
                    report={report}
                    insightsData={insightsData}
                    selectedTenant={selectedTenant}
                    loaderInsights={loaderInsights}
                    excelBankMode={excelBankMode}
                    whenPrinting={startDownload}
                    ignoreHeadings={true}
                  />
                  <FeeSummary
                    report={report}
                    excelBankMode={excelBankMode}
                    selectedTenant={selectedTenant}
                    feeAllocationData={feeAllocationData}
                    totalPages={totalPages}
                    ignoreHeadings={true}
                  />
                  <Glossary
                    selectedTenant={selectedTenant}
                    ignoreHeadings={true}
                    report={report}
                    setReport={setReport}
                  />
                </div>
              </>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default TreasuryManagementReport;
