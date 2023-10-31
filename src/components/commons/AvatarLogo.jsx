import { useEffect, useState } from 'react';
import avatarService from '../../services/avatar.service';

export const AvatarLogo = ({
  name,
  avatarId,
  imageStyle = 'ml-2',
  width = '90px',
}) => {
  const [avatarLogo, setAvatarLogo] = useState(null);

  useEffect(() => {
    const getAvatarLogo = async () => {
      let logo = null;

      if (avatarId) {
        logo = await avatarService.getAvatarMemo(avatarId);
      }
      setAvatarLogo(logo);
    };

    getAvatarLogo();
  }, [avatarId]);

  return (
    <>
      {avatarLogo ? (
        <img
          className={imageStyle}
          style={{ objectFit: 'contain', width }}
          src={avatarLogo?.url}
          alt={name}
        />
      ) : (
        ''
      )}
    </>
  );
};
