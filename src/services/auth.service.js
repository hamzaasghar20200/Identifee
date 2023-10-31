import axios from 'axios';
import authHeader from './auth-header';
import {
  getBrowserNavigationType,
  setIdfToken,
  getIdfToken,
  removeIdfToken,
  INDUSTRIES_STORAGE_KEY,
  TECHNOLOGIES_STORAGE_KEY,
  SIC_STORAGE_KEY,
  NAICS_STORAGE_KEY,
} from '../utils/Utils';

const API_URL = process.env.REACT_APP_API_URL + '/api/auth';
const TABS_OPENED_KEY = 'tabsOpen';
const SESSION_ACTIVE_KEY = 'isMySessionActive';
class AuthService {
  async login(client_id, email, password, code = null) {
    const response = await axios.post(API_URL + '/login', {
      grant_type: 'password',
      client_id,
      username: email,
      password,
      otp: code || undefined,
    });
    if (response?.response?.status === 401) throw response;

    if (
      response.data.access_token &&
      response.data.access_token !== 'otp_enabled'
    ) {
      setIdfToken(JSON.stringify(response.data));
    }

    return response.data;
  }

  async refreshToken(token) {
    try {
      const { data } = await axios.post(API_URL + '/login', {
        grant_type: 'refresh_token',
        refresh_token: token || getIdfToken(true)?.refresh_token,
      });
      return data;
    } catch (e) {
      return { error: e };
    }
  }

  async impersonate(id, updateStorage) {
    const response = await axios.post(
      `${process.env.REACT_APP_API_URL}/api/users/${id}/impersonation`,
      { id },
      {
        headers: authHeader(),
      }
    );
    if (
      updateStorage &&
      response.data.access_token &&
      response.data.access_token !== 'otp_enabled'
    ) {
      removeIdfToken();
      localStorage.removeItem('user_permissions');
      setIdfToken(JSON.stringify(response.data));
    }

    return response.data;
  }

  logout() {
    removeIdfToken();
    localStorage.removeItem('user_permissions');
    localStorage.removeItem(TABS_OPENED_KEY);
    // removing technologies/sic/naics/industries local storage keys when logout
    localStorage.removeItem(INDUSTRIES_STORAGE_KEY);
    localStorage.removeItem(TECHNOLOGIES_STORAGE_KEY);
    localStorage.removeItem(SIC_STORAGE_KEY);
    localStorage.removeItem(NAICS_STORAGE_KEY);
  }

  async requestPassword(email) {
    const response = await axios.post(API_URL + '/password/request', {
      username: email,
    });
    return response.data.message;
  }

  async resetPassword(password, token) {
    const { data } = await axios.post(
      API_URL + '/password/reset',
      {
        password,
      },
      {
        headers: { authorization: `Bearer ${token}` },
      }
    );
    return data;
  }

  isTokenValid() {
    const token = JSON.parse(getIdfToken());
    const now = new Date().getTime();

    if (token && token.expires - now > 0) {
      return true;
    }

    // token expired remove it from localStorage
    removeIdfToken();
    return false;
  }

  guestToken(email, organizationId) {
    return axios.post(`${API_URL}/guest/token`, {
      grant_type: 'guest_generate',
      username: email,
      redirect_url: `${process.env.REACT_APP_CLIENT_PORTAL_URL}/clientportal/dashboard`,
      organizationId,
    });
  }

  async introspect(token) {
    const { data } = await axios.post(
      `${API_URL}/token/introspect`,
      { token },
      {
        headers: {
          // TODO may need to fix token storage naming
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return data;
  }

  // took following logic from here: https://stackoverflow.com/a/73740306/2633871 and used it accordingly
  bindAutoLogout(onLogout) {
    window.addEventListener('beforeunload', (event) => {
      window.localStorage[SESSION_ACTIVE_KEY] = 'true';
    });
    // define increment counter part
    const tabsOpen = localStorage.getItem(TABS_OPENED_KEY);
    if (tabsOpen == null) {
      localStorage.setItem(TABS_OPENED_KEY, '1');
    } else {
      localStorage.setItem(
        TABS_OPENED_KEY,
        parseInt(tabsOpen) + parseInt('1') + ''
      );
    }

    // define decrement counter part
    window.onunload = function (e) {
      const newTabCount = localStorage.getItem(TABS_OPENED_KEY);
      if (newTabCount !== null) {
        localStorage.setItem(TABS_OPENED_KEY, parseInt(newTabCount) - 1 + '');
      }
    };
    // this means browser is refreshed from refresh icon in toolbar
    if (getBrowserNavigationType() === 1) {
      window.localStorage[SESSION_ACTIVE_KEY] = 'false';
    } else {
      const currentTabCount = parseInt(
        localStorage.getItem(TABS_OPENED_KEY) || '0'
      );
      const value = localStorage.getItem(SESSION_ACTIVE_KEY);
      if (value === 'true') {
        if (currentTabCount - 1 === 0) {
          // ignore public urls so that auto logout bind doesnt cater them
          if (
            location.pathname === '/self-assessment' ||
            location.pathname === '/request-password' ||
            location.pathname.includes('/video') ||
            location.pathname.includes('/login') ||
            location.pathname.includes('/request-password') ||
            location.pathname.includes('/sign-up') ||
            location.pathname.includes('clientportal')
          ) {
            return;
          }
          onLogout();
          window.localStorage[SESSION_ACTIVE_KEY] = 'false';
        } else {
          window.localStorage[SESSION_ACTIVE_KEY] = 'false';
        }
      }
    }
  }
}

export default new AuthService();
