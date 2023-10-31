import BaseRequestService from './baseRequest.service';
import authHeader from './auth-header';
const API_URL = process.env.REACT_APP_API_URL;
class OpenaiService extends BaseRequestService {
  async createChatCompletionRequest(data, model = 'gpt-3.5-turbo') {
    const response = await this.post(
      `${API_URL}/api/providers/openai/chat/completions`,
      { ...data, model },
      {
        headers: authHeader(),
      },
      { fullResponse: true }
    );
    return response?.data;
  }
}
export default new OpenaiService();
