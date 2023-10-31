import BaseRequestService from './baseRequest.service';

import authHeader from './auth-header';
const API_URL = process.env.REACT_APP_API_URL;
const defaultModel = 'claude-instant-1';
class AnthropicService extends BaseRequestService {
  async createCompletion(data, model = defaultModel, cancelToken) {
    const response = await this.post(
      `${API_URL}/api/providers/anthropic/completions`,
      { ...data, model },
      {
        headers: authHeader(),
        cancelToken,
      },
      { fullResponse: true }
    );
    return response?.data;
  }
}
export default new AnthropicService();
