import axios from 'axios';

import authHeader from './auth-header';
import { parseNaics } from '../utils/Utils';
import { ProspectTypes } from '../components/prospecting/v2/constants';

const baseUrl = process.env.REACT_APP_API_URL;
const API_URL = `${baseUrl}/api/prospects`;

const parseValueOrEmpty = (value) => {
  return value || '';
};

class ProspectService {
  getProspects(queryFilter, { page = 1, name = '', limit = 10 }) {
    const { filter, ...restProps } = queryFilter || {};

    const URL = `${API_URL}/${
      filter?.globalSearch ? 'quick-search' : 'prospector-pro-search'
    }?`;

    const params = {
      ...restProps,
      ...filter,
      page,
      regions: ['AMER'],
      countries: ['United States'],
      name: filter && filter?.name !== '' ? filter?.name : name,
      per_page: limit,
    };

    return axios
      .get(URL, {
        params,
        headers: authHeader(),
      })
      .then((response) => response)
      .catch((e) => console.log(e));
  }

  getProspectById(id) {
    const params = {
      id,
    };

    return axios
      .get(`${API_URL}/person-search`, {
        params,
        headers: authHeader(),
      })
      .then((response) => response)
      .catch((e) => console.log(e));
  }

  getCompanyByCriteria(query) {
    const params = {
      ...query,
    };

    return axios
      .get(`${API_URL}/company-search`, {
        params,
        headers: authHeader(),
      })
      .then((response) => response)
      .catch((e) => console.log(e));
  }

  getCompany(opts) {
    const params = {
      name: opts.name,
      location: 'USA', // default to always search USA
    };

    return axios
      .get(`${API_URL}/companies`, {
        params,
        headers: authHeader(),
      })
      .then((response) => response)
      .catch((e) => console.log(e));
  }

  async getCompanyRR(orgName) {
    const buildNewOrganizationObject = (rocketReachOrganization) => {
      return {
        name: rocketReachOrganization.name,
        employees: rocketReachOrganization.employees || 0,
        annual_revenue:
          '' +
          parseValueOrEmpty(
            rocketReachOrganization.revenue ||
              rocketReachOrganization.annual_revenue
          ),
        total_revenue:
          '' +
          parseValueOrEmpty(
            rocketReachOrganization.revenue ||
              rocketReachOrganization.annual_revenue
          ),
        industry: parseValueOrEmpty(rocketReachOrganization.industry),
        address_street: parseValueOrEmpty(rocketReachOrganization.address),
        address_city: parseValueOrEmpty(rocketReachOrganization.city),
        address_state: parseValueOrEmpty(rocketReachOrganization.state),
        address_country: parseValueOrEmpty(rocketReachOrganization.country),
        address_postalcode: parseValueOrEmpty(
          rocketReachOrganization.postal_code
        ),
        sic_code: '' + parseNaics(rocketReachOrganization.sic),
        naics_code: '' + parseNaics(rocketReachOrganization.naics),
        ticker_symbol: parseValueOrEmpty(rocketReachOrganization.ticker),
        avatar: parseValueOrEmpty(rocketReachOrganization.logo_url),
        website:
          rocketReachOrganization.website || rocketReachOrganization.domain,
        domain:
          rocketReachOrganization.website || rocketReachOrganization.domain,
        phone_office: rocketReachOrganization.phone || '',
        phone_fax: rocketReachOrganization.fax || '',
        external_id: '' + rocketReachOrganization.id,
        competitors: rocketReachOrganization?.competitors,
        departments: rocketReachOrganization?.departments,
        funding_investors: rocketReachOrganization?.funding_investors,
        company_growth: rocketReachOrganization?.company_growth,
        status: 'cold',
      };
    };

    // if there is no org provided, return {} promise response
    if (!orgName || orgName === 'None') {
      return new Promise((resolve) => {
        resolve({});
      });
    }

    const { data } = await this.query(
      { name: [orgName] },
      {
        page: 1,
        limit: 1,
        type: ProspectTypes.company,
      }
    );

    if (!data?.data?.length) {
      // for some company names RR sending error: true so for these create org with just name
      return { name: orgName };
    } else {
      return buildNewOrganizationObject(data?.data[0]);
    }
  }

  getContact(opts) {
    const params = opts;
    return axios
      .get(`${API_URL}/contacts`, {
        params,
        headers: authHeader(),
      })
      .then((response) => response)
      .catch((e) => console.log(e));
  }

  query(
    opts,
    { page = 1, limit = 10, type = 'query', order_by = 'relevance' }
  ) {
    const body = {
      query: opts,
      type,
      page,
      limit,
      order_by,
    };

    return axios
      .post(`${API_URL}/search`, body, {
        headers: authHeader(),
      })
      .then((response) => response)
      .catch((e) => console.log(e));
  }

  getTechnologies() {
    return axios
      .get(`${baseUrl}/api/providers/rocketReach/technologies`, {
        headers: authHeader(),
      })
      .then((response) => response)
      .catch((e) => console.log(e));
  }

  getIndustries() {
    return axios
      .get(`${baseUrl}/api/providers/rocketReach/industries`, {
        headers: authHeader(),
      })
      .then((response) => response)
      .catch((e) => console.log(e));
  }

  getSicCodes() {
    return axios
      .get(`${baseUrl}/api/providers/rocketReach/sic`, {
        headers: authHeader(),
      })
      .then((response) => response)
      .catch((e) => console.log(e));
  }

  getNaicsCodes() {
    return axios
      .get(`${baseUrl}/api/naics`, {
        headers: authHeader(),
        params: {
          limit: 'all',
          page: 1,
        },
      })
      .then((response) => response)
      .catch((e) => console.log(e));
  }

  saveListLocallyByKey(key, list) {
    localStorage.setItem(key, JSON.stringify(list));
  }

  getListLocallyByKey(key) {
    const tech = localStorage.getItem(key) || [];
    if (tech) {
      try {
        const parsedTech = JSON.parse(tech);
        return parsedTech;
      } catch (e) {
        return [];
      }
    }
    return [];
  }
}

export default new ProspectService();
