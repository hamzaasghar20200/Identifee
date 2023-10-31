import axios from 'axios';
import authHeader from './auth-header';
import BaseRequestService from './baseRequest.service';

const API_URL = process.env.REACT_APP_API_URL + '/api/deals';

class DealService extends BaseRequestService {
  async getDeals(queryFilter, { page = 1, limit = 10 }, search) {
    const { filter, ...restProps } = queryFilter || {};

    const params = {
      ...restProps,
      ...filter,
      page,
      limit,
      search,
    };

    return await this.get(
      API_URL,
      {
        params,
        headers: authHeader(),
      },
      { fullResponse: true }
    );
  }

  async getDealById(id) {
    const response = await this.get(
      `${API_URL}/${id}`,
      {
        headers: authHeader(),
      },
      {}
    );

    const { deal, deal_products } = response;
    return { ...deal, deal_products };
  }

  async createDeal(data) {
    return await this.post(
      API_URL,
      data,
      { headers: authHeader() },
      { fullResponse: true }
    );
  }

  async deleteDeal(id) {
    return this.delete(
      `${API_URL}/${id}`,
      { headers: authHeader() },
      { errorsRedirect: true, fullResponse: true }
    );
  }

  async updateDeal(id, data) {
    return await this.patch(
      `${API_URL}/${id}`,
      data,
      { headers: authHeader() },
      { fullResponse: true }
    );
  }

  async updateDealProducts(dealId, data) {
    return axios.patch(`${API_URL}/${dealId}/products`, data, {
      headers: authHeader(),
    });
  }

  deleteDealProduct(dealProductId) {
    return axios.delete(`${API_URL}/products/${dealProductId}`, {
      headers: authHeader(),
    });
  }

  async getOwners(deal_id, { page = 1, limit = 5 }) {
    return await this.get(`${API_URL}/${deal_id}/owners`, {
      headers: authHeader(),
      params: {
        page,
        limit,
      },
    });
  }

  async getFollowers(deal_id, { page = 1, limit = 5 }) {
    return await this.get(`${API_URL}/${deal_id}/followers`, {
      headers: authHeader(),
      params: {
        page,
        limit,
      },
    });
  }

  addOwner(deal_id, user_id) {
    return axios
      .post(
        `${API_URL}/${deal_id}/owners/${user_id}`,
        {},
        {
          headers: authHeader(),
        }
      )
      .then((response) => response.data);
  }

  async removeOwner(dealId, userId) {
    return await axios.delete(`${API_URL}/${dealId}/owners/${userId}`, {
      headers: authHeader(),
    });
  }

  async checkFollowing(deal_id, user_id) {
    const result = await this.get(
      `${API_URL}/${deal_id}/followers/${user_id}`,
      {
        headers: authHeader(),
      }
    );

    return result.isFollower;
  }

  async stopFollowing(deal_id, user_id) {
    return await this.delete(
      `${API_URL}/${deal_id}/followers/${user_id}`,
      { headers: authHeader() },
      { fullResponse: true }
    );
  }

  async startFollowing(deal_id, user_id) {
    return await this.post(
      `${API_URL}/${deal_id}/followers/${user_id}`,
      {},
      { headers: authHeader() },
      { fullResponse: true }
    );
  }

  async updateDealPosition(id, data) {
    return await this.put(
      `${API_URL}/${id}/position`,
      data,
      { headers: authHeader() },
      { fullResponse: true }
    );
  }

  async getStatusSummary() {
    return await this.get(
      `${API_URL}/status/summary`,
      { headers: authHeader() },
      { fullResponse: true }
    );
  }

  async updateDealStatus(dealId, data) {
    return await this.patch(
      `${API_URL}/status/${dealId}`,
      data,
      { headers: authHeader() },
      { fullResponse: true }
    );
  }

  async getDealProducts(dealId, { page = 1, limit = 10 }) {
    return await this.get(`${API_URL}/${dealId}/products`, {
      headers: authHeader(),
      params: {
        page,
        limit,
      },
    });
  }

  updateCustomField(fieldId, data) {
    return this.put(`${API_URL}/${fieldId}/fields`, data, {
      headers: authHeader(),
    });
  }

  getCustomField(contactId, { page, limit }) {
    const params = {
      page,
      limit,
    };
    return axios.get(`${API_URL}/${contactId}/fields`, {
      params,
      headers: authHeader(),
    });
  }

  deleteCustomField(contactId, fieldId) {
    return this.delete(`${API_URL}/${contactId}/fields/${fieldId}`, {
      headers: authHeader(),
    })
      .then((response) => {
        return response.data;
      })
      .catch((error) => error);
  }
}

export default new DealService();
