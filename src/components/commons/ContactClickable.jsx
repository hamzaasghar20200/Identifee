import { Link } from 'react-router-dom';
import React from 'react';
import usePermission from '../../hooks/usePermission';
import { clearMenuSelection } from '../../utils/Utils';

const ContactClickable = ({ user, route }) => {
  const { isAllowed } = usePermission('contacts', 'view');

  return (
    <>
      {isAllowed ? (
        <Link
          to={route}
          onClick={(e) => {
            clearMenuSelection(e);
          }}
          className="text-block popover-link"
        >
          {user.first_name} {user.last_name}
        </Link>
      ) : (
        <a
          href=""
          className="cursor-default"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          {user.first_name} {user.last_name}
        </a>
      )}
    </>
  );
};

export default ContactClickable;
