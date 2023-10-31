import React, { useState, useEffect } from 'react';

import SimpleModal from '../../modal/SimpleModal';
import DropdownSearch from '../../DropdownSearch';
import OrgRelatedList from './OrgRelatedList';
import organizationService from '../../../services/organization.service';
import stringConstants from '../../../utils/stringConstants.json';
import AutoComplete from '../../AutoComplete';
import useIsTenant from '../../../hooks/useIsTenant';
import { CompanyRelations } from '../../../utils/Utils';

const constants = stringConstants.deals.organizations.profile;

const AddRelated = ({
  moduleMap,
  organizationId,
  getRelated,
  showAddRelatedModal,
  setShowAddRelatedModal,
  children,
  onHandleShowAlertSuccess,
  onHandleShowAlertFailed,
  handleRemove,
  allRelatedOrgs,
  isPrincipalOwner,
  mainOwner,
}) => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedRelation, setSelectedRelation] = useState(null);
  const [filter, setFilter] = useState('');
  const [data, setData] = useState([]);
  const relations = [...CompanyRelations];

  const searchRelated = async () => {
    try {
      const response = await organizationService.getOrganizations(
        { deleted: false, search: filter },
        { page: 1, limit: 15 }
      );
      const { organizations } = response?.data;
      const filteredOrgs = organizations
        .filter((o) => !!o.name)
        .filter((d) => {
          return filter.toLowerCase() === '' || filter.toLowerCase() === null
            ? d
            : d.name.toLowerCase().includes(filter.toLowerCase());
        });
      setData(filteredOrgs);
    } catch (error) {
      console.log(error);
    }
  };

  const handleSelect = (item) => {
    setSelectedItem(item.id);
  };
  const handleSelectRelation = (item) => {
    setSelectedRelation(item.name);
  };

  const handleSubmit = async () => {
    try {
      let type = selectedRelation.toLowerCase();
      let org_id = '';
      let parent_id = '';
      if (type === 'daughter') {
        parent_id = organizationId;
        org_id = selectedItem;
        type = 'parent';
      } else {
        org_id = organizationId;
        parent_id = selectedItem;
      }
      await organizationService.addRelation(org_id, parent_id, type);

      setShowAddRelatedModal(false);
      onHandleShowAlertSuccess(constants.messageSuccessSaveRelation);
    } catch (error) {
      onHandleShowAlertFailed(constants.messageFailedSaveRelation);
    }
  };

  const handleCloseAddRelatedModal = () => {
    setShowAddRelatedModal(false);
  };

  useEffect(() => {
    if (showAddRelatedModal) {
      searchRelated();
    } else {
      setSelectedItem(null);
      getRelated();
      setFilter('');
    }
  }, [showAddRelatedModal]);

  useEffect(() => {
    if (filter) {
      searchRelated();
    }
  }, [filter]);

  return (
    <>
      <SimpleModal
        onHandleCloseModal={handleCloseAddRelatedModal}
        open={showAddRelatedModal}
        modalTitle="Add Relation"
        buttonLabel={'Add Relation'}
        buttonsDisabled={!selectedItem}
        handleSubmit={handleSubmit}
      >
        <div className="pb-4 media">
          <div style={{ width: '70%' }}>
            <AutoComplete
              id="addRelatedOrganization"
              placeholder={`Search for ${
                useIsTenant().isSynovusBank ? 'insight' : `${moduleMap}`
              }`}
              name="addRelatedOrganization"
              showAvatar={false}
              loading={false}
              onChange={(e) => {
                setFilter(e?.target?.value);
              }}
              data={data}
              showIcon={false}
              onHandleSelect={(item) => {
                handleSelect(item);
              }}
              customKey="name"
            />
          </div>
          <div style={{ width: '30%' }}>
            <DropdownSearch
              title="Add Relation"
              search={filter}
              customTitle={'label'}
              onChange={(e) => {
                setFilter(e?.target?.value);
              }}
              data={relations}
              onHandleSelect={(item) => {
                handleSelectRelation(item);
              }}
              showAvatar={false}
              hideSearchBar={true}
            />
          </div>
        </div>
        {allRelatedOrgs?.map((item) => (
          <OrgRelatedList
            item={item}
            key={item.id}
            handleRemove={handleRemove.bind(null, item)}
            isPrincipalOwner={isPrincipalOwner}
            mainOwner={mainOwner}
          />
        ))}
      </SimpleModal>
      {children}
    </>
  );
};

export default AddRelated;
