import React, { useState } from 'react';
import { Image } from 'react-bootstrap';
import ProfileIcon from './ProfileIcon';
import TooltipComponent from '../lesson/Tooltip';

const ProfilePicOrFallbackAvatar = ({ prospect, style }) => {
  const [fallbackImage, setFallbackImage] = useState('');

  const handleImageLoad = (el) => {
    try {
      const { src } = el.target;
      if (src) {
        // rocket reach sending these paths 404, so filtering out them
        if (
          src.includes('encrypted-') ||
          src.includes('https://media.licdn.com/mpr/mpr/shrinknp_200_200')
        ) {
          setFallbackImage('default_icon');
        }
      } else {
        setFallbackImage('default_icon');
      }
    } catch (e) {
      setFallbackImage('default_icon');
    }
  };

  const handleImageLoadError = (el) => {
    el.onerror = null; // prevents looping
    setFallbackImage('default_icon');
  };

  return (
    <>
      {!fallbackImage && (
        <>
          {prospect.profile_pic || prospect.logo_url ? (
            <TooltipComponent title={prospect?.full_name || prospect.name}>
              <Image
                src={prospect.profile_pic || prospect.logo_url}
                onLoad={(el) => handleImageLoad(el)}
                onError={(el) => handleImageLoadError(el)}
                className="rounded-circle"
                style={{ ...style, objectFit: 'contain' }}
              />
            </TooltipComponent>
          ) : (
            <ProfileIcon
              prospect={prospect}
              defaultSize={style.width === 80 ? 'xl' : 'lg'}
              sizeIcon={style.width === 80 ? 'fs-1' : 'fs-3'}
            />
          )}
        </>
      )}
      {fallbackImage && (
        <ProfileIcon
          prospect={prospect}
          defaultSize={style.width === 80 ? 'xl' : 'lg'}
          sizeIcon={style.width === 80 ? 'fs-1' : 'fs-3'}
        />
      )}
    </>
  );
};

export default ProfilePicOrFallbackAvatar;
