import axios from 'axios';
import authHeader from './auth-header';

const API_URL = `${process.env.REACT_APP_API_URL}/api`;

class EnvService {
  async getEnv() {
    const response = await axios.get(`${API_URL}/env`, {
      headers: {
        host: window.location.hostname,
        ...authHeader(),
      },
    });

    return response.data;
  }
}

export default new EnvService();
