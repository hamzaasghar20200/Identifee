import authHeader from './auth-header';

const API_URL = process.env.REACT_APP_API_URL;

export class API {
  constructor() {
    this.headers = authHeader();
    this.headers['Content-Type'] = 'application/json';
  }

  async request(path, method = 'GET', body = '') {
    const opts = {
      method,
      headers: this.headers,
    };

    if (body !== '') {
      opts.body = JSON.stringify(body);
    }

    return fetch(path, opts);
  }

  async GetUserInfo() {
    const resp = await this.request(`${API_URL}/api/users/me`);
    return Promise.resolve(resp.json());
  }

  async GetLessonById(id) {
    const resp = await this.request(`${API_URL}/api/lessons/${id}`);
    return Promise.resolve(resp.json());
  }

  async TrackLesson(id, data) {
    // TODO Move  these API to *.service
    const body = {
      page_id: data.pageId,
    };

    const resp = await this.request(
      `${API_URL}/api/lessons/${id}/progress`,
      'PUT',
      body
    );

    return Promise.resolve(resp.json());
  }
}

export default new API();
