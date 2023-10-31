import React, { useContext } from 'react';
import Avatar from '../Avatar';
import routes from '../../utils/routes.json';
import MaterialIcon from '../commons/MaterialIcon';
import { formatPhoneNumber } from '../../utils/Utils';
import ContactClickable from '../commons/ContactClickable';
import usePermission from '../../hooks/usePermission';
import { useHistory } from 'react-router-dom';
import { ShortDescription } from '../ShortDescription';
import IdfTooltip from '../idfComponents/idfTooltip';
import { AlertMessageContext } from '../../contexts/AlertMessageContext';

const ContactItem = ({ icon, text }) => {
  const { setSuccessMessage } = useContext(AlertMessageContext);
  const handleCopy = (e, content) => {
    e.preventDefault();
    navigator.clipboard.writeText(content);
    setSuccessMessage('Text copied!');
  };

  return (
    <>
      <p className="m-0 px-0 hover-actions lead fs-7 d-flex align-items-center gap-1">
        <div
          className="bg-gray-300 rounded-circle d-flex align-items-center justify-content-center text-center"
          style={{ height: 18, width: 18 }}
        >
          <MaterialIcon icon={icon} clazz="font-size-xs" />
        </div>
        <p className="mb-0 text-truncate" style={{ maxWidth: 200 }}>
          {text}
        </p>
        {(icon === 'phone' || icon === 'mail') && (
          <IdfTooltip text="Copy">
            <a
              className="icon-hover-bg cursor-pointer"
              onClick={(e) => handleCopy(e, text)}
            >
              <MaterialIcon icon="copy" clazz="action-items" />{' '}
            </a>
          </IdfTooltip>
        )}
      </p>
    </>
  );
};

// this component is specific to show profile like in figma design when hover/click user-name in Followers/Additional Owners sections
export default function PopoverProfile({ user, Route, contact, orgName }) {
  const { isAllowed } = usePermission('contacts', 'view');
  const history = useHistory();
  return (
    <div className="p-2">
      <div className="profile-popover d-flex" style={{ minWidth: 250 }}>
        <div
          className="avatar avatar-sm avatar-circle mr-3"
          onClick={() => {
            isAllowed && history.push(Route);
          }}
        >
          <Avatar user={user} />
        </div>
        <div className="pr-2 flex-grow-1">
          <h5 className="mb-0">
            <ContactClickable
              user={user}
              route={`${routes.contacts}/${user.id}/profile`}
            />
          </h5>
          {user.title && (
            <p className="mb-0 font-weight-normal fs-8">{user.title}</p>
          )}
          <p className="text-muted font-weight-normal fs-7 text-nowrap mb-0">
            <ShortDescription content={user.description || ''} limit={30} />
          </p>
          {(user.email || user.email_work) && (
            <ContactItem icon="mail" text={user.email || user.email_work} />
          )}
          {user.phone_work && (
            <ContactItem
              icon="phone"
              text={formatPhoneNumber(user.phone_work)}
            />
          )}
          {contact && orgName && <ContactItem icon="business" text={orgName} />}
        </div>
      </div>
    </div>
  );
}
