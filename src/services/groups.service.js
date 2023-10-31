import axios from 'axios';

import authHeader from './auth-header';
const API_URL = process.env.REACT_APP_API_URL + '/api/groups';

class GroupService {
  async getRolues() {
    return axios
      .get(`${API_URL}/hierarchy`, {
        params: { self: true },
        headers: authHeader(),
      })
      .then((response) => response.data)
      .catch((error) => error);
  }

  async CreateGroup({ name, parent_id, description, has_sibling_access }) {
    return await axios
      .post(
        API_URL,
        { name, parent_id, description, has_sibling_access },
        { headers: authHeader() }
      )
      .then((response) => response.data)
      .catch((error) => error);
  }

  async getGroupById(group_id) {
    return axios
      .get(`${API_URL}/${group_id}`, { headers: authHeader() })
      .then((response) => response.data)
      .catch((error) => error);
  }

  async updateGroup(data) {
    return await axios
      .put(`${API_URL}/${data.id}`, data, { headers: authHeader() })
      .then((response) => response.data)
      .catch((error) => error);
  }

  async deleteGroup(role_id, transferId) {
    return axios
      .delete(`${API_URL}/${role_id}`, {
        headers: authHeader(),
        params: {
          transferId,
        },
      })
      .then((response) => response.data)
      .catch((error) => error);
  }

  async removeUserFromGroup(data) {
    return axios
      .delete(`${API_URL}/user`, {
        data,
        headers: authHeader(),
      })
      .then((response) => response.data)
      .catch((error) => error);
  }
}

export default new GroupService();
