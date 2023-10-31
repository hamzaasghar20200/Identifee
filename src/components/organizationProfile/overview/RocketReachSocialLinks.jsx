import React, { useEffect, useState } from 'react';
import linkedin from '../../../assets/svg/linkedin-circle.svg';
import twitter from '../../../assets/svg/twitter.svg';
import facebook from '../../../assets/svg/facebook.svg';
import crunchbase from '../../../assets/png/crunchbase.png';

const SocialLinksImages = {
  linkedin,
  twitter,
  facebook,
  crunchbase,
};

const RocketReachSocialLinks = ({ links }) => {
  const [list, setList] = useState([]);
  useEffect(() => {
    if (links) {
      const newList = [];
      for (const link in links) {
        if (links[link]) {
          if (
            link === 'facebook' ||
            link === 'twitter' ||
            link === 'linkedin' ||
            link === 'crunchbase'
          ) {
            newList.push({
              icon: SocialLinksImages[link],
              url: links[link],
            });
          }
        }
      }
      setList(newList);
    }
  }, [links]);
  return (
    <div className="d-flex align-items-center gap-1 pt-0">
      {list.map((link) => (
        <a
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => {
            e.stopPropagation();
          }}
          href={link.url}
          key={link.url}
          className="links-hover"
        >
          <img
            src={link.icon}
            style={{ width: 24, height: 24 }}
            className="rounded-circle"
          />{' '}
        </a>
      ))}
    </div>
  );
};

export default RocketReachSocialLinks;
