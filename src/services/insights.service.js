import authHeader from './auth-header';
import BaseRequestService from './baseRequest.service';

const API_URL = process.env.REACT_APP_API_URL + '/api/dashboards';
const type = 'insight';

class InsightsService extends BaseRequestService {
  getInsights(organizationId, page = 1, limit = 1000) {
    return this.get(API_URL, {
      headers: authHeader(),
      params: { organizationId, page, limit, type },
    });
  }

  getInsightsComponents(insightId, enabled, page = 1, limit = 1000) {
    return this.get(`${API_URL}/${insightId}/components`, {
      headers: authHeader(),
      params: { enabled, page, limit },
    });
  }

  createDefaultInsights(organizationId) {
    return this.post(
      `${API_URL}/default`,
      { type, organizationId },
      {
        headers: authHeader(),
      },
      // i hate this... refactor trash BaseRequestService
      {
        errorsRedirect: false,
      }
    );
  }

  createInsightComponent(insightId, data) {
    return this.post(`${API_URL}/${insightId}/components`, data, {
      headers: authHeader(),
    });
  }

  updateInsightComponent(insightId, componentId, data) {
    return this.put(`${API_URL}/${insightId}/components/${componentId}`, data, {
      headers: authHeader(),
    });
  }

  updateInsightReport(insightId, data) {
    return this.put(`${API_URL}/${insightId}`, data, {
      headers: authHeader(),
    });
  }

  deleteInsight(insightId) {
    return this.delete(`${API_URL}/${insightId}`, {
      headers: authHeader(),
    });
  }
}

export default new InsightsService();
