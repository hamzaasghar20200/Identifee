import moment from 'moment';
import {
  EstimatedTotalPayablesPoints,
  EstimatedTotalReceivablesPoints,
  Pages,
  PayablesDataPointsV2,
  PaymentRisksDataPoints,
  ReceivablesDataPointsV2,
  SVBMapping,
} from './reports.constants';
import { calculateTotalFees } from './pdf.scrape.engine';
import { parseCurrency } from '../../utils/Utils';
import {
  getEstimatedTotalPayablesValue,
  updateJsonObject,
} from './reports.helper.functions';
import _ from 'lodash';

const findValueInPage = (data, searchKeys) => {
  let finalObject = {};
  try {
    data.forEach((row, rowIndex) => {
      const text = row.str;
      searchKeys.forEach((searchKey) => {
        if (text && text.match(searchKey.keyToFind)) {
          const textV = data[rowIndex + 2]?.str;
          const objKey = searchKey.objectKeyName;
          const valueGrabIndex = searchKey.keyToFindValueIndex;
          if (valueGrabIndex === -1) {
            finalObject = {
              ...finalObject,
              [objKey]: text.match(searchKey.keyToFindRegex)[0],
            };
          } else {
            if (objKey === 'value6') {
              finalObject = {
                ...finalObject,
                [objKey]: text.match(searchKey.keyToFindRegex)[0],
                value9: textV, // earnings allowance
              };
            } else {
              if (!Object.hasOwn(finalObject, objKey)) {
                finalObject = {
                  ...finalObject,
                  [objKey]: textV,
                };
              }
            }
          }
        }
      });
    });
  } catch (e) {}
  return finalObject;
};

const flattenDataBetweenIndexes = (
  pdfData,
  sectionIndexes,
  excludeLastPage
) => {
  let sectionsData = [];
  const from = sectionIndexes[0];
  const to = sectionIndexes[1];

  if (excludeLastPage) {
    for (let i = from; i < to; i++) {
      sectionsData = [...sectionsData, ...pdfData[i]];
    }
  } else {
    for (let i = from; i <= to; i++) {
      sectionsData = [...sectionsData, ...pdfData[i]];
    }
  }

  return sectionsData;
};

const getPayablesOrReceivablesValuesV2 = (
  data,
  serviceDetailsPageIndex,
  jsonKeyObject,
  isCenturyBank
) => {
  const allServiceDetailArea = flattenDataBetweenIndexes(
    data,
    serviceDetailsPageIndex
  );

  const finalData = {};
  for (const key in jsonKeyObject) {
    const dataPoints = jsonKeyObject[key];
    const lowerCaseDataPoints = dataPoints.map((s) => s.toLowerCase());
    let fee = 0;
    let volume = 0;
    for (let i = 0; i < allServiceDetailArea.length; i++) {
      const textObj = allServiceDetailArea[i];
      if (
        textObj?.str &&
        !textObj?.str.includes('Comerica Bank') // heck no :\
      ) {
        const name = textObj.str;
        if (
          dataPoints.includes(name) ||
          lowerCaseDataPoints.includes(name.toLowerCase())
        ) {
          const feeValue = allServiceDetailArea[i + 6]?.str || '0';
          const volumeValue = allServiceDetailArea[i + 2]?.str || '0';
          fee += parseCurrency(feeValue);
          volume += parseCurrency(volumeValue);
        }
      }
    }
    finalData[key] = {
      'Total Fee': fee,
      'Total Volume': volume,
    };
  }
  return finalData;
};

const findPagesBetweenSectionNames = (
  pdfData,
  fromSectionName,
  toSectionName = null
) => {
  const pages = pdfData;
  let fromIndex = -1;
  let toIndex = -1;
  const indices = [];

  for (let i = 0; i < pages.length; i++) {
    const columns = pages[i];
    const column = columns.find(
      (col) => col.str?.toLowerCase() === fromSectionName?.toLowerCase()
    );
    const columnTo = columns.find(
      (col) => col.str?.toLowerCase() === toSectionName?.toLowerCase()
    );

    if (column?.str?.toLowerCase() === fromSectionName?.toLowerCase()) {
      fromIndex = i;
      if (toSectionName === null) {
        toIndex = pages.length - 1;
      }
    }
    if (
      toSectionName !== null &&
      columnTo?.str?.toLowerCase() === toSectionName?.toLowerCase() &&
      fromIndex !== -1
    ) {
      toIndex = i;
      indices.push(fromIndex, toIndex);
      break;
    }
    if (toIndex !== -1 && i <= toIndex) {
      if (toSectionName !== null) {
        indices.push(fromIndex, toIndex);
      } else {
        indices.push(fromIndex);
      }
    }
  }
  return [Math.min(...indices), Math.max(...indices)];
};

const svbServiceSectionName = (fullText) => {
  const words = fullText.split(' ');
  const formattedWords = words.slice(1).map((word) => {
    if (word !== '&') {
      const lowerWord = word.toLowerCase();
      if (
        lowerWord === 'se' ||
        lowerWord === 'servic' ||
        lowerWord === 'servi' ||
        lowerWord === 'serv' ||
        lowerWord === 'ser'
      ) {
        return 'Services';
      }
      return word.charAt(0) + lowerWord.slice(1);
    }
    return '&';
  });
  return formattedWords.join(' ');
};

const processServiceDetailsPage = (
  data,
  serviceDetailsPageIndex,
  excludeLastPage,
  isSVBB
) => {
  // get the service details area first
  const bolds = [];
  const allServiceDetailArea = flattenDataBetweenIndexes(
    data,
    serviceDetailsPageIndex,
    excludeLastPage
  );

  let indexStart = 0;
  allServiceDetailArea.every((col, index) => {
    if (
      col?.str === 'Service Details' ||
      col?.str?.toLowerCase() === Pages.ServiceInformation.title.toLowerCase()
    ) {
      indexStart = index;
      return false;
    }
    return true;
  });

  for (let i = indexStart; i < allServiceDetailArea.length; i++) {
    const firstColumn = allServiceDetailArea[i];
    const textObj = firstColumn?.str;
    if (
      textObj &&
      !/\d/.test(textObj) &&
      !textObj?.includes('Comerica Bank') &&
      !textObj?.includes(',') // heck no :\
    ) {
      if (isSVBB) {
        if (textObj?.toLowerCase().includes('subtotal')) {
          bolds.push({
            page: 1,
            row: i,
            section: firstColumn?.str,
          });
        }
      } else {
        // apart from 0th index rest of it should be text: ''
        if (
          allServiceDetailArea[i + 1]?.str === ' ' &&
          allServiceDetailArea[i + 2]?.str &&
          allServiceDetailArea[i + 2]?.str !== ' '
        ) {
          bolds.push({
            page: 1,
            row: i,
            section: firstColumn?.str,
          });
        }
      }
    }
  }

  const boldsWithSections = bolds.map((bb) => bb.section);
  const regexNumber = /^(\d{1,3}(,\d{3})*|\d{1,3}(,\d{3})*\.\d+)$/;
  const fees = [];

  if (isSVBB) {
    for (let i = 0; i < bolds.length; i++) {
      const textObj = allServiceDetailArea[bolds[i].row];
      if (textObj?.str) {
        const name = textObj.str;
        fees.push({
          mainSection: svbServiceSectionName(name),
          subSection: name,
          value: allServiceDetailArea[bolds[i]?.row + 2]?.str,
        });
      }
    }
  } else {
    for (let i = 0; i < allServiceDetailArea.length; i++) {
      const textObj = allServiceDetailArea[i];
      if (textObj?.str) {
        const name = textObj.str;
        const boldSection = bolds.find((b) => b.section === name);
        if (
          boldsWithSections.includes(name) &&
          regexNumber.test(allServiceDetailArea[i + 2]?.str)
        ) {
          fees.push({
            mainSection: regexNumber.test(
              allServiceDetailArea[boldSection?.row - 2]?.str
            )
              ? ''
              : allServiceDetailArea[boldSection?.row - 2]?.str,
            subSection: name,
            value: allServiceDetailArea[boldSection?.row + 6]?.str,
          });
        }
      }
    }
  }
  // Step 1: Group data by mainSection
  const groupedData = {};

  let currentMainSection = null;

  for (const item of fees) {
    if (item.mainSection) {
      currentMainSection = item.mainSection;
      if (!groupedData[currentMainSection]) {
        groupedData[currentMainSection] = { items: [], totalValue: 0 };
      }
    }

    if (currentMainSection !== null) {
      groupedData[currentMainSection].items.push(item);
      if (item.value) {
        const numericValue = parseFloat(item.value) || 0;
        groupedData[currentMainSection].totalValue += numericValue;
      }
    }
  }

  // Step 2: Calculate total sum and determine the top 3 mainSections

  const sortedSections = Object.keys(groupedData).sort((a, b) => {
    const totalValueA = groupedData[a].totalValue;
    const totalValueB = groupedData[b].totalValue;
    return totalValueB - totalValueA;
  });

  const topSections = sortedSections.slice(0, 3);
  const totalSum = sortedSections.reduce(
    (sum, mainSection) => sum + groupedData[mainSection].totalValue,
    0
  );

  // Step 3: Calculate percentages and create final grouped data
  const finalGroupedData = {};

  for (const mainSection of sortedSections) {
    const section = groupedData[mainSection];
    const isTopSection = topSections.includes(mainSection);
    const percentage = Math.round((section.totalValue / totalSum) * 100);

    if (isTopSection) {
      finalGroupedData[mainSection] = { items: section.items, percentage };
    } else {
      finalGroupedData.Other = finalGroupedData.Other || {
        items: [],
        percentage: 0,
      };
      finalGroupedData.Other.items = finalGroupedData.Other.items.concat(
        section.items
      );
      finalGroupedData.Other.percentage += percentage;
    }
  }

  // Rearrange the sections with top 3 above "Other"
  const rearrangedGroupedData = {};

  for (const mainSection of [...topSections, 'Other']) {
    rearrangedGroupedData[mainSection] = finalGroupedData[mainSection];
  }

  // Create the cleanedData object using reduce
  const cleanedData = Object.entries(rearrangedGroupedData).reduce(
    (accumulator, [mainSection, data]) => {
      accumulator[mainSection] = data?.percentage;
      return accumulator;
    },
    {}
  );

  return cleanedData;
};

export const processSVBBankStatement = (pdfData, nameAndDate) => {
  const flatterPdfData = _.flatten(pdfData);
  const serviceDetailsPageIndex = findPagesBetweenSectionNames(
    pdfData,
    Pages.ServiceInformation.title
  );

  const payableData = getPayablesOrReceivablesValuesV2(
    pdfData,
    serviceDetailsPageIndex,
    SVBMapping.PayablesDataPoints,
    false,
    true
  );

  const receivableData = getPayablesOrReceivablesValuesV2(
    pdfData,
    serviceDetailsPageIndex,
    SVBMapping.ReceivablesDataPoints,
    false,
    true
  );

  // formula B+C+D+E+RTP (from Data Mapping Sheet)
  // this is F
  const totalPayables = getPayablesOrReceivablesValuesV2(
    pdfData,
    serviceDetailsPageIndex,
    SVBMapping.EstimatedTotalPayablesPoints,
    false,
    true
  );
  const estimatedTotalPayables = totalPayables.Payables['Total Volume'];

  const totalReceivables = getPayablesOrReceivablesValuesV2(
    pdfData,
    serviceDetailsPageIndex,
    SVBMapping.EstimatedTotalReceivablesPoints,
    false,
    true
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
    true
  );

  // formula = F*.10*$2.49*12
  const opportunity = estimatedTotalPayables * 0.1 * 2.49 * 12;

  const paymentRisksValueD = paymentRisksData['Incoming Wires']['Total Volume'];
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

  const totalFeesPaid = findValueInPage(flatterPdfData, [
    {
      keyToFind: 'Service Charges - Debited',
      keyToFindRegex: /Service Charges - Debited/,
      keyToFindValueIndex: 1,
      objectKeyName: 'totalFeesPaid',
    },
  ]);

  const totalBankFees = findValueInPage(flatterPdfData, [
    {
      keyToFind: 'Total Service Charges Listed',
      keyToFindRegex: /Total Service Charges Listed/,
      keyToFindValueIndex: 3,
      objectKeyName: 'totalBankFees',
    },
  ]);

  const earningsAllowance = findValueInPage(flatterPdfData, [
    {
      keyToFind: /\bEarnings Allowance\b/,
      keyToFindRegex: /\bEarnings Allowance\b/,
      keyToFindValueIndex: 1,
      objectKeyName: 'earningsAllowance',
    },
  ]);

  const ecrRate = findValueInPage(flatterPdfData, [
    {
      keyToFind: /\bEarnings Allowance Rate\b/,
      keyToFindRegex: /\bEarnings Allowance Rate\b/,
      keyToFindValueIndex: 2,
      objectKeyName: 'ecrRate',
    },
  ]);

  const avgNetCollectedBalance = findValueInPage(flatterPdfData, [
    {
      keyToFind: 'Balance To Support Services',
      keyToFindRegex: /Balance To Support Services/,
      keyToFindValueIndex: 2,
      objectKeyName: 'avgNetCollectedBalance',
    },
  ]);

  const nonBalanceServiceChargesListed = findValueInPage(flatterPdfData, [
    {
      keyToFind: 'Non-Balance Compensable Service Charges (F)',
      keyToFindRegex: /Non-Balance Compensable Service Charges (F)/,
      keyToFindValueIndex: 3,
      objectKeyName: 'nonBalanceServiceChargesListed',
    },
  ]);

  const totalServicesChargesListed = findValueInPage(flatterPdfData, [
    {
      keyToFind: 'Total Service Charges Listed',
      keyToFindRegex: /Total Service Charges Listed/,
      keyToFindValueIndex: 3,
      objectKeyName: 'totalServicesChargesListed',
    },
  ]);

  const reserveRequirementRate = findValueInPage(flatterPdfData, [
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
    serviceDetailsPageIndex,
    false,
    true
  );

  const allData = {
    value1: nameAndDate.name,
    value2: nameAndDate.date,
    valueN: [nameAndDate.naics],
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
    feeAllocationData,
  };
  return allData;
};
export const processComericaBankStatement = (pdfData, nameAndDate) => {
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
    !historySectionPageIndex.length ||
      historySectionPageIndex.includes(Infinity)
      ? null
      : Pages.HistoricalSummary.title
  );

  // handling when history page not found in statement
  if (
    !historySectionPageIndex.length ||
    historySectionPageIndex.includes(Infinity)
  ) {
    const sdpi = new Set(serviceDetailsPageIndex);
    sdpi.add(pdfData.length - 1);
    serviceDetailsPageIndex = Array.from(sdpi);
  }

  // will give us value of points 7, 8
  const balanceSummaryPage = pdfData[balanceSummaryPageIndex[0]];

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
  const resultsSummaryPage = pdfData[resultsSummaryPageIndex[0]];
  const resultsSummaryPageData = findValueInPage(resultsSummaryPage, [
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

  const totalFees = calculateTotalFees(resultsSummaryPageData);

  const pData2 = getPayablesOrReceivablesValuesV2(
    pdfData,
    serviceDetailsPageIndex,
    PayablesDataPointsV2
  );

  const rData2 = getPayablesOrReceivablesValuesV2(
    pdfData,
    serviceDetailsPageIndex,
    ReceivablesDataPointsV2
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

  const prData2 = getPayablesOrReceivablesValuesV2(
    pdfData,
    serviceDetailsPageIndex,
    PaymentRisksDataPoints
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

  const feeAllocationData = processServiceDetailsPage(
    pdfData,
    serviceDetailsPageIndex,
    true,
    false
  );
  return {
    ...balanceSummaryPageData,
    ...resultsSummaryPageData,
    value1: nameAndDate.name,
    value2: nameAndDate.date,
    valueN: [nameAndDate.naics],
    opportunity,
    estimatedTotalPayables: Math.round(estimatedTotalPayables),
    estimatedTotalReceivables: Math.round(estimatedTotalReceivables),
    payableData: pData2,
    receivableData: rData2,
    paymentMethodsUsed: updateJsonObject(paymentMethodsUsed),
    typesOfReceivables: updateJsonObject(typesOfReceivables),
    paymentRisks,
    totalFees,
    feeAllocationData,
  };
};

export const getCompanyNameAndStatementDate = (
  data,
  organization,
  isCenturyBank,
  isSVBB
) => {
  const rows = data[0]; // 0 has first page data as array of objects
  if (isSVBB) {
    const accountNameIndex = rows.findIndex((s) =>
      s.str.includes('Statement Ending')
    );
    const regex = /(\d{2}\/\d{2}\/\d{2})/; // Matches date in the format MM/DD/YY
    const statementDate = rows[accountNameIndex].str;
    const companyName = rows[0].str; // could break for some statements, will figure it out
    const match = statementDate.match(regex);
    if (match) {
      const convertScrappedDate = moment(match[1]);
      return {
        name: companyName,
        date: new Date(
          convertScrappedDate.year(),
          convertScrappedDate.month(),
          convertScrappedDate.date()
        ),
        naics: organization.naics_code,
      };
    }
    return {};
  } else {
    // for comerica
    const accountNameIndex = rows.findIndex((s) => s.str === 'Account:');
    const dateCycleIndex = rows.findIndex((s) => s.str === 'Cycle:');
    const accountName = rows[accountNameIndex - 2].str;
    const cycleDateText = rows[dateCycleIndex + 2].str;
    const dateParts = cycleDateText.split(', ');
    const monthName = dateParts[0];
    const year = dateParts[1];
    const monthNumber = new Date(Date.parse(monthName + ' 1, 2000')).getMonth();
    const dateObj = new Date(year, monthNumber);
    return {
      date: dateObj,
      name: accountName,
      naics: organization.naics_code,
    };
  }
};
