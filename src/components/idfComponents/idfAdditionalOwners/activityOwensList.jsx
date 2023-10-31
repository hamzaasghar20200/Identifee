import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import Avatar from '../../Avatar';
import AddOwnerActivity from './IdfAddOwnerActivity';
import { useState, useEffect } from 'react';
import TooltipComponent from '../../lesson/Tooltip';
import { isPermissionAllowed } from '../../../utils/Utils';

const ActivityOwensList = ({
  property,
  maxUsers = 5,
  defaultSize,
  serviceId,
  sizeIcon,
  mainOwners,
  setUsersData,
  setRefreshRecentFiles,
  allowDelete = false,
  isClickable = true,
}) => {
  const [openModal, setOpenModal] = useState(false);
  const [users, setUsers] = useState([]);
  const onAddPerson = (event) => {
    event.stopPropagation();
    setOpenModal(true);
  };
  useEffect(() => {
    if (users?.length === 0) {
      setUsers(mainOwners);
    } else {
      setUsers(users);
    }
  }, [mainOwners, users]);
  useEffect(() => {
    if (users?.length === 1 && mainOwners?.length > 0) {
      setUsers(mainOwners);
    }
  }, [mainOwners]);
  const tooltipText = (profile) => {
    if (profile.external) {
      return <p>{`${profile.email}`}</p>;
    }
    const user = property ? profile[property] : profile;
    return (
      <>
        <p>
          {user.first_name} {user.last_name}
        </p>
      </>
    );
  };
  const permission = {
    collection: 'activities',
    action: 'create',
  };
  return (
    <div className="align-items-end more-owners gap-1 align-items-center">
      {users?.map((profile, i) =>
        i < maxUsers ? (
          <OverlayTrigger
            key={`${profile[property]?.id || profile?.id} ${i}`}
            placement="bottom"
            overlay={
              <Tooltip
                id={`tooltip-${profile[property]?.id || profile?.id}`}
                className={`tooltip-profile font-weight-bold`}
              >
                {tooltipText(profile)}
              </Tooltip>
            }
          >
            <div>
              {' '}
              {isClickable || allowDelete ? (
                <span className="d-flex">
                  <Avatar
                    user={profile[property] || profile}
                    defaultSize={defaultSize}
                    sizeIcon={sizeIcon}
                  />
                </span>
              ) : (
                <Link className="d-flex cursor-default">
                  <Avatar
                    user={profile[property] || profile}
                    defaultSize={defaultSize}
                    sizeIcon={sizeIcon}
                  />
                </Link>
              )}
            </div>
          </OverlayTrigger>
        ) : null
      )}
      <div className="ml-0">
        {permission?.collection
          ? isPermissionAllowed(permission?.collection, permission.action) && (
              <TooltipComponent title="Add Owner">
                <button
                  type="button"
                  className={`btn btn-icon btn-sm rounded-circle `}
                  style={{ width: '25px', height: '25px' }}
                  onClick={onAddPerson}
                >
                  <i className="material-icons-outlined">add</i>
                </button>
              </TooltipComponent>
            )
          : ''}
      </div>
      <AddOwnerActivity
        serviceId={serviceId}
        openModal={openModal}
        ownerData={users}
        setRefresh={setRefreshRecentFiles}
        setUsersData={setUsersData}
        setOwnerData={setUsers}
        setOpenModal={setOpenModal}
      />
    </div>
  );
};

export default ActivityOwensList;
