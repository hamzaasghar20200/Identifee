import authHeader from './auth-header';
import BaseRequestService from './baseRequest.service';

const API_URL = process.env.REACT_APP_API_URL;

export default class BulkImportService extends BaseRequestService {
  async bulkImport(formData, type, options = {}) {
    let url = `${API_URL}/api/${type}/import`;
    if (type === 'people') {
      url = `${API_URL}/api/contacts/import`;
    }
    return await this.post(url, formData, {
      headers: authHeader(),
      params: options,
    });
  }
}
