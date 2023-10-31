import authHeader from './auth-header';
import BaseRequestService from './baseRequest.service';

const API_URL = process.env.REACT_APP_API_URL;
const REPORTS_URL = `${API_URL}/api/reports`;
class ReportService extends BaseRequestService {
  updateReport(reportId, data, cancelToken) {
    return this.put(`${REPORTS_URL}/${reportId}`, data, {
      headers: authHeader(),
      cancelToken,
    });
  }

  getReport(reportId) {
    return this.get(`${REPORTS_URL}/${reportId}`, {
      headers: authHeader(),
    });
  }

  deleteReport(reportId) {
    return this.delete(`${REPORTS_URL}/${reportId}`, {
      headers: authHeader(),
    });
  }

  getActiveFileExtractions(reportId) {
    return this.get(`${REPORTS_URL}/${reportId}/extractions/active`, {
      headers: authHeader(),
    });
  }
}

export default new ReportService();
