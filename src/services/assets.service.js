import axios from 'axios';
import authHeader from './auth-header';
import FileDownload from 'js-file-download';

const API_URL = process.env.REACT_APP_API_URL + '/api/assets';

class AssetsService {
  async downloadFile(id, fileName) {
    return axios
      .get(`${API_URL}/${id}`, {
        headers: {
          ...authHeader(),
          'cache-control': 'no-cache',
        },
        responseType: 'blob',
      })
      .then((response) => {
        if (response?.response?.status === 403) {
          throw new Error(response);
        }

        FileDownload(response.data, fileName);
      });
  }

  async openFile(id) {
    return axios
      .get(`${API_URL}/${id}`, {
        headers: {
          ...authHeader(),
          'cache-control': 'no-cache',
        },
        responseType: 'blob',
      })
      .then((response) => {
        if (response?.response?.status === 403) {
          throw new Error(response);
        }
        const file = new Blob([response.data], { type: response.data.type });
        const fileUrl = URL.createObjectURL(file);
        window.open(fileUrl, '_blank');
      });
  }
}

export default new AssetsService();
