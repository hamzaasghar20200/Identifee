import React from 'react';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const DefaultAvatar = ({
  active,
  classModifiers,
  defaultSize = 'sm',
  sizeIcon = 'avatar-light',
  type,
  style,
  initials,
}) => {
  const renderAvatar = () => {
    return (
      <>
        {initials && type === 'contact' ? (
          <span>
            {(initials?.first_name || initials?.firstName)?.charAt(0)}
            {(initials?.last_name || initials?.lastName)?.charAt(0)}
          </span>
        ) : (
          <i
            className={`material-icons-outlined d-flex align-items-center ${
              sizeIcon || `avatar-icon-font-size-${defaultSize}`
            }`}
          >
            {type === 'contact' ? <AccountCircleIcon /> : 'business'}
          </i>
        )}
      </>
    );
  };

  return (
    <div
      style={style}
      className={`avatar avatar-${defaultSize} avatar-circle ${classModifiers}`}
    >
      <span
        className={`avatar-initials border ${
          sizeIcon || 'avatar-icon-font-size'
        }`}
      >
        {renderAvatar()}
      </span>
      {active && (
        <span
          className={`avatar-status avatar-${defaultSize}-status avatar-status-success`}
        />
      )}
    </div>
  );
};

DefaultAvatar.defaultProps = {
  user: {},
  active: false,
  classModifiers: '',
  type: 'contact',
};

export default DefaultAvatar;
