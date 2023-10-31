import React from 'react';
import { AvatarLogo } from '../commons/AvatarLogo';

const CategoryPartnerLogo = ({
  categoryInfo,
  imageStyle = 'ml-2',
  width = '90px',
}) => {
  return (
    <>
      <AvatarLogo
        name={categoryInfo?.name}
        avatarId={categoryInfo?.logo}
        imageStyle={imageStyle}
        width={width}
      />
    </>
  );
};

export default CategoryPartnerLogo;
