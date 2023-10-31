import _ from 'lodash';
import moment from 'moment';

export const getEstimatedTotalPayablesValue = (payablesData) => {
  let sum = 0;

  for (const key in payablesData) {
    const obj = payablesData[key];
    sum += obj['Total Volume'];
  }

  return sum;
};

// this converts {ACH: 0} -> {ACH: {key: ACH, value: 0}}
export const updateJsonObject = (originalObject = {}) => {
  return Object.entries(originalObject).reduce((acc, [key, value]) => {
    try {
      if (_.isObject(value)) {
        acc[key] = { key: value.key, value: value.value };
      } else {
        acc[key] = { key, value };
      }
    } catch (e) {
      acc[key] = { key, value };
    }
    return acc;
  }, {});
};

// this extracts date from pdf
export const getCycleDate = (dateText) => {
  const momentDate = moment(dateText).format('MMMM, YYYY');
  const dateParts = momentDate.split(', ');
  const monthName = dateParts[0];
  const year = dateParts[1];

  const monthNumber = new Date(Date.parse(monthName + ' 1, 2000')).getMonth();

  return new Date(year, monthNumber);
};

export const getReportName = (rpt) => {
  // name and date
  return `${rpt?.value1 || rpt?.companyName || rpt?.name} ${moment(
    rpt?.value2 || rpt?.reportDate
  ).format('MMMM, YYYY')}`;
};
