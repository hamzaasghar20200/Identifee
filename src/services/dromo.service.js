import authHeader from './auth-header';
import BaseRequestService from './baseRequest.service';

const API_URL = process.env.REACT_APP_API_URL;

class DromoService extends BaseRequestService {
  async callback(body) {
    const response = await this.post(
      `${API_URL}/api/providers/dromo/callback`,
      body,
      {
        headers: authHeader(),
      },
      { fullResponse: true }
    );
    return response?.data;
  }
}

export default new DromoService();
