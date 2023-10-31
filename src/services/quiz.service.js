import axios from 'axios';

import authHeader from './auth-header';

const API_URL = process.env.REACT_APP_API_URL + '/api/quizzes';

class QuizService {
  getQuiz(id) {
    return axios
      .get(`${API_URL}/${id}`, {
        headers: authHeader(),
      })
      .then((response) => response.data);
  }

  deleteQuiz(id) {
    return axios
      .delete(`${API_URL}/${id}`, {
        headers: authHeader(),
      })
      .then((response) => response.data);
  }

  createUpdateQuiz(data) {
    return axios
      .put(API_URL, data, {
        headers: authHeader(),
      })
      .then((response) => response);
  }

  createUpdatePages(id, pages) {
    return axios
      .put(`${API_URL}/${id}/pages`, { pages }, { headers: authHeader() })
      .then((response) => response);
  }

  finishTakeQuiz(id, answers) {
    return axios
      .post(
        `${API_URL}/${id}/submissions`,
        { answers },
        {
          headers: authHeader(),
        }
      )
      .then((response) => response)
      .catch((e) => console.log(e));
  }

  getQuizSubmissions(id) {
    return axios
      .get(`${API_URL}/${id}/submissions`, {
        params: { page: 1, limit: 10 },
        headers: authHeader(),
      })
      .then((response) => response.data)
      .catch((e) => console.log(e));
  }
}

export default new QuizService();
