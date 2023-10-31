import authHeader from './auth-header';
import BaseRequestService from './baseRequest.service';

const API_URL = process.env.REACT_APP_API_URL;
const JOBS_URL = `${API_URL}/api/jobs`;

class JobService extends BaseRequestService {
  checkJobStatus(jobId, signal) {
    return this.get(`${JOBS_URL}/${jobId}`, {
      headers: authHeader(),
      signal,
    });
  }
}

export default new JobService();
