import React from 'react';

// generic component to show material/google icons wherever we want to use
const MaterialIcon = ({ icon, clazz, filled, symbols, twoTone, ...rest }) => {
  return (
    <i
      {...rest}
      className={`${
        filled
          ? 'material-icons'
          : symbols
          ? 'material-symbols-outlined'
          : twoTone
          ? 'material-icons-two-tone'
          : 'material-icons-outlined'
      } ${clazz}`}
    >
      {icon}
    </i>
  );
};

export default MaterialIcon;
