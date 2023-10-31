import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

import authHeader from './auth-header';

const API_URL = process.env.REACT_APP_API_URL;
const FEED_URL = API_URL + '/api/feed';
const NOTE_URL = API_URL + '/api/notes';

class FeedService {
  getActivityFeed(
    { contactId, organizationId, dealId, userId, ...restProps },
    { page = 1, limit = 15 }
  ) {
    return axios
      .get(`${FEED_URL}`, {
        headers: authHeader(),
        params: {
          contactId,
          organizationId,
          dealId,
          userId,
          limit,
          page,
          ...restProps,
        },
      })
      .then((response) => {
        return response.data;
      });
  }

  createNote(
    name,
    note,
    contactId = null,
    organizationId = null,
    dealId = null,
    activityId = null,
    userTenantId = null,
    assigned_user_id = null
  ) {
    return axios
      .post(
        `${API_URL}/api/notes`,
        {
          name,
          note,
          contact_id: contactId,
          organization_id: organizationId,
          activity_id: activityId,
          deal_id: dealId,
          tenant_id: userTenantId,
          assigned_user_id,
          modified_user_id: assigned_user_id,
          created_by: assigned_user_id,
        },
        { headers: authHeader() }
      )
      .then((response) => {
        return response.data;
      });
  }

  getNote(
    { activityId, contactId, organizationId, dealId, ...restProps },
    { page = 1, limit = 15 }
  ) {
    return axios
      .get(`${API_URL}/api/notes`, {
        params: {
          page,
          limit,
          contact_id: contactId,
          organization_id: organizationId,
          activity_id: activityId,
          deal_id: dealId,
          ...restProps,
        },
        headers: authHeader(),
      })
      .then((response) => {
        return response.data;
      });
  }

  updateNote(feedId, noteId = uuidv4(), note) {
    return axios
      .put(
        `${FEED_URL}/${feedId}/note/${noteId}`,
        { note },
        { headers: authHeader() }
      )
      .then((response) => {
        return response.data;
      });
  }

  getFiles(
    { contactId, organizationId, dealId, activityId, type },
    { page = 1, limit = 10 }
  ) {
    const params = {
      contact_id: contactId,
      organization_id: organizationId,
      deal_id: dealId,
      activity_id: activityId,
      page,
      limit,
    };

    if (type) {
      params.belongs_to = type;
    }

    return axios
      .get(`${FEED_URL}/file`, {
        headers: authHeader(),
        params,
      })
      .then((response) => {
        return response.data;
      });
  }

  addNotesComment(
    name,
    note,
    assigned_user_id,
    feedId,
    { activityId, contactId, organizationId, dealId, ...restProps }
  ) {
    return axios
      .post(
        `${NOTE_URL}`,
        {
          organization_id: organizationId,
          deal_id: dealId,
          contact_id: contactId,
          assigned_user_id,
          activity_id: activityId,
          name,
          note,
          parentId: feedId,
        },
        {
          headers: authHeader(),
        }
      )
      .then((response) => {
        return response.data;
      });
  }

  updateNotesComment(
    id,
    name,
    note,
    assigned_user_id,
    feedId,
    { activityId, contactId, organizationId, dealId, ...restProps }
  ) {
    return axios
      .put(
        `${NOTE_URL}/${id}`,
        {
          organization_id: organizationId,
          deal_id: dealId,
          contact_id: contactId,
          assigned_user_id,
          activity_id: activityId,
          name,
          note,
          parentId: feedId,
        },
        {
          headers: authHeader(),
        }
      )
      .then((response) => {
        return response.data;
      });
  }

  deleteNote(id) {
    return axios
      .delete(`${NOTE_URL}/${id}`, {
        headers: authHeader(),
      })
      .then((response) => {
        return response.data;
      })
      .catch((e) => console.log(e));
  }

  updateActivity({ ...props }) {
    return axios
      .put(
        `${FEED_URL}/activity`,
        { ...props },
        {
          headers: authHeader(),
        }
      )
      .then((response) => {
        return response.data;
      });
  }
}

export default new FeedService();
