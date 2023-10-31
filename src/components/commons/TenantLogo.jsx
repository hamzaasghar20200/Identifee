import React from 'react';
import { AvatarLogo } from './AvatarLogo';

const TenantLogo = ({ tenant, imageStyle = 'ml-2', width = '90px' }) => {
  return (
    <>
      <AvatarLogo
        name={tenant?.name}
        avatarId={tenant?.logo}
        imageStyle={imageStyle}
        width={width}
      />
    </>
  );
};

export default TenantLogo;
