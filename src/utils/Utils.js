import moment from 'moment';
import routes from './routes.json';
import usaStates from '../components/organizations/Constants.states.json';
import _ from 'lodash';
import { useNewPermissionContext } from '../contexts/newPermissionContext';
import { getStateAbbreviation } from '../components/prospecting/constants';
import { useContext } from 'react';
import { TenantContext } from '../contexts/TenantContext';
import useIsTenant from '../hooks/useIsTenant';
export const DATE_FORMAT = 'MM/DD/YYYY';
export const DATE_FORMATZ = 'MM/DD/YYYY[Z]';
export const formatHHMM = 'hh:mm A';
export const formatHHMMSS = 'hh:mm:ss A';
export const DATE_FORMAT_REPEAT = 'YYYY-MM-DD';
export const DATE_FORMAT_EJS = 'MM/dd/yyyy';
export const DATE_FORMAT_EJS_UPDATED = 'MM/DD/YYYY';
export const DATE_FORMAT_TIME = 'MM/DD/YYYY hh:mm:ss A';
export const DATE_FORMAT_TIME_WO_SEC = 'MM/DD/YYYY h:mm A';

export const DATE_FORMAT_Z = 'MM/DD/YYYYTHH:mm:ssZ';
export const DATE_FORMAT_Z2 = 'MM/DD/YYYYTHH:mm:ss.SSS[Z]';
export const DATE_FORMAT_DASHED_TZ = 'YYYY-MM-DDTHH:mm:ss.SSS[Z]';
export const PROSPECT_RIGHT_PANEL_WIDTH = 468;
export const RIGHT_PANEL_WIDTH = 625;

const today = new Date();

const startOfWeek = new Date(
  today.getFullYear(),
  today.getMonth(),
  today.getDate() - today.getDay()
);

const endOfWeek = new Date(
  today.getFullYear(),
  today.getMonth(),
  today.getDate() + (6 - today.getDay())
);
// Calculate the start of last week (Monday)
const startOfLastWeek = new Date(
  today.getTime() - (today.getDay() + 6) * 24 * 60 * 60 * 1000
);

// Calculate the end of last week (Sunday)
const endOfLastWeek = new Date(
  today.getTime() - today.getDay() * 24 * 60 * 60 * 1000
);

// Format the dates as strings
export const startOfLastWeekString = startOfLastWeek
  .toISOString()
  .substring(0, 10);
export const endOfLastWeekString = endOfLastWeek.toISOString().substring(0, 10);
export const startOfWeekString = startOfWeek.toISOString().substring(0, 10);
export const endOfWeekString = endOfWeek.toISOString().substring(0, 10);
export const createBlobObject = (file) => {
  return new Blob([file], { type: file.type });
};

export const base64ToBlob = (base64) => {
  return fetch(base64).then((res) => res.blob());
};

export const createObjectURL = (blobFile) => {
  return window.URL.createObjectURL(blobFile);
};

export const formateDate = function (mm, dd, year) {
  mm = mm + 1;
  return [year, (mm > 9 ? '' : '0') + mm, (dd > 9 ? '' : '0') + dd].join('');
};

export const emailRegex =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
export const validateEmail = (mail = '') => {
  return !(mail === '' || !emailRegex.test(mail));
};
export const urlRegex =
  /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;

export const isValidURL = (url) => {
  return !(url === '' || urlRegex.test(url));
};

export const validateEmails = (emails = []) => {
  const result = emails.filter((email) => !validateEmail(email));
  return { isValid: result.length === 0, invalidEmails: result };
};

export const isAlphanumeric = (value) => {
  if (/[^0-9a-zA-Z\s]/.test(value)) {
    return false;
  }
  return true;
};

export const isMatchInCommaSeperated = (input, value) => {
  if (
    input
      ?.toLowerCase()
      ?.match(new RegExp('(?:^|,)' + value.toLowerCase() + '(?:,|$)'))
  ) {
    return true;
  }
  return false;
};

export const checkStringsInInput = (inputString, searchStrings) => {
  const inputList = inputString.split(',');
  for (let i = 0; i < searchStrings.length; i++) {
    const searchString = searchStrings[i];
    if (inputList.indexOf(searchString.toLowerCase()) !== -1) {
      return true;
    }
  }
  return false;
};

export const isDisplayWelcomeScreen = (modules) => {
  return (
    modules &&
    modules !== '*' &&
    isMatchInCommaSeperated(modules, 'welcome_screen')
  );
};
export const isModuleAllowed = (modules, value) => {
  if (!modules || modules === '*') {
    return true;
  } else {
    return isMatchInCommaSeperated(modules, value);
  }
};

export const isPermissionAllowed = (
  collection,
  action,
  tenantName = '',
  permissionContext = undefined
) => {
  try {
    const { tenant } = useContext(TenantContext);
    const context = permissionContext || useNewPermissionContext();
    const { permissionChanges } = context;
    const permissionsCheck = permissionChanges.filter((item) => {
      return item.collection === collection;
    });
    const permissionAction = permissionsCheck?.find((child) => {
      return child.action === action;
    });
    if (tenantName) {
      return (
        permissionAction.collection === collection &&
        permissionAction.action === action &&
        isModuleAllowed(tenant.modules, tenantName)
      );
    } else if (permissionAction) {
      return (
        permissionAction.collection === collection &&
        permissionAction.action === action
      );
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
};

export const getIdfToken = (parsed = false) => {
  const host = window.location.host.split('.');
  const hostTokenKey = `${host[0]}-idftoken`;
  return parsed
    ? JSON.parse(localStorage.getItem(hostTokenKey) || '{}')
    : localStorage.getItem(hostTokenKey);
};

export const setIdfToken = (tokenData) => {
  const host = window.location.host.split('.');
  localStorage.setItem(host[0] + '-idftoken', tokenData);
};

export const removeIdfToken = (tokenData) => {
  const host = window.location.host.split('.');
  localStorage.removeItem(host[0] + '-idftoken');
};

export const getRootComponentName = (tenant) => {
  const today = moment().format('ddd MMMM DD');
  let moduleis = [today];
  if (
    checkStringsInInput(tenant.modules, [
      'Dashboards',
      'home',
      'new_home',
      'dashboard',
      '*',
    ])
  ) {
    moduleis = [today];
    return moduleis;
  }
  if (isModuleAllowed(tenant.modules, 'companies')) {
    return (moduleis = useIsTenant().isSynovusBank
      ? ['Insights']
      : ['Companies']);
  }
  if (isModuleAllowed(tenant.modules, 'contacts')) {
    return (moduleis = ['Contacts']);
  }
  if (isModuleAllowed(tenant.modules, 'pipelines')) {
    return (moduleis = ['Deals']);
  }
  if (isModuleAllowed(tenant.modules, 'activities')) {
    return (moduleis = ['Activities']);
  }
  if (isModuleAllowed(tenant.modules, 'reporting')) {
    return (moduleis = ['Resources']);
  }
  if (isModuleAllowed(tenant.modules, 'reporting')) {
    return (moduleis = ['Insights']);
  }
  if (isModuleAllowed(tenant.modules, 'learn')) {
    return (moduleis = ['Training']);
  }
  if (isModuleAllowed(tenant.modules, 'prospecting')) {
    return (moduleis = ['Prospecting']);
  }
  return moduleis;
};

export const isEmpty = (value) => {
  if (!value || !value.trim()) return true;

  return false;
};

export const isDefined = (value) => {
  if (!value || value === 'undefined') return false;

  return true;
};

export const convertTime12to24 = (time12h) => {
  const [time, modifier] = time12h.split(' ');

  let [hours, minutes] = time.split(':');

  if (hours === '12') {
    hours = '00';
  }

  if (modifier === 'PM') {
    hours = parseInt(hours, 10) + 12;
  }

  return `${hours}:${minutes}`;
};

export const checkDate = (data) => {
  const TODAY = moment().clone().startOf('day');
  const TOMORROW = moment().add(1, 'day');

  if (!data?.done) {
    if (new Date(data?.start_date) < new Date()) {
      return 'text-danger';
    }
  }

  if (moment(data.start_date, DATE_FORMAT_Z).isSame(TODAY, 'd')) {
    return 'text-success';
  }

  if (moment(data.start_date, DATE_FORMAT_Z).isSame(TOMORROW, 'd')) {
    return 'text-primary';
  }

  return '';
};
export const setDateFormat = (date, format = 'MM/DD/YYYY LT') => {
  return moment(date).format(format);
};

export const setDateFormatUTC = (date, format = 'MM/DD/YYYY LT') => {
  return moment(date, DATE_FORMAT_Z).utc().format(format);
};

export const floorFigure = (figure, decimals = 2) => {
  const d = 10 ** decimals;
  return (parseInt(figure * d, 10) / d).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: decimals,
  });
};

export const valueNumberValidator = (value, decimals = 0, max, min = 0) => {
  const inputNumber = Number(value);
  if (Number.isNaN(inputNumber)) {
    value = parseFloat(value) || '';
  }

  if (max && max > min) {
    if (value > max) {
      value = parseInt(
        Math.max(Number(min), Math.min(Number(max), Number(value) / 10))
      );
    }
  }

  if (Number(value) - parseInt(value) > 0) {
    const textValue = value.toString();
    const index = textValue.indexOf('.');

    if (textValue.length - index - 1 > decimals) {
      value = Number(value).toFixed(decimals);
    }
  }

  return value;
};

export const isToFixedNoRound = (num = 0, decimals = 2) => {
  const newNum = parseFloat(num);
  if (Number.isNaN(newNum)) {
    return '$0';
  }
  return floorFigure(num, decimals);
};

export const decimalToNumber = (num = 0) => {
  const newNum = parseInt(num);
  if (Number.isNaN(newNum)) {
    return '0';
  }
  return newNum;
};

export const formatNumber = (
  num,
  decimals = 2,
  mandatoryDecimals = 0,
  parseMillions = true
) => {
  const newNum = parseFloat(num);
  if (Number.isNaN(newNum)) {
    return '0';
  }
  if (parseMillions && newNum >= 1e6) {
    return `${isToFixedNoRound(newNum / 1e6, decimals)}M`;
  }

  if (mandatoryDecimals > 0) {
    return isToFixedNoRound(newNum.toFixed(mandatoryDecimals), decimals);
  }
  return isToFixedNoRound(newNum, decimals);
};

export const formatDecimalFixed = (num, decimals = 2) => {
  const newNum = parseFloat(num);
  if (Number.isNaN(newNum)) {
    return '0';
  }

  return newNum.toFixed(decimals);
};

// converts 2100000 to $210k etc
export const formatNumberV2 = (number) => {
  if (!number || number === '') {
    return '$0';
  }
  const suffixes = ['', 'K', 'M', 'B', 'T', 'Q'];
  const magnitude = Math.floor((Math.log10(number) + 1) / 3);

  if (magnitude >= suffixes.length) {
    const formatted = number.toExponential(2);
    return formatted;
  }

  const scaled = number / Math.pow(10, magnitude * 3);
  const formatter = new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: scaled < 10 ? 2 : scaled < 100 ? 1 : 0,
  });
  const formatted = formatter.format(scaled);

  const suffixMagnitude = magnitude < 0 ? '' : suffixes[magnitude];
  return `$${formatted}${suffixMagnitude}`;
};

export const roundDecimalToNumber = (num) => {
  const newNum = parseFloat(num);
  if (Number.isNaN(newNum)) {
    return '0';
  }

  return Math.round(newNum);
};

export const parseJwt = (token) => {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    window
      .atob(base64)
      .split('')
      .map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join('')
  );

  return JSON.parse(jsonPayload);
};

export const getFileSize = (size) => {
  const byteUnits = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const fileSize = Math.floor(Math.log(size) / Math.log(1024));
  const fSize = (size / Math.pow(1024, fileSize)).toFixed(2);
  return `${!isNaN(fSize) ? fSize : 0} ${byteUnits[fileSize] || 'B'}`;
};

export const MaxByCriteria = (array, key) => {
  return array?.reduce((max, obj) =>
    parseFloat(max[key]) > parseFloat(obj[key]) ? max : obj
  );
};

export const capitalizeEachWord = (inputString) => {
  const words = inputString.toLowerCase().split(' ');
  const capitalizedWords = words.map(
    (word) => word.charAt(0).toUpperCase() + word.slice(1)
  );
  return capitalizedWords.join(' ');
};
export const capitalize = (str) => {
  const lower = str.toLowerCase();
  return str.charAt(0).toUpperCase() + lower.slice(1);
};

export const numberWithCommas = (x = 0) => {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};
/**
 * Allows us to attach a TTL to a memoized function.
 */
export const ttlMemoize = (fn) => {
  const cache = {};

  // drop keys from cache based on the ttl
  setInterval(() => {
    const keysToDrop = Object.entries(cache)
      .filter(([key, item]) => {
        if (!item.ttl) {
          return false;
        }

        const now = new Date().valueOf();
        const ttl = new Date(item.ttl).valueOf();
        return now > ttl;
      })
      .map(([key]) => key);

    keysToDrop.forEach((key) => delete cache[key]);
  }, 5000);

  return {
    memo: (...args) => {
      const argsKey = JSON.stringify(args);
      if (!cache[argsKey]) {
        cache[argsKey] = {
          fn: fn(...args),
        };
      }

      return cache[argsKey].fn;
    },
    setTTL: (ttl, ...args) => {
      const argsKey = JSON.stringify(args);
      if (!cache[argsKey]) {
        return;
      }
      cache[argsKey].ttl = ttl;
    },
  };
};

export const searchParams = (params, search) => {
  return new URLSearchParams(params).get(search);
};

export const routerConstants = routes;

export const errorsRedirectHandler = (error) => {
  if (
    error.response.status === 401 ||
    error.response.status === 400 ||
    error.response.status === 404 ||
    error.response.status === 409 ||
    error.response.status === 500
  ) {
    throw error; // instead of returning error, just throw it here so that we can catch it from where it is being called
  } else if (error.response.status === 403) {
    document.location.href = '/403';
  } else {
    console.log(error);
  }
};

export const generateArrayDates = (
  initialDate,
  endDate,
  type = 'day',
  format = 'MM/DD/YYYY'
) => {
  const start = moment(initialDate);
  const end = moment(endDate);
  const dates = [];
  let initial = start;

  while (initial <= end) {
    dates.push(initial.format(format));
    initial = initial.clone().add(1, type);
  }

  return dates;
};

export const getProductsTotalAmount = (products) => {
  let totalAmountAcum = 0;
  products.forEach((dealProduct) => {
    const price = dealProduct.price;
    const quantity = dealProduct.quantity;
    const amount = price * quantity;
    totalAmountAcum = amount + totalAmountAcum || 0;
  });
  return totalAmountAcum;
};

export const timeList = [
  { name: '12:00 AM', value: '12:00_AM' },
  { name: '01:00 AM', value: '01:00_AM' },
  { name: '02:00 AM', value: '02:00_AM' },
  { name: '03:00 AM', value: '03:00_AM' },
  { name: '04:00 AM', value: '04:00_AM' },
  { name: '05:00 AM', value: '05:00_AM' },
  { name: '06:00 AM', value: '06:00_AM' },
  { name: '07:00 AM', value: '07:00_AM' },
  { name: '08:00 AM', value: '08:00_AM' },
  { name: '09:00 AM', value: '09:00_AM' },
  { name: '10:00 AM', value: '10:00_AM' },
  { name: '11:00 AM', value: '11:00_AM' },
  { name: '12:00 PM', value: '12:00_PM' },
  { name: '01:00 PM', value: '01:00_PM' },
  { name: '02:00 PM', value: '02:00_PM' },
  { name: '03:00 PM', value: '03:00_PM' },
  { name: '04:00 PM', value: '04:00_PM' },
  { name: '05:00 PM', value: '05:00_PM' },
  { name: '06:00 PM', value: '06:00_PM' },
  { name: '07:00 PM', value: '07:00_PM' },
  { name: '08:00 PM', value: '08:00_PM' },
  { name: '09:00 PM', value: '09:00_PM' },
  { name: '10:00 PM', value: '10:00_PM' },
  { name: '11:00 PM', value: '11:00_PM' },
];

export const companyProspects = [
  {
    id: 18097967,
    name: 'Rocketreach.co',
    domain: 'rocketreach.co',
    email_domain: 'rocketreach.co',
    website_domain: 'rocketreach.co',
    ticker_symbol: null,
    links: {
      twitter: null,
      facebook: null,
      linkedin: 'http://linkedin.com/company/rocketreach.co',
      crunchbase: null,
    },
    year_founded: 2015,
    address: {
      description:
        '800 Bellevue Way NE Suite 500, Bellevue, Washington 98004, US',
      street: '800 Bellevue Way NE Suite 500',
      city: 'Bellevue',
      region: 'Washington',
      postal_code: '98004',
      country_code: 'US',
    },
    phone: '(833) 212-3828',
    fax: null,
    num_employees: 68,
    revenue: 30000000,
    funding_investors: null,
    industry: 'Information Services',
    sic_codes: [73, 737],
    rr_profile_url:
      'https://rocketreach.co/rocketreachco-profile_b4d23efdf855f2de',
    description:
      '4 Million+ businesses worldwide trust RocketReach. Including the biggest - Google, Amazon, Apple, Facebook, and 90% of S&P 500. Access real-time verified personal/professional emails, phone numbers, social media links for over 400 million profiles, at 10 million companies worldwide.',
  },
  {
    id: 18097968,
    name: 'Rocketreach.co',
    domain: 'rocketreach.co',
    email_domain: 'rocketreach.co',
    website_domain: 'rocketreach.co',
    ticker_symbol: null,
    links: {
      twitter: null,
      facebook: null,
      linkedin: 'http://linkedin.com/company/rocketreach.co',
      crunchbase: null,
    },
    year_founded: 2015,
    address: {
      description:
        '800 Bellevue Way NE Suite 500, Bellevue, Washington 98004, US',
      street: '800 Bellevue Way NE Suite 500',
      city: 'Bellevue',
      region: 'Washington',
      postal_code: '98004',
      country_code: 'US',
    },
    phone: '(833) 212-3828',
    fax: null,
    num_employees: 68,
    revenue: 30000000,
    funding_investors: null,
    industry: 'Information Services',
    sic_codes: [73, 737],
    rr_profile_url:
      'https://rocketreach.co/rocketreachco-profile_b4d23efdf855f2de',
    description:
      '4 Million+ businesses worldwide trust RocketReach. Including the biggest - Google, Amazon, Apple, Facebook, and 90% of S&P 500. Access real-time verified personal/professional emails, phone numbers, social media links for over 400 million profiles, at 10 million companies worldwide.',
  },
  {
    id: 18097969,
    name: 'Rocketreach.co',
    domain: 'rocketreach.co',
    email_domain: 'rocketreach.co',
    website_domain: 'rocketreach.co',
    ticker_symbol: null,
    links: {
      twitter: null,
      facebook: null,
      linkedin: 'http://linkedin.com/company/rocketreach.co',
      crunchbase: null,
    },
    year_founded: 2015,
    address: {
      description:
        '800 Bellevue Way NE Suite 500, Bellevue, Washington 98004, US',
      street: '800 Bellevue Way NE Suite 500',
      city: 'Bellevue',
      region: 'Washington',
      postal_code: '98004',
      country_code: 'US',
    },
    phone: '(833) 212-3828',
    fax: null,
    num_employees: 68,
    revenue: 30000000,
    funding_investors: null,
    industry: 'Information Services',
    sic_codes: [73, 737],
    rr_profile_url:
      'https://rocketreach.co/rocketreachco-profile_b4d23efdf855f2de',
    description:
      '4 Million+ businesses worldwide trust RocketReach. Including the biggest - Google, Amazon, Apple, Facebook, and 90% of S&P 500. Access real-time verified personal/professional emails, phone numbers, social media links for over 400 million profiles, at 10 million companies worldwide.',
  },
];

export const prospectsMocked = [
  {
    id: 1430548,
    status: 'complete',
    name: 'Amit Shanbhag',
    profile_pic:
      'https://d1hbpr09pwz0sk.cloudfront.net/profile_pic/amit-shanbhag-5fd199dd',
    links: null,
    linkedin_url: 'https://www.linkedin.com/in/amitshanbhag',
    location: 'United States',
    city: null,
    region: null,
    country_code: 'US',
    current_title: 'Founder',
    normalized_title: 'Founder',
    current_employer: 'rocketreach.co',
    teaser: {
      emails: ['rocketreach.co', 'gmail.com', 'yahoo.com', 'hotmail.com'],
      phones: [
        {
          number: '415-519-XXXX',
          is_premium: true,
        },
        {
          number: '212-946-XXXX',
          is_premium: true,
        },
        {
          number: '415-674-XXXX',
          is_premium: true,
        },
        {
          number: '415669XXXX',
          is_premium: false,
        },
        {
          number: '415381XXXX',
          is_premium: false,
        },
      ],
      preview: [],
      is_premium_phone_available: false,
    },
  },
  {
    id: 240837210,
    status: 'complete',
    name: 'Amit Shanbhag',
    profile_pic: null,
    links: null,
    linkedin_url: 'https://www.linkedin.com/in/amit-shanbhag-b142592',
    location: 'San Francisco, California, United States',
    city: 'San Francisco',
    region: 'CA ',
    country_code: 'US',
    current_title: 'Founder',
    normalized_title: 'unknown normalized title',
    current_employer: 'rocketreach.co',
    teaser: {
      emails: ['rocketreach.co', 'gmail.com', 'yahoo.com', 'hotmail.com'],
      phones: [
        {
          number: '415-519-XXXX',
          is_premium: true,
        },
        {
          number: '+91 98335 8XXXX',
          is_premium: true,
        },
        {
          number: '212-946-XXXX',
          is_premium: true,
        },
        {
          number: '415-674-XXXX',
          is_premium: true,
        },
        {
          number: '415669XXXX',
          is_premium: false,
        },
        {
          number: '415381XXXX',
          is_premium: false,
        },
      ],
      preview: [],
      is_premium_phone_available: false,
    },
  },
  {
    id: 1430549,
    status: 'complete',
    name: 'Amit Shanbhag',
    profile_pic:
      'https://d1hbpr09pwz0sk.cloudfront.net/profile_pic/amit-shanbhag-5fd199dd',
    links: null,
    linkedin_url: 'https://www.linkedin.com/in/amitshanbhag',
    location: 'United States',
    city: null,
    region: null,
    country_code: 'US',
    current_title: 'Founder',
    normalized_title: 'Founder',
    current_employer: 'rocketreach.co',
    teaser: {
      emails: ['rocketreach.co', 'gmail.com', 'yahoo.com', 'hotmail.com'],
      phones: [
        {
          number: '415-519-XXXX',
          is_premium: true,
        },
        {
          number: '212-946-XXXX',
          is_premium: true,
        },
        {
          number: '415-674-XXXX',
          is_premium: true,
        },
        {
          number: '415669XXXX',
          is_premium: false,
        },
        {
          number: '415381XXXX',
          is_premium: false,
        },
      ],
      preview: [],
      is_premium_phone_available: false,
    },
  },
  {
    id: 1430550,
    status: 'complete',
    name: 'Amit Shanbhag',
    profile_pic:
      'https://d1hbpr09pwz0sk.cloudfront.net/profile_pic/amit-shanbhag-5fd199dd',
    links: null,
    linkedin_url: 'https://www.linkedin.com/in/amitshanbhag',
    location: 'United States',
    city: null,
    region: null,
    country_code: 'US',
    current_title: 'Founder',
    normalized_title: 'Founder',
    current_employer: 'rocketreach.co',
    teaser: {
      emails: ['rocketreach.co', 'gmail.com', 'yahoo.com', 'hotmail.com'],
      phones: [
        {
          number: '415-519-XXXX',
          is_premium: true,
        },
        {
          number: '212-946-XXXX',
          is_premium: true,
        },
        {
          number: '415-674-XXXX',
          is_premium: true,
        },
        {
          number: '415669XXXX',
          is_premium: false,
        },
        {
          number: '415381XXXX',
          is_premium: false,
        },
      ],
      preview: [],
      is_premium_phone_available: false,
    },
  },
];

// this method will split google sent address back to address/city/state separately
export const splitAddress = (item) => {
  const stateIndex = item?.terms?.length - 2;
  const cityIndex = item?.terms?.length - 3;
  const addressIndex = item?.terms[cityIndex]?.offset - 2;

  const state = usaStates.find(
    (state) => state.abbreviation === item?.terms[stateIndex]?.value
  );
  const city = item?.terms[cityIndex]?.value;
  const address = item.description.slice(0, addressIndex);

  return { address, city, state };
};

export const pageTitleBeautify = (titles, separator = ' - ') => {
  return titles.join(separator);
};

export const sortByCompleted = (list, lessonOrCourse) => {
  if (lessonOrCourse === 'courseTracking') {
    return list;
  }
  return _.orderBy(list, [`${lessonOrCourse}.status`], ['desc']);
};

function getFaviconEl() {
  return document.getElementById('favicon');
}
export const changeFavIcon = (favIc) => {
  if (favIc) {
    const favicon = getFaviconEl(); // Accessing favicon element
    favicon.href = favIc;
  }
};

export const percentageChange = (last, current) => {
  const lastValue = parseInt(last);
  const currentValue = parseInt(current);
  if (lastValue !== 0) {
    return (currentValue / lastValue) * 100 - 100;
  } else if (currentValue > 0) {
    return 100;
  } else {
    return 0;
  }
};

export const TrainingViewTypes = {
  Lesson: 1,
  Course: 2,
};
export const TAB_KEYS = {
  all: 1,
  task: 2,
  call: 3,
  event: 4,
};
export const TECHNOLOGIES_STORAGE_KEY = 'technologiesList';
export const INDUSTRIES_STORAGE_KEY = 'industriesList';
export const SIC_STORAGE_KEY = 'sicCodesList';
export const NAICS_STORAGE_KEY = 'naicsCodesList';
export const RESOURCES_PEOPLE_FILTER = 'resourcesPeopleFilter';
export const RESOURCES_COMPANY_FILTER = 'resourcesCompanyFilter';
export const SUMMARIZE_RECENT_SEARCHES = 'summarizeRecentSearches';

export const replaceSpaceWithCharacter = (value, ch = '-') => {
  return value?.replace(/\s+/g, ch);
};

export const TrainingFilterOptions = [
  { id: 1, key: 'updated_at', name: 'Last Modified' },
  { id: 2, key: "eq 'draft'", name: 'Draft' },
  { id: 3, key: "eq 'published'", name: 'Published' },
];

export const DashboardFilterOptions = [
  { id: 1, key: 'updated_at', name: 'Last Modified' },
  { id: 2, key: 'latest', name: 'Latest' },
  { id: 3, key: 'custom', name: 'Custom' },
];

export const AddComponentOptions = [
  { id: 1, icon: 'leaderboard', key: 'KPI', name: 'KPI' },
  { id: 2, icon: 'add_chart', key: 'Chart', name: 'Chart' },
];

export const DashboardShareOptions = [
  { id: 1, icon: 'lock', key: 'only_me', name: 'Only Me' },
  { id: 2, icon: 'language', key: 'all_users', name: 'All Users' },
  { id: 3, icon: 'edit', key: 'custom', name: 'Custom' },
];

// took this from here: https://stackoverflow.com/a/43467144/2633871
export const isValidUrl = (str) => {
  let url;

  try {
    url = new URL(str);
  } catch (_) {
    return false;
  }

  return url.protocol === 'http:' || url.protocol === 'https:';
};

// moving the scroll to top of window
export const scrollToTop = () => {
  window.scroll({
    top: 0,
    behavior: 'smooth',
  });
};

// moving scroll to bottom of passed container
export const scrollToBottomContainer = (container) => {
  window.scroll({
    top: container?.scrollHeight,
    behavior: 'smooth',
  });
};

// converting values 12641 to 12.6K or 24578000000 to 24.6B etc.
export const roundNumbers = (value, display = 'short', decimals = 1) => {
  return new Intl.NumberFormat('en', {
    notation: 'compact',
    compactDisplay: display,
    maximumFractionDigits: decimals,
  }).format(value);
};

export const numbersWithComma = (value, formatConfig) => {
  return new Intl.NumberFormat('en', formatConfig).format(value);
};

export const parseCurrencyOrNormal = (value) => {
  if (value) {
    if (typeof value === 'string') {
      if (value.includes('$')) {
        const parsedCurrency = parseCurrency(value);
        return numbersWithComma(parsedCurrency);
      } else if (value.includes('%')) {
        return value.replace(/%/g, '');
      }
    } else {
      return numbersWithComma(value + '');
    }
  }
  return value;
};

// only get keys with data
export const getKeysWithData = (obj) => {
  const filters = {};
  for (const key in obj) {
    const item = obj[key];
    for (const sub in item) {
      if (Array.isArray(item[sub])) {
        if (item[sub].length) {
          filters[sub] = item[sub];
        }
      } else if (item[sub]?.trim()) {
        filters[sub] = [item[sub]];
      }
    }
  }
  return filters;
};

// took the following from here: https://vijayendren-r.medium.com/javascript-react-js-function-to-convert-array-json-into-a-csv-file-8315ea8f6ab2
// Function to convert the JSON(Array of objects) to CSV.
export const arrayToCsv = (headers, data) => {
  const csvRows = [];
  // getting headers.
  const headerValues = headers.map((header) => header.label);
  csvRows.push(headerValues.join(',')); // Push into array as comma separated values
  // Getting rows.
  for (const row of data) {
    const rowValues = headers.map((header) => {
      const value = row[header.key] || '';
      const escaped = ('' + value).replace(/"/g, '\\"'); // To replace the unwanted quotes.
      return `"${escaped}"`; // To escape the comma in a address like string.
    });
    csvRows.push(rowValues.join(',')); // Push into array as comma separated values.
  }
  return csvRows.join('\n'); // To enter the next rows in the new line '\n'
};

// Function to download the generated CSV as a .csv file.
const download = (data, fileName) => {
  const blob = new Blob([data], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.setAttribute('hidden', '');
  a.setAttribute('href', url);
  a.setAttribute('download', fileName + '.csv');
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

export const generateCSV = (header, data, filename) => {
  const csvData = arrayToCsv(header, data);
  download(csvData, filename);
};

export const overflowing = () => {
  document.body.classList.remove('overflow-hidden');
  document.body.classList.add('overflow-auto');
};

export const removeBodyScroll = () => {
  document.body.classList.remove('overflow-auto');
  document.body.classList.add('overflow-hidden');
};

export const addressify = (comp, type = 'people') => {
  if (type === 'people') {
    const address = [comp.address_street, comp.address_city]
      .filter((a) => !!a)
      .join(', ');
    return `${address || ''} ${comp.address_state || ''} ${
      comp.address_country || ''
    } ${comp.address_postalcode || ''}`;
  } else {
    const address = [comp.address, comp.city].filter((a) => !!a).join(', ');
    return `${address || ''} ${comp.state || ''} ${comp.country || ''} ${
      comp.postal_code || ''
    }`;
  }
};

export const secondsToMinutes = (seconds) => {
  // currently support to minutes not hours
  return `${
    Math.floor(seconds / 60) + ':' + ('0' + Math.floor(seconds % 60)).slice(-2)
  }`;
};

export const formatPhoneNumber = (phoneNumber) => {
  const cleaned = ('' + phoneNumber).replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return '(' + match[1] + ') ' + match[2] + '-' + match[3];
  }
  return phoneNumber;
};

export const formatUSPhoneNumber = (phoneNumber) => {
  // Remove any non-digit characters
  const digitsOnly = phoneNumber.replace(/\D/g, '');

  // Check if the number starts with the US country code (1)
  if (digitsOnly.startsWith('1')) {
    // Remove the country code (1) from the number
    const formattedNumber = digitsOnly.slice(1);

    // Format the remaining number as (XXX) XXX-XXXX
    return `(${formattedNumber.slice(0, 3)}) ${formattedNumber.slice(
      3,
      6
    )}-${formattedNumber.slice(6)}`;
  } else {
    // Format the number as (XXX) XXX-XXXX
    return `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(
      3,
      6
    )}-${digitsOnly.slice(6)}`;
  }
};

export const getDiffBetweenObjects = (one, two) => {
  const result = {};
  for (const key in one) {
    if (Object.hasOwn(one, key) && !one[key]) {
      if (!one[key] && two[key] !== '') {
        result[key] = two[key];
      } else if (!two[key] && one[key] !== '') {
        result[key] = one[key];
      }
    }
  }
  return result;
};

export const convertDataToNewDataObject = (baseObject, destinationObject) => {
  return Object.entries(baseObject).reduce((acc, [key, value]) => {
    if (destinationObject[key]) {
      acc[value] = destinationObject[key];
    }
    return acc;
  }, {});
};

export const parseNaics = (str) => {
  if (!str) {
    return '';
  }

  if (!str.includes(',')) {
    return str.trim();
  }

  const splitted = str.split(', ');

  if (splitted.length === 1) {
    return splitted[0]; // return first one only in case we found one, thats a generic one
  }

  return splitted[1]; // the specific one if we found
};

export const extractStreamFromResponse = (response) => {
  return response
    .split(/data: |\n/g)
    .filter((str) => str.trim() !== '' && str !== '[DONE]')
    .map((str) => {
      try {
        return JSON.parse(str);
      } catch {
        return str;
      }
    });
};

export const sortedUSACitiesByState = (cityList) => {
  const sortedCityList = _.mapValues(cityList, (cities) => _.sortBy(cities));
  const finalObject = _.transform(
    sortedCityList,
    (result, cities, state) => {
      _.forEach(cities, (city) => {
        result[city] = state;
      });
    },
    {}
  );

  return _.sortBy(_.keys(finalObject)).map(
    (city) => `${city}, ${getStateAbbreviation(finalObject[city])}`
  );
};

export const parseCurrency = (value) => {
  if (value) {
    // Remove all non-numeric characters from the value using a regular expression
    const numericValue =
      typeof value === 'string' ? value.replace(/[^\d.-]/g, '') || '0' : value;

    // Parse the resulting string as a float and return the value
    return parseFloat(numericValue);
  }
  return 0;
};

export const ifArrayOrString = (value) => {
  if (typeof value === 'string') {
    return value?.replace(/,/g, '');
  }

  if (Array.isArray(value) && value.length) {
    return value[0]?.replace(/,/g, '');
  }
};

// helper function to detect whether its browser refresh or not
export const getBrowserNavigationType = () => {
  let result;
  let p;
  if (window.performance && window.performance.navigation) {
    result = window.performance.navigation;
    if (result === 255) {
      result = 4;
    }
  }
  if (
    window.performance &&
    window.performance.getEntriesByType &&
    window.performance.getEntriesByType('navigation')
  ) {
    if (window.performance.getEntriesByType('navigation').length) {
      p = window.performance.getEntriesByType('navigation')[0].type;
      if (p === 'navigate') {
        result = 0;
      }
      if (p === 'reload') {
        result = 1;
      }
      if (p === 'back_forward') {
        result = 2;
      }
      if (p === 'prerender') {
        result = 3;
      } // 3 is my invention!
    } else {
      result = window.performance.navigation.type;
    }
  }
  return result;
};

export const parsePercentage = (value, isDecimal = true) => {
  const val = typeof value === 'string' ? Number(value) : value;
  const parsed = val.toFixed(val % 1 === 0 ? 0 : 2);

  return `${isDecimal ? parsed * 100 : parsed} %`;
};

export const sortAndRearrangeJSONByKeyAtEnd = (jsonObj, otherKey = 'Other') => {
  // Extract the "Other" key-value pair from the JSON object
  const otherValue = jsonObj[otherKey];
  delete jsonObj[otherKey];

  // Sort the remaining keys in descending order based on their values
  const sortedKeys = Object.keys(jsonObj).sort((a, b) => {
    const valueA = parseFloat(jsonObj[a]);
    const valueB = parseFloat(jsonObj[b]);
    return valueB - valueA;
  });

  // Reconstruct the JSON object with sorted keys and "Other" at the end
  const sortedJSON = {};
  sortedKeys.forEach((key) => {
    sortedJSON[key] = jsonObj[key];
  });
  sortedJSON[otherKey] = otherValue;

  return sortedJSON;
};

export const hexToHSL = (H) => {
  // Convert hex to RGB first
  let r = 0;
  let g = 0;
  let b = 0;
  if (H.length === 4) {
    r = '0x' + H[1] + H[1];
    g = '0x' + H[2] + H[2];
    b = '0x' + H[3] + H[3];
  } else if (H.length === 7) {
    r = '0x' + H[1] + H[2];
    g = '0x' + H[3] + H[4];
    b = '0x' + H[5] + H[6];
  }
  // Then to HSL
  r /= 255;
  g /= 255;
  b /= 255;
  const cmin = Math.min(r, g, b);
  const cmax = Math.max(r, g, b);
  const delta = cmax - cmin;
  let h = 0;
  let s = 0;
  let l = 0;

  if (delta === 0) h = 0;
  else if (cmax === r) h = ((g - b) / delta) % 6;
  else if (cmax === g) h = (b - r) / delta + 2;
  else h = (r - g) / delta + 4;

  h = Math.round(h * 60);

  if (h < 0) h += 360;

  l = (cmax + cmin) / 2;
  s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  s = +(s * 100).toFixed(1);
  l = +(l * 100).toFixed(1);

  return {
    colorCode: h,
    hsl: 'hsl(' + h + ',' + s + '%,' + l + '%)',
  };
};

export const LearnViewTypes = {
  Overview: 'overview',
  MyFavorites: 'my-favorites',
  SelfAssessment: 'self-assessment',
  MyOrganization: 'organization',
  WorkingCapital: 'working-capital',
  Topics: 'explore',
  Custom: 'custom',
};

export const clearMenuSelection = (e) => {
  e?.target?.parentNode.classList.add('active');
  setTimeout(() => {
    const activeLinks = document.querySelectorAll(
      '.navbar.navbar-vertical-aside .active'
    );
    if (activeLinks && activeLinks.length) {
      activeLinks.forEach((item) => {
        if (item !== e?.target?.parentNode) {
          item.classList.remove('active');
        }
      });
    }
  });
};

export const sortByPinnedTopics = (secondList) => {
  const pinnedTopics = [
    { title: 'Core Product & Services', order: 1 },
    { title: 'Sales Strategy & Skills', order: 2 },
    { title: 'Agile Mindset', order: 3 },
    { title: 'Faster Payments', order: 4 },
    { title: 'Working Capital', order: 5 },
    { title: 'Fraud & Risk', order: 6 },
    { title: 'Merchant Services', order: 7 },
    { title: 'Commercial Card', order: 8 },
    { title: 'Industry Insights', order: 9 },
  ];
  const filteredList = secondList.filter((topic) => {
    return !pinnedTopics.some(
      (pinnedTopic) =>
        pinnedTopic.title.toLowerCase() === topic.title.trim().toLowerCase()
    );
  });

  const pinnedTopicsApi = [];
  const pinnedTopicsTitle = pinnedTopics.map((s) => s.title.toLowerCase());
  secondList.forEach((s) => {
    if (pinnedTopicsTitle.includes(s.title.trim().toLowerCase())) {
      pinnedTopicsApi.push({
        ...s,
        order: pinnedTopics.find(
          (s2) => s2.title.toLowerCase() === s.title.trim().toLowerCase()
        )?.order,
      });
    }
  });
  pinnedTopicsApi.sort((a, b) => {
    return a.order - b.order;
  });
  return pinnedTopicsApi.concat(filteredList);
};

export const formatCurrency = (inputValue) => {
  const numericValue = inputValue.replace(/[^0-9.]/g, '');

  const [integerPart, decimalPart] = numericValue.split('.');

  const formattedIntegerPart = integerPart.replace(
    /\B(?=(\d{3})+(?!\d))/g,
    ','
  );

  const formattedValue =
    decimalPart !== undefined
      ? `${formattedIntegerPart}.${decimalPart}`
      : formattedIntegerPart;

  return formattedValue;
};

export const dateWithoutTZ = (dateWithTZ, format = DATE_FORMAT) => {
  return moment(dateWithTZ?.split('T')[0]).format(format);
};

export const isModuleChecked = (module, checkedItems) => {
  const moduleName = module.name.toLowerCase().replace(/ /g, '_');
  if (!checkedItems[moduleName]) {
    return false;
  }
  return true;
};

export const CompanyRelated = {
  Parent: { name: 'Parent', label: 'Parent' },
  Daughter: { name: 'Daughter', label: 'Child' },
  Child: { name: 'Daughter', label: 'Child' },
  Sibling: { name: 'Sibling', label: 'Sister' },
  Related: { name: 'Related', label: 'Affiliated' },
};

export const CompanyRelations = [
  { id: 0, ...CompanyRelated.Parent },
  { id: 1, ...CompanyRelated.Daughter },
  { id: 2, ...CompanyRelated.Related },
];
