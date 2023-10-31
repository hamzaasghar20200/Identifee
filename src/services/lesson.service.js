import axios from 'axios';

import authHeader from './auth-header';
import { getIdfToken } from '../utils/Utils';
const API_URL = process.env.REACT_APP_API_URL;

class LessonService {
  async getRelatedLessons() {
    const result = await axios.get(`${API_URL}/api/lessons/related`, {
      headers: authHeader(),
    });
    return result.data;
  }

  async getLessons(params = {}) {
    const result = await axios.get(`${API_URL}/api/lessons`, {
      headers: authHeader(),
      params,
    });

    return result.data;
  }

  GetLessonTrackByLessonId(id, params = {}) {
    const { access_token } = JSON.parse(getIdfToken());

    return axios
      .get(`${API_URL}/api/lessons/${id}/progress`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${access_token}`,
        },
        params,
      })
      .then((response) => response.data);
  }

  PutFavoriteByLessonId({ id }) {
    const { access_token } = JSON.parse(getIdfToken());

    return axios
      .put(
        `${API_URL}/api/lessons/${id}/favorite`,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${access_token}`,
          },
        }
      )
      .then((response) => response.data);
  }

  SubmitAnswer(lessonId, pageId, answer) {
    return axios
      .post(
        `${API_URL}/api/lessons/${lessonId}/pages/${pageId}/check`,
        { answer },
        { headers: authHeader() }
      )
      .then((response) => response.data);
  }

  PdfLinkByLesson(fileId) {
    return axios
      .get(`${API_URL}/api/assets/${fileId}`, {
        params: {
          from: 'lesson',
        },
        headers: authHeader(),
        responseType: 'blob',
      })
      .then((response) => response.data);
  }

  // seriously? this is wack, original API was doing an upsert..
  async createUpdateLesson(data) {
    const { access_token } = JSON.parse(getIdfToken());

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${access_token}`,
    };

    try {
      if (data.id) {
        const { id, ...rest } = data;
        const response = await axios.put(
          `${API_URL}/api/lessons/${data.id}`,
          rest,
          {
            headers,
          }
        );
        return response;
      } else {
        const response = await axios.post(`${API_URL}/api/lessons`, data, {
          headers,
        });
        return response;
      }
    } catch (error) {
      console.error(error);
    }
  }

  upsertPages(id, pages) {
    const { access_token } = JSON.parse(getIdfToken());

    return axios
      .put(
        `${API_URL}/api/lessons/${id}/pages`,
        {
          pages,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${access_token}`,
          },
        }
      )
      .then((response) => response);
  }

  createUpdatePages(id, pages, removePages) {
    const { access_token } = JSON.parse(getIdfToken());

    return axios
      .put(
        `${API_URL}/api/lessons/${id}/pages`,
        {
          pages,
          removePages,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${access_token}`,
          },
        }
      )
      .then((response) => response);
  }

  deleteLesson(id) {
    return axios
      .delete(`${API_URL}/api/lessons/${id}`, {
        headers: authHeader(),
      })
      .then((response) => response);
  }

  createVideoURL(externalUrl) {
    return axios
      .post(
        `${API_URL}/api/videos`,
        { externalUrl },
        {
          headers: authHeader(),
        }
      )
      .then((response) => response);
  }

  getVideo(uploadId) {
    return axios
      .get(`${API_URL}/api/providers/mux/${uploadId}`, {
        headers: authHeader(),
      })
      .then((response) => response);
  }

  reset(id) {
    const { access_token } = JSON.parse(getIdfToken());
    return axios
      .put(
        `${API_URL}/api/lessons/${id}/progress`,
        {
          page_id: null,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${access_token}`,
          },
        }
      )
      .then((response) => response.data);
  }
}

export default new LessonService();
