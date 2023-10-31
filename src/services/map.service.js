import axios from 'axios';

import authHeader from './auth-header';

const API_URL =
  process.env.REACT_APP_API_URL +
  '/api/providers/google/maps/place/autocomplete';

class MapService {
  async getGoogleAddress(address) {
    const response = await axios.get(API_URL, {
      params: {
        input: address,
      },
      headers: authHeader(),
    });
    const locations = response.data.predictions.map((prediction) => ({
      ...prediction,
      name: prediction.description,
    }));

    return locations;
  }
}

export default new MapService();
