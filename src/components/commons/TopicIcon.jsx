import MaterialIcon from './MaterialIcon';
import React from 'react';

const TopicIcon = ({ icon, iconBg, iconStyle, iconClasses, filled = true }) => {
  // TODO: for time being light bg and dark color is the theme so hardcoding it here, will refactor later
  return (
    <span
      className={`d-flex justify-content-center align-items-center rounded-circle bg-primary-soft`}
      style={iconStyle}
    >
      <MaterialIcon
        icon={icon}
        filled={filled}
        clazz={`${iconClasses} text-primary`}
      />
    </span>
  );
};

export default TopicIcon;
