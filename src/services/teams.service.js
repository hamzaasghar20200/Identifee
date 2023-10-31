import axios from 'axios';

import authHeader from './auth-header';
const API_URL = process.env.REACT_APP_API_URL + '/api/teams';

class TeamService {
  async getTeams({ page = 1, limit = 10, order }) {
    const params = {
      page,
      limit,
      order,
    };

    return axios
      .get(`${API_URL}`, {
        params,
        headers: authHeader(),
      })
      .then((response) => response.data)
      .catch((error) => error);
  }

  async CreateTeam(data) {
    return await axios.post(API_URL, data, { headers: authHeader() });
  }

  async getTeamById(team_id) {
    return axios
      .get(`${API_URL}/${team_id}`, { headers: authHeader() })
      .then((response) => response.data)
      .catch((error) => error);
  }

  async getTeamMemberById(team_id, { page = 1, limit = 10, order }) {
    const params = {
      page,
      limit,
      order,
    };
    return axios
      .get(`${API_URL}/${team_id}/members`, {
        params,
        headers: authHeader(),
      })
      .then((response) => response.data)
      .catch((error) => error);
  }

  async updateTeam(data) {
    return await axios
      .put(`${API_URL}/${data.id}`, data, { headers: authHeader() })
      .then((response) => response.data)
      .catch((error) => error);
  }

  async deleteTeam(team_id) {
    return axios
      .delete(`${API_URL}/${team_id}`, {
        headers: authHeader(),
      })
      .then((response) => response.data)
      .catch((error) => error);
  }
}

export default new TeamService();
