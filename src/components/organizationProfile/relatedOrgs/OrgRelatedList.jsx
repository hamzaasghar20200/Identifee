import React, { useState } from 'react';
import { Badge } from 'reactstrap';

import ModalConfirmDefault from '../../modal/ModalConfirmDefault';
import stringConstants from '../../../utils/stringConstants.json';
import ProfileCardItem from '../../peopleProfile/ProfileCardItem';
import { capitalize, CompanyRelated } from '../../../utils/Utils';

const constants = stringConstants.deals.organizations;

const OrgRelatedList = ({
  item,
  handleRemove,
  isPrincipalOwner,
  mainOwner,
}) => {
  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const removeItem = () => {
    setOpenModal(true);
  };

  const handleConfirm = async () => {
    setLoading(true);
    await handleRemove(item.id);
    setLoading(false);
    setOpenModal(false);
  };

  const name = item?.related_organization_name;
  // lol @ bigin naming conventions....
  const friendlyCalculatedType =
    item?.calculated_type === 'sibling'
      ? 'sister'
      : item?.calculated_type === 'child'
      ? 'daughter'
      : item?.calculated_type;

  return (
    <div className="mb-2">
      <ModalConfirmDefault
        loading={loading}
        open={openModal}
        onHandleConfirm={handleConfirm}
        onHandleClose={() => setOpenModal(false)}
        textBody={`Are you sure you want to remove ${name} as ${
          CompanyRelated[capitalize(item?.calculated_type)]?.label
        }?`}
        labelButtonConfirm={constants.acceptConfirmation}
        iconButtonConfirm="delete"
        colorButtonConfirm="outline-danger"
      />
      <div className="media align-items-center justify-content-between">
        <div className="mr-auto">
          <ProfileCardItem
            user={item}
            mainOwner={mainOwner}
            size="xs"
            org={true}
          />
        </div>
        <div className="ml-auto">
          {item?.calculated_type && (
            <Badge
              id={item.id}
              style={{
                fontSize: '11px',
                borderRadius: 40,
                backgroundColor: '#e6e6e6',
                color: 'black',
              }}
              className="text-uppercase"
            >
              {CompanyRelated[capitalize(item?.calculated_type)]?.label}
            </Badge>
          )}
        </div>
        {handleRemove && (
          <div
            style={{ width: '10%' }}
            className={'d-flex justify-content-center'}
          >
            {friendlyCalculatedType !== 'sister' &&
              handleRemove &&
              isPrincipalOwner && (
                <a
                  className="cursor-pointer btn-icon btn btn-icon-sm icon-hover-bg"
                  onClick={removeItem}
                >
                  <i className="material-icons-outlined">delete</i>
                </a>
              )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrgRelatedList;
