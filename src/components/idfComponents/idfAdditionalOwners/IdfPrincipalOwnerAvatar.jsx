import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { PRINCIPAL_OWNER_LABEL } from '../../../utils/constants';

import Avatar from '../../Avatar';
import './IdfAdditionalOwners.css';

const IdfPrincipalOwnerAvatar = ({
  sizeIcon,
  mainOwner,
  defaultSize,
  className,
  isClickable = true,
}) => {
  return (
    <div className={`d-flex main-owner ${className}`}>
      <OverlayTrigger
        key={mainOwner?.id}
        placement="bottom"
        overlay={
          <Tooltip
            id={`tooltip-${mainOwner?.id}`}
            className={`tooltip-profile font-weight-bold`}
          >
            <p>{`${mainOwner?.first_name} ${mainOwner?.last_name}`}</p>
            <p>{PRINCIPAL_OWNER_LABEL}</p>
          </Tooltip>
        }
      >
        <div className="border-0">
          {' '}
          {isClickable ? (
            <span className="d-flex">
              <Avatar
                classModifiers="avatar-md"
                user={mainOwner}
                defaultSize={defaultSize}
                sizeIcon={sizeIcon}
              />
            </span>
          ) : (
            <Link className="d-flex cursor-default">
              <Avatar
                classModifiers="avatar-md"
                user={mainOwner}
                defaultSize={defaultSize}
                sizeIcon={sizeIcon}
              />
            </Link>
          )}
        </div>
      </OverlayTrigger>
    </div>
  );
};

export default IdfPrincipalOwnerAvatar;
