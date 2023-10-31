import {
  capitalizeEachWord,
  numbersWithComma,
  parseCurrency,
} from '../../utils/Utils';
import _ from 'lodash';
import moment from 'moment/moment';
import { Pages } from './reports.constants';

export const regexFee = /^(\d{1,3}(,\d{3})*|\d+)(\.\d+)?$/;

export const findAccountAndDate = (
  data,
  organization,
  isCenturyBank,
  isSVBB
) => {
  const rows = data?.row || [];
  let finalObject = {
    date: '',
    name: '',
    naics: organization.naics_code,
  };

  // adding for century bank because its statement is different than rest
  if (isCenturyBank) {
    rows.forEach((row) => {
      const rowColumns = row.column;
      rowColumns.forEach((column, index) => {
        const text = column.text;
        if (text.text === 'Date Prepared') {
          const rptScrappedDate = rowColumns[index + 1].text;
          const convertScrappedDate = moment(rptScrappedDate.text); // .format('M/DD/YY');
          finalObject = {
            ...finalObject,
            date: new Date(
              convertScrappedDate.year(),
              convertScrappedDate.month(),
              convertScrappedDate.date()
            ),
          };
        }
      });
    });
    finalObject = {
      ...finalObject,
      name: rows[2].column[0].text.text, // name is always at 2nd index so getting that
    };
  } else if (isSVBB) {
    const regex = /(\d{2}\/\d{2}\/\d{2})/; // Matches date in the format MM/DD/YY
    const statementDate = rows[2].column[1].text?.text;
    const companyName = rows[8].column[0].text?.text; // could break for some statements, will figure it out
    const match = statementDate.match(regex);
    if (match) {
      const convertScrappedDate = moment(match[1]);
      finalObject = {
        ...finalObject,
        name: companyName,
        date: new Date(
          convertScrappedDate.year(),
          convertScrappedDate.month(),
          convertScrappedDate.date()
        ),
      };
    }
  } else {
    rows.forEach((row) => {
      const rowColumns = row.column;
      rowColumns.forEach((column, index) => {
        const text = column.text;
        if (text.text === 'Account:') {
          finalObject = { ...finalObject, name: rowColumns[0].text.text };
        } else if (text.text === 'Cycle:') {
          let dateParts = [];
          try {
            dateParts = rowColumns[4].text.text.split(', ');
          } catch (e) {
            dateParts = rowColumns[index + 1].text.text.split(', ');
          }
          const monthName = dateParts[0];
          const year = dateParts[1];

          const monthNumber = new Date(
            Date.parse(monthName + ' 1, 2000')
          ).getMonth();

          const dateObj = new Date(year, monthNumber);
          finalObject = {
            ...finalObject,
            date: dateObj,
          };
        }
      });
    });
  }

  return finalObject;
};

export const getNameAndTotalFee = (data) => {
  if (
    data.length > 3 &&
    !data[0].text?.text?.toLowerCase().includes('subtotal') // for svb
  ) {
    const feeColumn = data[3].text;
    if (
      feeColumn.fontStyle !== 'Bold' &&
      feeColumn.text &&
      regexFee.test(feeColumn.text)
    ) {
      return {
        text: data[0].text.text,
        totalFee: feeColumn.text,
      };
    }
  }
  return null;
};

export const addMissingRowsBySectionsData = (data, allServiceDetailArea) => {
  const newData = [];
  let prevPage = null;
  let prevRow = null;

  for (let i = 0; i < data.length; i++) {
    const { page, row, section } = data[i];

    if (
      prevPage !== null &&
      prevPage === page &&
      prevRow !== null &&
      prevRow < row - 1
    ) {
      for (let j = prevRow + 1; j < row; j++) {
        newData.push({
          page,
          row: j,
          feeSection: getNameAndTotalFee(allServiceDetailArea[j].column),
        });
      }
    }

    newData.push({ page, row, section });

    if (i === data.length - 1 && row < getMaxRow(page, data)) {
      for (let j = row + 1; j <= getMaxRow(page, data); j++) {
        newData.push({
          page,
          row: j,
          feeSection: getNameAndTotalFee(allServiceDetailArea[j].column),
        });
      }
    }

    prevPage = page;
    prevRow = row;
  }

  return newData;
};

export const getMaxRow = (page, data) => {
  return Math.max(
    ...data.filter((obj) => obj.page === page).map((obj) => obj.row)
  );
};

export const checkIfRestIsEmpty = (columns) => {
  const rest = columns.slice(1, columns.length);
  return rest.every((c) => !c.text);
};

export const flattenDataBetweenIndexes = (
  pdfData,
  sectionIndexes,
  excludeLastPage
) => {
  let sectionsData = [];
  const from = sectionIndexes[0];
  const to = sectionIndexes[1];

  if (excludeLastPage) {
    for (let i = from; i < to; i++) {
      sectionsData = [...sectionsData, ...pdfData.document.page[i].row];
    }
  } else {
    for (let i = from; i <= to; i++) {
      sectionsData = [...sectionsData, ...pdfData.document.page[i].row];
    }
  }

  return sectionsData;
};

export const sumOfValues = (data) => {
  const sums = {};
  for (const key in data) {
    const dataArray = data[key];
    if (dataArray?.length) {
      const numbers = dataArray.map((num) => parseFloat(num.replace(',', '')));
      const sum = numbers.reduce((acc, cur) => acc + cur);
      sums[key] = sum;
    }
  }
  return sums;
};

export const calculateTotalFees = (summaryPageData) => {
  const totalAnalyzedFeeBasedCharge = Object.hasOwn(
    summaryPageData,
    'totalAnalyzedFeeBasedCharge'
  )
    ? summaryPageData.totalAnalyzedFeeBasedCharge
    : '$0';
  const totalAnalyzedCharge = Object.hasOwn(
    summaryPageData,
    'totalAnalyzedCharge'
  )
    ? summaryPageData.totalAnalyzedCharge
    : '$0';

  const totalFees =
    parseCurrency(totalAnalyzedFeeBasedCharge) +
    parseCurrency(totalAnalyzedCharge);
  return totalFees === 0 ? '$0' : numbersWithComma(totalFees);
};

export const getPayablesOrReceivablesValues = (
  data,
  serviceDetailsPageIndex,
  jsonKeyObject,
  returnObjectKeys
) => {
  const allServiceDetailArea = flattenDataBetweenIndexes(
    data,
    serviceDetailsPageIndex
  );

  const finalData = {};
  for (let i = 0; i < allServiceDetailArea.length; i++) {
    const rows = allServiceDetailArea[i];
    const cols = rows.column;
    const firstColumn = cols[0];
    const textObj = firstColumn.text;
    if (
      textObj?.text &&
      !/\d/.test(textObj?.text) &&
      !textObj?.text.includes('Comerica Bank') // heck no :\
    ) {
      const name = textObj.text;
      const value = cols[1]?.text?.text || '0';
      if (jsonKeyObject.Checks.includes(name)) {
        if (!finalData.Checks) {
          finalData.Checks = [];
        }
        finalData.Checks.push(value);
      }
      if (jsonKeyObject.ACH.includes(name)) {
        if (!finalData.ACH) {
          finalData.ACH = [];
        }
        finalData.ACH.push(value);
      }
      if (jsonKeyObject.Wires.includes(name)) {
        if (!finalData.Wires) {
          finalData.Wires = [];
        }
        finalData.Wires.push(value);
      }
    }
  }
  return sumOfValues({
    [returnObjectKeys[0]]: finalData.Checks || [],
    [returnObjectKeys[1]]: finalData.ACH || [],
    [returnObjectKeys[2]]: finalData.Wires || [],
  });
};

export const getPayablesOrReceivablesValuesV2 = (
  data,
  serviceDetailsPageIndex,
  jsonKeyObject,
  isCenturyBank,
  isSVBB
) => {
  const allServiceDetailArea = isCenturyBank
    ? data.document.page.row
    : flattenDataBetweenIndexes(data, serviceDetailsPageIndex);

  const finalData = {};
  for (const key in jsonKeyObject) {
    const dataPoints = jsonKeyObject[key];
    const lowerCaseDataPoints = dataPoints.map((s) => s.toLowerCase());
    let fee = 0;
    let volume = 0;
    for (let i = 0; i < allServiceDetailArea.length; i++) {
      const rows = allServiceDetailArea[i];
      const cols = rows.column;
      const firstColumn = cols[0];
      const textObj = firstColumn.text;
      if (
        textObj?.text &&
        !textObj?.text.includes('Comerica Bank') // heck no :\
      ) {
        const name = textObj.text;
        const feeValue = cols[3]?.text?.text || '0';
        const volumeValue = cols[1]?.text?.text || '0';

        if (
          dataPoints.includes(name) ||
          lowerCaseDataPoints.includes(name.toLowerCase())
        ) {
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

const notInHeaders = (lookup, pageHeaders) => {
  const flatten = _.flatten(pageHeaders.map((p) => p.column));
  const found = flatten.find((f) => {
    return f.text?.text
      ?.toLowerCase()
      ?.includes(lookup?.text?.text?.toLowerCase());
  });
  return found;
};

export const processServiceDetailsPage = (data, serviceDetailsPageIndex) => {
  // get the service details area first
  const bolds = [];
  const allServiceDetailArea = flattenDataBetweenIndexes(
    data,
    serviceDetailsPageIndex
  );

  let indexStart = 0;
  allServiceDetailArea.every((s, index) => {
    const cols = s.column;
    if (
      cols.find(
        (c) =>
          c.text?.text === 'Service Details' ||
          c.text?.text?.toLowerCase() ===
            Pages.ServiceInformation.title.toLowerCase()
      )
    ) {
      indexStart = index;
      return false;
    }
    return true;
  });
  const pageHeaders = allServiceDetailArea.slice(0, indexStart);

  for (let i = 0; i < allServiceDetailArea.length; i++) {
    const rows = allServiceDetailArea[i];
    const cols = rows.column;
    const firstColumn = cols[0];
    const textObj = firstColumn.text;
    if (notInHeaders(firstColumn, pageHeaders)) {
      continue;
    }
    if (
      textObj?.text &&
      !/\d/.test(textObj?.text) &&
      !textObj?.text.includes('Comerica Bank') &&
      !textObj?.text.includes(',') // heck no :\
    ) {
      // apart from 0th index rest of it should be text: ''
      if (checkIfRestIsEmpty(cols)) {
        bolds.push({
          page: 1,
          row: i,
          section: capitalizeEachWord(firstColumn.text.text),
        });
      }
    }
  }

  const serviceDataBySection = addMissingRowsBySectionsData(
    bolds,
    allServiceDetailArea
  );

  const dataWithSections = serviceDataBySection
    .filter((f) => !!f.feeSection || f.section)
    .slice(0, -1);
  const result = {};
  let currentSection = '';

  for (let i = 0; i < dataWithSections.length; i++) {
    const obj = dataWithSections[i];
    if (obj.section) {
      currentSection = obj.section;
    } else {
      if (!result[currentSection]) {
        result[currentSection] = [];
      }
      obj.belongsTo = currentSection;
      result[currentSection].push(obj);
    }
  }

  const maxSections = {};
  for (const section in result) {
    const fees = result[section].map((obj) =>
      parseFloat(obj.feeSection.totalFee.replace(/,/g, ''))
    );
    const sum = fees.reduce((acc, curr) => acc + curr, 0);
    maxSections[section] = sum;
  }

  const entries = Object.entries(maxSections);
  const sortedEntries = entries.sort((a, b) => b[1] - a[1]);
  const total = entries.reduce((acc, curr) => acc + curr[1], 0);
  const top3 = sortedEntries.slice(0, 3);
  const rest = sortedEntries.slice(3);

  const resultPercentage = {};
  top3.forEach(([key, value]) => {
    resultPercentage[key] = ((value / total) * 100).toFixed(2);
  });
  resultPercentage.Other = (
    (rest.reduce((total, [key, value]) => {
      return total + value;
    }, 0) /
      total) *
    100
  ).toFixed(2);

  return resultPercentage;
};

export const findPagesBetweenSectionNames = (
  data,
  fromSectionName,
  toSectionName = null
) => {
  const pages = data.document.page;
  let fromIndex = -1;
  let toIndex = -1;
  const indices = [];

  for (let i = 0; i < pages.length; i++) {
    const rows = pages[i].row;
    for (let j = 0; j < rows.length; j++) {
      const columns = rows[j].column;
      const column = columns.find(
        (col) =>
          col.text?.text?.toLowerCase() === fromSectionName?.toLowerCase()
      );
      const columnTo = columns.find(
        (col) => col.text?.text?.toLowerCase() === toSectionName?.toLowerCase()
      );
      if (
        column?.text?.text?.toLowerCase() === fromSectionName?.toLowerCase()
      ) {
        fromIndex = i;
        if (toSectionName === null) {
          toIndex = pages.length - 1;
        }
      }
      if (
        toSectionName !== null &&
        columnTo?.text?.text?.toLowerCase() === toSectionName?.toLowerCase() &&
        fromIndex !== -1
      ) {
        toIndex = i;
        break;
      }
    }
    if (toIndex !== -1 && i <= toIndex) {
      if (toSectionName !== null) {
        indices.push(fromIndex, toIndex);
      } else {
        indices.push(fromIndex);
      }
    }
  }

  return indices;
};

export const getTablesDataBySection = (
  pdfData,
  sectionFrom,
  sectionTo,
  excludeLastPage = true
) => {
  // this will give us starting index and ending index of data to fetched between sections
  const sectionIndexes = findPagesBetweenSectionNames(
    pdfData,
    sectionFrom.title,
    sectionTo.title
  );

  const sectionData = flattenDataBetweenIndexes(
    pdfData,
    sectionIndexes,
    excludeLastPage
  );

  const finalData = {
    name: sectionFrom.title,
    data: {
      headers: sectionFrom.headers,
      values: [],
    },
  };
  for (let i = 0; i < sectionData.length; i++) {
    const rows = sectionData[i];
    const cols = rows.column;
    const firstColumn = cols[0];
    const textObj = firstColumn.text;
    const filterOutEmptyTextNodes = cols?.filter((c) => !!c.text);
    if (
      textObj?.text &&
      filterOutEmptyTextNodes?.length === sectionFrom.headers.length &&
      !sectionFrom.headers.includes(textObj?.text)
    ) {
      finalData.data.values.push(
        cols.filter((f) => !!f.text).map((c) => c.text.text)
      );
    }
  }
  return finalData;
};

const checkRestColumnAndGetValue = (columns) => {
  // minus first index and loop from second
  const cols = columns.slice(1, columns.length);
  const firstCol = cols.find((c) => !!c.text.text);
  return firstCol?.text?.text;
};

export const findValueInPage = (data, searchKeys) => {
  let finalObject = {};
  try {
    const rows = Array.isArray(data) ? data : data.row;
    rows.forEach((row, rowIndex) => {
      const rowColumns = row.column;
      rowColumns.forEach((column) => {
        const text = column.text;
        searchKeys.forEach((searchKey) => {
          if (text && text.text.match(searchKey.keyToFind)) {
            const objKey = searchKey.objectKeyName;
            const valueGrabIndex = searchKey.keyToFindValueIndex;
            if (valueGrabIndex === -1) {
              finalObject = {
                ...finalObject,
                [objKey]: text.text.match(searchKey.keyToFindRegex)[0],
              };
            } else {
              if (objKey === 'value6') {
                finalObject = {
                  ...finalObject,
                  [objKey]: text.text.match(searchKey.keyToFindRegex)[0],
                  value9: rowColumns[valueGrabIndex].text.text, // earnings allowance
                };
              } else {
                if (!Object.hasOwn(finalObject, objKey)) {
                  finalObject = {
                    ...finalObject,
                    [objKey]: searchKey.nextRowValue
                      ? rows[rowIndex + 1].column[valueGrabIndex].text.text
                      : rowColumns[valueGrabIndex].text.text ||
                        checkRestColumnAndGetValue(rowColumns),
                  };
                }
              }
            }
          }
        });
      });
    });
  } catch (e) {}
  return finalObject;
};
