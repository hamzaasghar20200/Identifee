import cubejs from '@cubejs-client/core';
import axios from 'axios';
import { getIdfToken } from '../utils/Utils';
import authHeader from './auth-header';
import BaseRequestService from './baseRequest.service';
const API_URL = process.env.REACT_APP_API_URL;

class CubeService extends BaseRequestService {
  constructor() {
    super();
    this.initCube();
  }

  initCube(type = 'POST') {
    this.cube = cubejs(
      () => {
        const creds = JSON.parse(getIdfToken());
        return `Bearer ${creds.access_token}`;
      },
      {
        apiUrl: `${API_URL}/api/analytics/v1`,
        method: type,
      }
    );
  }

  getCube(type) {
    this.initCube(type);
    return this.cube;
  }

  getAnalytics({ isPublic }) {
    return axios
      .get(`${API_URL}/api/analytics`, {
        params: { isPublic },
        headers: authHeader(),
      })
      .then((response) => response.data);
  }

  getMeta() {
    return axios.get(`${API_URL}/api/analytics/v1/meta`, {
      headers: authHeader(),
    });
  }
}

export const cubeService = new CubeService();
