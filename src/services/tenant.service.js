import axios from 'axios';

import authHeader from './auth-header';

const API_URL = process.env.REACT_APP_API_URL;
const TENANTS_API = API_URL + '/api/tenants';

class TenantService {
  getTenant() {
    return axios
      .get(`${API_URL}/api/auth/context/tenant`, { headers: authHeader() })
      .then((response) => {
        return response.data;
      });
  }

  createTenant(data) {
    return axios
      .post(`${TENANTS_API}`, data, { headers: authHeader() })
      .then((response) => {
        return response.data;
      })
      .catch((error) => error);
  }

  updateTenant(data, tenantId) {
    return axios
      .put(`${TENANTS_API}/${tenantId}`, data, {
        headers: authHeader(),
      })
      .then((response) => {
        return response.data;
      })
      .catch((error) => error);
  }

  getTenants(order, pagination, includeOwners, filter) {
    const { limit, page } = pagination;
    const { search } = filter;
    return axios
      .get(`${TENANTS_API}`, {
        params: { order, limit, page, includeOwners, search },
        headers: authHeader(),
      })
      .then((response) => {
        return response.data;
      });
  }

  getSingleTenant(tenantId) {
    return axios
      .get(`${TENANTS_API}/${tenantId}`, {
        headers: authHeader(),
      })
      .then((response) => {
        return response.data;
      })
      .catch((error) => error);
  }

  getTenantsQuizConfig(tenantId) {
    return axios
      .get(`${TENANTS_API}/${tenantId}/config`, {
        headers: authHeader(),
      })
      .then((response) => {
        return response.data;
      });
  }

  updateTenantsQuizConfig(data, tenantId) {
    return axios
      .put(`${TENANTS_API}/${tenantId}/config`, data, {
        headers: authHeader(),
      })
      .then((response) => {
        return response.data;
      });
  }

  updateTenantStatus(data, status) {
    return axios
      .put(`${TENANTS_API}/${data.id}/${status}`, data, {
        headers: authHeader(),
      })
      .then((response) => {
        return response.data;
      })
      .catch((error) => error);
  }
}

export default new TenantService();
