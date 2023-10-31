import authHeader from './auth-header';
import BaseRequestService from './baseRequest.service';
import axios from 'axios';
const API_URL = process.env.REACT_APP_API_URL + '/api/activities';

class ActivityContactService extends BaseRequestService {
  getActivity(queryFilter, { type, page, limit }) {
    const { filter, organizationId, contactId, dealId, ...restProps } =
      queryFilter || {};

    const params = {
      ...restProps,
      ...filter,
      organizationId,
      contactId,
      dealId,
      type,
      page,
      limit,
    };
    return axios
      .get(API_URL, {
        params,
        headers: authHeader(),
      })
      .then((response) => {
        return response.data;
      });
  }

  createActivityRequest(data) {
    return this.post(`${API_URL}/requests`, data, {
      headers: authHeader(),
    });
  }

  addActivity(data) {
    return this.post(`${API_URL}`, data, {
      headers: authHeader(),
    })
      .then((response) => {
        return response;
      })
      .catch((error) => error);
  }

  deleteActivity(activityId) {
    return this.delete(`${API_URL}/${activityId}`, { headers: authHeader() })
      .then((response) => {
        return response.data;
      })
      .catch((error) => error);
  }

  markAsCompleted(activityId) {
    return axios.put(
      `${API_URL}/${activityId}/complete`,
      {},
      { headers: authHeader() }
    );
  }

  updateActivity(activityId, data) {
    return axios.put(`${API_URL}/${activityId}`, data, {
      headers: authHeader(),
    });
  }

  cancelActivity(activityId) {
    return axios.put(
      `${API_URL}/${activityId}/cancel`,
      {},
      { headers: authHeader() }
    );
  }

  getStats() {
    return axios.post(
      `${API_URL}/summary`,
      {},
      {
        headers: authHeader(),
      }
    );
  }

  saveCustomField(activityId, data) {
    return axios.put(`${API_URL}/${activityId}/fields`, data, {
      headers: authHeader(),
    });
  }

  getCustomField(activityId, { page, limit }) {
    const params = {
      page,
      limit,
    };
    return axios.get(`${API_URL}/${activityId}/fields`, {
      params,
      headers: authHeader(),
    });
  }

  deleteCustomField(activityId, fieldId) {
    return this.delete(`${API_URL}/${activityId}/fields/${fieldId}`, {
      headers: authHeader(),
    })
      .then((response) => {
        return response.data;
      })
      .catch((error) => error);
  }

  addOwnerActivity(activityId, data) {
    return axios.post(`${API_URL}/${activityId}/owners`, data, {
      headers: authHeader(),
    });
  }

  getSingleActivity(activityId) {
    return axios.get(
      `${API_URL}/${activityId}`,
      {
        headers: authHeader(),
      },
      {}
    );
  }
}

export default new ActivityContactService();
