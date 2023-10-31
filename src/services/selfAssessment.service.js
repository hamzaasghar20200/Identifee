import authHeader from './auth-header';
import BaseRequestService from './baseRequest.service';

const API_URL = process.env.REACT_APP_API_URL + '/api/selfAssessments';
const API_URL_ASSESSMENT_SUBMISSION =
  process.env.REACT_APP_API_URL + '/api/selfAssessmentSubmissions';

class SelfAssessmentService extends BaseRequestService {
  getAssessments() {
    return this.get(API_URL, {
      headers: authHeader(),
      params: {
        page: 1,
        limit: 10,
      },
    });
  }

  getSubmittedAssessmentById(assessmentId) {
    return this.get(`${API_URL_ASSESSMENT_SUBMISSION}/${assessmentId}`, {
      headers: authHeader(),
    });
  }

  createDefaultQuestions(data) {
    return this.post(API_URL, data, {
      headers: authHeader(),
    });
  }

  getAssessmentQuestions(assessmentId) {
    return this.get(`${API_URL}/${assessmentId}/questions`, {
      headers: authHeader(),
    });
  }

  submitAssessment(data, assessmentId) {
    return this.post(`${API_URL}/${assessmentId}/submit`, data, {
      headers: authHeader(),
    });
  }

  // TODO move this into backend, security flaw
  createTinyUrl(url) {
    return this.post(
      `https://api.tinyurl.com/create`,
      {
        url,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization:
            'Bearer Atj873TfvVqsaGek5Dg30iivr1pJhVx2P0YP8cwTX175qUC3rlaNmYf7jOYK',
        },
      }
    );
  }
}

export default new SelfAssessmentService();
