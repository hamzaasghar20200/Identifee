import React from 'react';

import SiteSettingsForm from '../components/siteSettings/SiteSettingsForm';

const SiteSettings = () => {
  return (
    <>
      <div className="row justify-content-center">
        <div className="col-lg-9">
          <SiteSettingsForm />
        </div>
      </div>
    </>
  );
};

export default SiteSettings;
