import axios from 'axios';

import authHeader from './auth-header';

const API_URL = process.env.REACT_APP_API_URL + '/api/courses';
class CourseService {
  getCourses(query = {}) {
    const { page = 1, limit = 10, ...rest } = query;

    return axios
      .get(`${API_URL}`, {
        headers: authHeader(),
        params: {
          page,
          limit,
          ...rest,
        },
      })
      .then((response) => response.data)
      .catch((e) => console.log(e));
  }

  deleteCourses(courseId) {
    return axios
      .delete(`${API_URL}/${courseId}`, {
        headers: authHeader(),
      })
      .then((response) => response.data)
      .catch((e) => console.log(e));
  }

  updateCourse(id, data) {
    return axios
      .patch(`${API_URL}/${id}`, data, {
        headers: authHeader(),
      })
      .then((response) => response.data)
      .catch((e) => console.log(e));
  }

  saveCourse(course) {
    return axios
      .post(API_URL, course, {
        headers: authHeader(),
      })
      .then((response) => response.data)
      .catch((e) => console.log(e));
  }

  getCourseLessonsById(id) {
    return axios
      .get(`${API_URL}/${id}/lessons`, { headers: authHeader() })
      .then((response) => response.data)
      .catch((e) => console.log(e));
  }

  getCourseById(id) {
    return axios
      .get(`${API_URL}/${id}`, { headers: authHeader() })
      .then((response) => response.data)
      .catch((e) => console.log(e));
  }

  getCourseProgress(id, params = {}) {
    return axios
      .get(`${API_URL}/${id}/progress`, { headers: authHeader(), params })
      .then((response) => response.data)
      .catch((e) => console.log(e));
  }

  getLessonCourseProgress(id, params = {}) {
    return axios
      .get(`${API_URL}/${id}/lessons/progress`, {
        headers: authHeader(),
        params,
      })
      .then((response) => response.data)
      .catch((e) => console.log(e));
  }

  async continue(id, payload = {}) {
    const response = await axios.put(`${API_URL}/${id}/progress`, payload, {
      headers: authHeader(),
    });
    return response.data;
  }

  complete(id) {
    return axios
      .post(`${API_URL}/${id}/complete`, {}, { headers: authHeader() })
      .then((response) => response.data)
      .catch((e) => console.log(e));
  }

  updateCourseLessons(id, courseLesson) {
    return axios
      .put(
        `${API_URL}/${id}/lessons`,
        {
          ...courseLesson,
        },
        {
          headers: authHeader(),
        }
      )
      .then((response) => response.data)
      .catch((e) => console.log(e));
  }

  putFavoriteCourseById(id) {
    return axios
      .put(
        `${API_URL}/${id}/favorite`,
        { courseId: id },
        {
          headers: authHeader(),
        }
      )
      .then((response) => response.data)
      .catch((e) => console.log(e));
  }

  createCourseQuiz(courseId, quizData) {
    return axios.post(`${API_URL}/${courseId}/contents`, quizData, {
      headers: authHeader(),
    });
  }

  getQuizByCourse(courseId) {
    return axios.get(`${API_URL}/${courseId}/contents`, {
      headers: authHeader(),
      params: { limit: 10, page: 1 },
    });
  }

  submitCourseQuizAnswers(courseId, quizId, answers) {
    return axios.post(
      `${API_URL}/${courseId}/quizzes/${quizId}/submit`,
      answers,
      {
        headers: authHeader(),
      }
    );
  }
}

export default new CourseService();
