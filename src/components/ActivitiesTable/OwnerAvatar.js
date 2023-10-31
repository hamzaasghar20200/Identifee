import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import Avatar from '../Avatar';
import React from 'react';
const tooltipCreatedByText = (profile) => {
  if (profile.external) {
    return <p>{`${profile?.createdBy.email}`}</p>;
  }
  return <p>{profile.createdBy.name}</p>;
};

const tooltipText = (profile) => {
  if (profile.external) {
    return <p>{`${profile.email}`}</p>;
  }
  return (
    <p>
      {profile.first_name} {profile.last_name}
    </p>
  );
};

const OwnerAvatar = ({ item, isMultiple }) => {
  return (
    <div
      className="align-items-end more-owners cursor-default gap-1 align-items-center"
      onClick={(e) => {
        e?.preventDefault();
        e?.stopPropagation();
      }}
    >
      <>
        <OverlayTrigger
          placement="bottom"
          overlay={
            <Tooltip
              id={`tooltip-${item?.id}`}
              className={`tooltip-profile font-weight-bold`}
            >
              {isMultiple ? tooltipText(item) : tooltipCreatedByText(item)}
            </Tooltip>
          }
        >
          <div>
            {' '}
            <span className="d-flex">
              <Avatar
                user={isMultiple ? item : item.createdBy}
                defaultSize={'xs'}
                sizeIcon={'avatar-light xs'}
              />
            </span>
          </div>
        </OverlayTrigger>
      </>
    </div>
  );
};

export default OwnerAvatar;
