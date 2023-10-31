import axios from 'axios';

import authHeader from './auth-header';
import BaseRequestService from './baseRequest.service';
import { createBlobObject } from '../utils/Utils';

const API_URL = process.env.REACT_APP_API_URL;
const ORG_URL = `${API_URL}/api/organizations`;

class OrganizationService extends BaseRequestService {
  async getOrganizations(queryFilter, { page = 1, limit = 10 }) {
    const { filter = null, ...restProps } = queryFilter || {};

    const params = {
      ...restProps,
      ...filter,
      page,
      limit,
    };

    return await this.get(
      ORG_URL,
      {
        params,
        headers: authHeader(),
      },
      { fullResponse: true }
    );
  }

  async getOrganizationById(id) {
    const result = await this.get(`${ORG_URL}/${id}`, {
      headers: authHeader(),
    });
    return result?.organization;
  }

  async updateOrganization(id, data) {
    return await this.put(`${ORG_URL}/${id}`, data, {
      headers: authHeader(),
    });
  }

  async deleteOrganizations(organizationIds) {
    return await this.delete(`${ORG_URL}`, {
      headers: authHeader(),
      params: {
        ids: organizationIds.join(','),
      },
    });
  }

  async createOrganization(data) {
    return await this.post(
      ORG_URL,
      data,
      {
        headers: authHeader(),
      },
      { fullResponse: true }
    );
  }

  async getFollowers(organization_id, { page = 1, limit = 5 }) {
    return await this.get(`${ORG_URL}/${organization_id}/followers`, {
      headers: authHeader(),
      params: {
        page,
        limit,
      },
    });
  }

  async checkFollowing(organization_id, user_id) {
    const result = await this.get(
      `${ORG_URL}/${organization_id}/followers/${user_id}`,
      {
        headers: authHeader(),
      }
    );
    return result.isFollower;
  }

  async stopFollowing(organization_id, user_id) {
    return await this.delete(
      `${ORG_URL}/${organization_id}/followers/${user_id}`,
      {
        headers: authHeader(),
      }
    );
  }

  async startFollowing(organization_id, user_id) {
    try {
      const response = await this.post(
        `${ORG_URL}/${organization_id}/followers/${user_id}`,
        {},
        {
          headers: authHeader(),
        }
      );
      return response;
    } catch (e) {
      return e;
    }
  }

  async getOwners(organization_id, { page = 1, limit = 5 }) {
    return await this.get(`${ORG_URL}/${organization_id}/owners`, {
      headers: authHeader(),
      params: {
        page,
        limit,
      },
    });
  }

  getInsightsByOrganization(orgId) {
    return this.get(`${ORG_URL}/${orgId}/insights`, {
      headers: authHeader(),
    });
  }

  async addOwner(organization_id, user_id) {
    return await this.post(
      `${ORG_URL}/${organization_id}/owners/${user_id}`,
      {},
      {
        headers: authHeader(),
      }
    );
  }

  async removeOwner(organizationId, userId) {
    const response = await this.delete(
      `${ORG_URL}/${organizationId}/owners/${userId}`,
      {
        headers: authHeader(),
      },
      {
        fullResponse: true,
        errorsRedirect: false,
      }
    );

    if (response.status === 200) {
      const { data } = response;

      return data;
    }

    return response;
  }

  getFieldByOrganization(organization_id, { page = 1, limit = 10 }) {
    return axios
      .get(`${ORG_URL}/${organization_id}/fields`, {
        headers: authHeader(),
        params: {
          page,
          limit,
        },
      })
      .then((response) => response.data)
      .catch((err) => {
        console.log(err);
      });
  }

  checkRelations(ids) {
    return axios
      .get(`${ORG_URL}/check-relations`, {
        headers: authHeader(),
        params: {
          ids: ids.join(','),
        },
      })
      .then((response) => response.data);
  }

  getRelations(id) {
    return axios
      .get(`${ORG_URL}/${id}/related`, {
        headers: authHeader(),
      })
      .then((response) => response.data)
      .catch((err) => {
        console.log(err);
      });
  }

  async addRelation(organization_id, related_id, type) {
    return await axios.post(
      `${ORG_URL}/related`,
      { organization_id, related_id, type },
      {
        headers: authHeader(),
      }
    );
  }

  async deleteRelation(organizationId) {
    const response = await this.delete(
      `${ORG_URL}/related/${organizationId}`,
      {
        headers: authHeader(),
      },
      {
        fullResponse: true,
        errorsRedirect: false,
      }
    );

    if (response.status === 200) {
      const { data } = response;

      return data;
    }

    return response;
  }

  async getReports(organizationId, filter) {
    return await this.get(
      `${ORG_URL}/${organizationId}/reports`,
      {
        params: filter,
        headers: authHeader(),
      },
      { fullResponse: true }
    );
  }

  async createReportUsingFileExtraction(
    file,
    type = 'Treasury',
    organizationId,
    cancelToken
  ) {
    const form = new FormData();
    const formBlob = await createBlobObject(file);
    form.append('file', formBlob, file.name);
    form.append('type', type);
    return this.post(
      `${ORG_URL}/${organizationId}/reports/usingFileExtraction`,
      form,
      {
        headers: authHeader(),
        cancelToken,
      }
    );
  }

  async createManualReport(organizationId, data, cancelToken) {
    return this.post(`${ORG_URL}/${organizationId}/reports`, data, {
      headers: authHeader(),
      cancelToken,
    });
  }

  updateCustomField(fieldId, data) {
    return this.put(`${ORG_URL}/${fieldId}/fields`, data, {
      headers: authHeader(),
    });
  }

  getCustomField(contactId, { page, limit }) {
    const params = {
      page,
      limit,
    };
    return axios.get(`${ORG_URL}/${contactId}/fields`, {
      params,
      headers: authHeader(),
    });
  }

  deleteCustomField(contactId, fieldId) {
    return this.delete(`${ORG_URL}/${contactId}/fields/${fieldId}`, {
      headers: authHeader(),
    })
      .then((response) => {
        return response.data;
      })
      .catch((error) => error);
  }
}

export default new OrganizationService();
