import authHeader from './auth-header';
import BaseRequestService from './baseRequest.service';

const API_URL = process.env.REACT_APP_API_URL + '/api/searches';

class SearchesService extends BaseRequestService {
  async getSearches() {
    const response = await this.get(
      API_URL,
      {
        headers: authHeader(),
      },
      { fullResponse: true, errorsRedirect: false }
    );
    return response?.data;
  }

  async createSearch(data) {
    const response = await this.post(
      API_URL,
      data,
      { headers: authHeader() },
      { fullResponse: true }
    );
    return response?.data;
  }

  async updateSearch(searchId, data) {
    return await this.put(
      `${API_URL}/${searchId}`,
      data,
      { headers: authHeader() },
      { fullResponse: true }
    );
  }

  async deleteSearch(searchId) {
    return await this.delete(
      `${API_URL}/${searchId}`,
      {
        headers: authHeader(),
      },
      { fullResponse: true }
    );
  }
}

export default new SearchesService();
