import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Col } from 'reactstrap';

import OrganizationCard from '../../organizationProfile/overview/OrganizationCard';
import SimpleModal from '../../modal/SimpleModal';
import DropdownSearch from '../../DropdownSearch';
import contactService from '../../../services/contact.service';
import organizationService from '../../../services/organization.service';
import stringConstants from '../../../utils/stringConstants.json';
import routes from '../../../utils/routes.json';
import { isPermissionAllowed } from '../../../utils/Utils';

const constants = stringConstants.deals.contacts.profile;

const Organization = ({
  moduleMap,
  data,
  contactId,
  getProfileInfo,
  isPrincipalOwner,
}) => {
  const [openModal, setOpenModal] = useState(false);
  const [allOrganizations, setAllOrganizations] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState({});

  const handleCloseModal = () => {
    setSelectedOrg({});
    setOpenModal(false);
  };

  const getOrganizations = ({ search, limit = 5 }) => {
    setSelectedOrg({});
    organizationService
      .getOrganizations({ search }, { limit })
      .then((res) => {
        setAllOrganizations(res.data.organizations);
      })
      .catch((err) => {
        console.log(err.message);
      });
  };

  const handleSubmit = () => {
    contactService
      .linkOrganization(contactId, selectedOrg.id)
      .then(() => {
        setOpenModal(false);
        getProfileInfo();
      })
      .catch((err) => {
        console.log(err.message);
      });
  };

  useEffect(() => {
    getOrganizations({ search: '' });
  }, []);

  return (
    <div className="card mt-3">
      <div className="card-header p-3">
        {data ? (
          <Link to={`${routes.companies}/${data.id}/organization/profile`}>
            <h4 className="card-title">{moduleMap}</h4>
          </Link>
        ) : (
          <h4 className="card-title">{moduleMap}</h4>
        )}
      </div>

      <div className="card-body toggle-org py-2 px-0">
        {data ? (
          <OrganizationCard data={data} peopleContact={true} />
        ) : (
          <div>
            <SimpleModal
              onHandleCloseModal={handleCloseModal}
              open={openModal}
              buttonLabel={`Link this ${moduleMap}`}
              buttonsDisabled={!selectedOrg.id}
              handleSubmit={handleSubmit}
            >
              <DropdownSearch
                title="Search organization"
                data={allOrganizations}
                customTitle="name"
                onChange={(event) => {
                  if (event) {
                    const { value } = event.target;
                    getOrganizations({ search: value, limit: 10 });
                  }
                }}
                onHandleSelect={(item) => {
                  setSelectedOrg(item);
                }}
              />
            </SimpleModal>
            <Col className="d-flex justify-content-center flex-column align-items-center my-4">
              <p>
                {constants.noLinkedOrganization.replace(/company/g, moduleMap)}
              </p>
              {isPermissionAllowed('contacts', 'create') &&
                isPrincipalOwner && (
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      setOpenModal(true);
                    }}
                  >
                    <span className="material-icons-outlined mr-1">add</span>
                    {constants.linkOrganizationButton.replace(
                      /company/g,
                      moduleMap
                    )}
                  </button>
                )}
            </Col>
          </div>
        )}
      </div>
    </div>
  );
};

export default Organization;
