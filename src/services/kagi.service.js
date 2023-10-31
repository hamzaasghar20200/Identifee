import BaseRequestService from './baseRequest.service';

import authHeader from './auth-header';
import { createBlobObject } from '../utils/Utils';
const API_URL = process.env.REACT_APP_API_URL;
const FILES_URL = `${API_URL}/api/files`;
const defaultEngine = 'agnes';
class KagiService extends BaseRequestService {
  async getSummaryOfUrlOrText(data, cancelToken) {
    const response = await this.post(
      `${API_URL}/api/providers/kagi/summarize`,
      { ...data, engine: defaultEngine, cache: true },
      {
        headers: authHeader(),
        cancelToken,
      },
      { fullResponse: true }
    );
    return response?.data;
  }

  async uploadPDFFileAndGetJob(file, summary_type = 'Treasury', cancelToken) {
    const form = new FormData();
    const formBlob = await createBlobObject(file);
    form.append('file', formBlob, file.name);
    form.append('summary_type', summary_type);
    form.append('engine', defaultEngine);
    form.append('cache', 'false');
    return this.post(`${API_URL}/api/files/usingFileSummarize`, form, {
      headers: authHeader(),
      cancelToken,
    });
  }

  getFileSummary(fileId, cancelToken) {
    return this.get(`${FILES_URL}/${fileId}/summaries/active`, {
      headers: authHeader(),
      cancelToken,
    });
  }

  reprocessFile(fileId, summary_type, cancelToken) {
    return this.post(
      `${FILES_URL}/${fileId}/summaries/reprocess`,
      {
        opts: {
          engine: defaultEngine,
          summary_type,
          cache: false,
        },
      },
      {
        headers: authHeader(),
        cancelToken,
      }
    );
  }

  async createFastGPTRequest(data, cancelToken) {
    const response = await this.post(
      `${API_URL}/api/providers/kagi/fastgpt`,
      { ...data, engine: defaultEngine, cache: false, web_search: true },
      {
        headers: authHeader(),
        cancelToken,
      },
      { fullResponse: true }
    );
    return response?.data;
  }
}
export default new KagiService();
