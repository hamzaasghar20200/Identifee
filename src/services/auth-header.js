import { getIdfToken } from '../utils/Utils';
export default function authHeader() {
  let user = JSON.parse(getIdfToken());
  if (!user) {
    user = JSON.parse(sessionStorage.getItem('idftoken-public'));
  }

  if (user && user.access_token) {
    return { Authorization: 'Bearer ' + user.access_token };
  } else {
    return {};
  }
}
