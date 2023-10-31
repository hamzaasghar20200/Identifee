import authHeader from './auth-header';
import BaseRequestService from './baseRequest.service';

const API_URL = process.env.REACT_APP_API_URL + '/api/dashboards';

class DashboardService extends BaseRequestService {
  getDashboards(page = 1, limit = 1000) {
    return this.get(`${API_URL}`, {
      headers: authHeader(),
      params: { page, limit, type: 'dashboard' },
    });
  }

  getDashboardsComponents(dashboardId, page = 1, limit = 1000) {
    return this.get(`${API_URL}/${dashboardId}/components`, {
      headers: authHeader(),
      params: { page, limit },
    });
  }

  createDashboardComponent(dashboardId, data) {
    return this.post(`${API_URL}/${dashboardId}/components`, data, {
      headers: authHeader(),
    });
  }

  updateDashboardComponent(dashboardId, componentId, data) {
    return this.put(
      `${API_URL}/${dashboardId}/components/${componentId}`,
      data,
      {
        headers: authHeader(),
      }
    );
  }

  updateDashboardComponentAnalytics(dashboardId, componentId, data) {
    return this.put(
      `${API_URL}/${dashboardId}/components/${componentId}/analytics`,
      data,
      {
        headers: authHeader(),
      }
    );
  }

  deleteDashboardComponent(dashboardId, componentId) {
    return this.delete(`${API_URL}/${dashboardId}/components/${componentId}`, {
      headers: authHeader(),
    });
  }

  createDashboard(data) {
    return this.post(API_URL, data, {
      headers: authHeader(),
    });
  }

  createDefaultDashboards(tenantId, data) {
    return this.post(`${API_URL}/default`, data, {
      headers: authHeader(),
      params: { tenantId },
    });
  }

  updateDashboard(dashboardId, data) {
    return this.put(`${API_URL}/${dashboardId}`, data, {
      headers: authHeader(),
    });
  }

  deleteDashboard(dashboardId) {
    return this.delete(`${API_URL}/${dashboardId}`, {
      headers: authHeader(),
    });
  }
}

export default new DashboardService();
