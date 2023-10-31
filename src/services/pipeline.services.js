import authHeader from './auth-header';
import BaseRequestService from './baseRequest.service';

const API_URL = process.env.REACT_APP_API_URL;
const PIPELINES_URL = API_URL + '/api/pipelines';

class PipelineService extends BaseRequestService {
  async getPipelines(page = 1, limit = 20) {
    const response = await this.get(
      PIPELINES_URL,
      {
        headers: authHeader(),
        params: { page, limit },
      },
      { fullResponse: true }
    );

    return response?.data;
  }

  getPipelineTeam(pipelineId) {
    return this.get(`${PIPELINES_URL}/${pipelineId}/teams`, {
      headers: authHeader(),
    });
  }

  getPipelineSummary(pipelineId) {
    return this.get(`${PIPELINES_URL}/${pipelineId}/summary`, {
      headers: authHeader(),
    });
  }

  setPipelineTeam(teamIds) {
    return this.post(`${API_URL}/api/pipelineTeams`, teamIds, {
      headers: authHeader(),
    });
  }

  deletePipelineTeam(pipelineId, teamId) {
    return this.delete(`${PIPELINES_URL}/${pipelineId}/team/${teamId}`, {
      headers: authHeader(),
    });
  }

  createPipeline(data) {
    return this.post(PIPELINES_URL, data, {
      headers: authHeader(),
    });
  }

  updatePipeline(pipelineId, data) {
    return this.put(`${PIPELINES_URL}/${pipelineId}`, data, {
      headers: authHeader(),
    });
  }

  deletePipeline(pipelineId, transferId) {
    return this.delete(`${PIPELINES_URL}/${pipelineId}`, {
      headers: authHeader(),
      params: { transferId },
    });
  }

  setDefaultPipeline(pipelineId) {
    return this.put(
      `${PIPELINES_URL}/${pipelineId}/default`,
      {},
      {
        headers: authHeader(),
      }
    );
  }

  getPipelineDeals(pipelineId, page = 1, limit = 10, filter = {}) {
    return this.get(`${PIPELINES_URL}/${pipelineId}/deals`, {
      headers: authHeader(),
      params: {
        page,
        limit,
        ...filter,
      },
    });
  }

  getPipelineDealsSummary(pipelineId, filter = {}) {
    return this.get(`${PIPELINES_URL}/${pipelineId}/summary`, {
      headers: authHeader(),
      params: {
        ...filter,
      },
    });
  }
}

export default new PipelineService();
