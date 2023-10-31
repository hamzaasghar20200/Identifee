import authHeader from './auth-header';
import BaseRequestService from './baseRequest.service';
import { getIdfToken } from '../utils/Utils';
const API_URL = process.env.REACT_APP_API_URL;
const NOTIFS_URL = API_URL + '/api/notifications/settings';

class NotificationService extends BaseRequestService {
  getSettings() {
    return this.get(NOTIFS_URL, {
      headers: authHeader(),
    });
  }

  addSettings(settings) {
    return this.post(
      NOTIFS_URL,
      { settings },
      {
        headers: authHeader(),
      }
    );
  }

  getNotifications(page = 1, limit = 10) {
    const user = JSON.parse(getIdfToken());
    if (user) {
      return this.get(`${API_URL}/api/auth/context/notifications`, {
        headers: authHeader(),
        params: { page, limit },
      });
    } else {
      return '{}';
    }
  }
}

export default new NotificationService();
