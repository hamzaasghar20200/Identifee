import axios from 'axios';

import authHeader from './auth-header';

const API_URL = process.env.REACT_APP_API_URL + '/api/search';

class SearchService {
  async getSearchResults(searchQuery) {
    const { s, resource = 'all', type = 'all' } = searchQuery || {};

    const params = {
      s,
      resource,
      type,
    };

    return axios
      .get(API_URL, {
        params,
        headers: authHeader(),
      })
      .then((response) => response);
  }
}

export default new SearchService();
