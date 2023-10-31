export const getClientPortalOrganization = () => {
  return JSON.parse(sessionStorage.getItem('organizationObj'));
};

export const getClientPortalToken = () => {
  return JSON.parse(sessionStorage.getItem('tokenPayload'));
};
