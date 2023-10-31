import axios from 'axios';
import { ttlMemoize, getIdfToken } from '../utils/Utils';
import authHeader from './auth-header';

const API_URL = process.env.REACT_APP_API_URL;
const API_USERS_URL = API_URL + '/api/users';

class UserService {
  constructor() {
    this.getUserAvatarMemoized = ttlMemoize(this.getUserAvatar);
  }

  getUserInfo() {
    const user = JSON.parse(getIdfToken());
    if (user) {
      return axios
        .get(`${API_URL}/api/auth/context/user`, { headers: authHeader() })
        .then((response) => {
          return response.data;
        });
    } else {
      return new Promise((resolve) => {
        resolve({ data: {} });
      });
    }
  }

  invite(invitationInfo) {
    return axios
      .post(`${API_USERS_URL}`, invitationInfo, {
        headers: authHeader(),
      })
      .then((response) => {
        return response.data;
      });
  }

  acceptInvite(token, data) {
    return axios
      .post(`${API_URL}/api/auth/invite/accept`, data, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        return response.data;
      });
  }

  sendMessage(data) {
    return axios
      .post(`${API_USERS_URL}/message`, data, {
        headers: authHeader(),
      })
      .then((response) => response);
  }

  updateUserInfo(data) {
    return axios
      .put(`${API_USERS_URL}/me`, data, {
        headers: authHeader(),
      })
      .then((response) => {
        return response.data;
      });
  }

  uploadAvatar(body) {
    return axios.post(`${API_URL}/api/files`, body, {
      headers: {
        ...authHeader(),
      },
    });
  }

  getFile(id) {
    return axios
      .get(`${API_URL}/api/files/${id}`, { headers: authHeader() })
      .then((res) => res.data)
      .catch((err) => console.log(err));
  }

  updatePassword(data) {
    return axios.put(`${API_URL}/api/auth/password/change`, data, {
      headers: authHeader(),
    });
  }

  removeUsers(data) {
    return axios
      .delete(API_USERS_URL, {
        headers: authHeader(),
        params: {
          ids: data.join(','),
        },
      })
      .then((response) => response.data)
      .catch((err) => console.log(err));
  }

  getUserById(id) {
    return axios
      .get(`${API_USERS_URL}/${id}`, {
        headers: authHeader(),
      })
      .then((response) => response.data)
      .catch((error) => console.log(error));
  }

  verifyUserById(token, id) {
    return axios
      .get(`${API_USERS_URL}/${id}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => response.data)
      .catch((error) => console.log(error));
  }

  getUserAvatar(userId) {
    return axios
      .get(`${API_USERS_URL}/${userId}/avatar`, {
        headers: authHeader(),
      })
      .then((response) => response.data)
      .catch((error) => console.log(error));
  }

  /**
   * Avatars are returned with a signed URL so we must memoize with a
   * ttl which is set based on the URL expiration.
   */
  async getUserAvatarMemo(userId) {
    const result = await this.getUserAvatarMemoized.memo(userId);
    if (result) {
      this.getUserAvatarMemoized.setTTL(result.expiry, userId);
    }

    return result;
  }

  updateUserInfoById(id, data) {
    return axios
      .put(`${API_USERS_URL}/${id}`, data, {
        headers: authHeader(),
      })
      .then((response) => {
        return response.data;
      });
  }

  resentInvite(data) {
    return axios
      .post(`${API_USERS_URL}/resent-invite`, data, {
        headers: authHeader(),
      })
      .then((response) => {
        return response.data;
      });
  }

  changeStatus(id, status) {
    return axios
      .patch(
        `${API_USERS_URL}/${id}/status`,
        { status },
        {
          headers: authHeader(),
        }
      )
      .then((response) => {
        return response.data;
      });
  }

  getUsers(queryFilter = {}, { page = 1, extraData, limit, self }) {
    if (queryFilter.role) {
      queryFilter.roleId = queryFilter.role;
      delete queryFilter.role;
    }

    const { filter, ...restProps } = queryFilter;

    const params = {
      ...restProps,
      ...filter,
      page,
      limit: limit || 10,
      extraData,
      self,
    };

    return axios
      .get(API_USERS_URL, {
        params,
        headers: authHeader(),
      })
      .then((response) => response);
  }

  inviteTeamUsers(user_id, data) {
    return axios
      .post(`${API_USERS_URL}/${user_id}/teams`, data, {
        headers: authHeader(),
      })
      .then((response) => response);
  }

  getTeamMemberByUserId(user_id) {
    return axios
      .get(`${API_USERS_URL}/${user_id}/teams`, {
        headers: authHeader(),
      })
      .then((response) => response);
  }

  getMatchingGuests(search) {
    return axios
      .get(`${API_USERS_URL}/guests`, {
        params: { search },
        headers: authHeader(),
      })
      .then((response) => response);
  }

  getGuestsByIds(ids) {
    return axios
      .get(`${API_USERS_URL}/guests/ids`, {
        params: { ids },
        headers: authHeader(),
      })
      .then((response) => response);
  }

  async updatePasswordByUserId(user_id, data) {
    const response = await axios.put(
      `${API_USERS_URL}/${user_id}/password`,
      data,
      {
        headers: authHeader(),
      }
    );
    return response;
  }
}

export default new UserService();
