import axios from 'axios';
import authHeader from './auth-header';
import BaseRequestService from './baseRequest.service';

const API_URL = process.env.REACT_APP_API_URL + '/api/modules';

class ModulesServices extends BaseRequestService {
  async getModules(page, limit) {
    return axios
      .get(`${API_URL}`, {
        params: { page, limit },

        headers: authHeader(),
      })
      .then((response) => response.data);
  }

  async upsertModule(data) {
    try {
      const response = await axios.put(`${API_URL}`, data, {
        headers: authHeader(),
      });
      return response;
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }
}

export default new ModulesServices();
