import React, { useEffect, useState } from 'react';
import Avatar from '../Avatar';
import routes from '../../utils/routes.json';
import PopoverWrapper from '../commons/PopoverWrapper';
import PopoverProfile from '../profile/PopoverProfile';
import organizationService from '../../services/organization.service';
import { Link } from 'react-router-dom';
import ContactClickable from '../commons/ContactClickable';

// using this component in left layout on organization/people profile in Contacts/Followers/Additional Owners sections
const ProfileCardItem = ({
  user,
  size = 'sm',
  org = false,
  contact = false,
}) => {
  const [orgName, setOrgName] = useState('');

  const Route = org
    ? `${routes.companies}/${user?.related_organization_id}/organization/profile`
    : `${routes.contacts}/${user.id}/profile`;

  const getOrgById = async (id) => {
    const Org = await organizationService.getOrganizationById(id);
    setOrgName(Org?.name);
  };

  useEffect(() => {
    contact && getOrgById(user?.organization_id);
  }, []);

  return (
    user && (
      <div
        key={user?.id}
        style={{ height: 32 }}
        className={`list-group-item py-0 border-0 ${org ? 'px-0 py-0' : ''}`}
      >
        <div className="media align-items-center py-0">
          <div className={`media-body ${org ? 'px-0 py-1' : 'px-3 py-1'}`}>
            <h5 className="mb-0 ml-0">
              {org ? (
                <Link to={Route} className="text-block popover-link">
                  <div className="d-flex align-items-center">
                    <span>{user?.related_organization_name}</span>
                  </div>
                </Link>
              ) : (
                <PopoverWrapper
                  applyHeight="h-0"
                  template={
                    <PopoverProfile
                      Route={Route}
                      user={user}
                      contact={contact}
                      orgName={orgName}
                    />
                  }
                >
                  <div className="row">
                    <div className="mr-2">
                      <Avatar
                        user={user}
                        type={user.first_name ? 'contact' : 'business'}
                        defaultSize={size}
                      />
                    </div>
                    <ContactClickable user={user} route={Route} />
                  </div>
                </PopoverWrapper>
              )}
            </h5>
          </div>
        </div>
      </div>
    )
  );
};

export default ProfileCardItem;
