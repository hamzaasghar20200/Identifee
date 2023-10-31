import axios from 'axios';
import authHeader from '../../services/auth-header';

export default class UploadAdapter {
  constructor(loader, url, fileUploaded) {
    this.url = url;
    this.loader = loader;
    this.fileUploaded = fileUploaded;
    this.loader.file.then((pic) => (this.file = pic));

    this.upload();
  }

  async upload() {
    const fd = new FormData();
    if (this.file) {
      fd.append('image', this.file);

      const response = await axios.post(this.url, fd, {
        headers: authHeader(),
        onUploadProgress: (e) => {
          console.log(Math.round((e.loaded / e.total) * 100) + ' %');
        },
      });
      const { data } = response;
      this.fileUploaded(data?.data);
      return { default: data?.url };
    }
  }
}
