import React, { useEffect, useState } from 'react';
import { Modal, ModalBody, ModalHeader } from 'reactstrap';

import Pagination from '../Pagination';
import feedService from '../../services/feed.service';
import ActivityFile from '../peopleProfile/contentFeed/ActivityFile';
import ButtonFilterDropdown from '../commons/ButtonFilterDropdown';

const ActivityFilesModal = ({
  showModal,
  setShowModal,
  contactId,
  organizationId,
  setRefreshRecentFiles,
  refreshRecentFiles,
  activityId,
  publicPage,
  isOwner,
  fromOrganization,
}) => {
  const [pagination, setPagination] = useState({ page: 1, limit: 5 });
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [uploaders] = useState([
    { key: 0, name: 'All Files', type: 'allfiles' },
    { key: 1, name: 'Company', type: 'company' },
    { key: 2, name: 'Contact', type: 'contact' },
    { key: 3, name: 'Client Portal', type: 'client' },
  ]);
  const [filter, setFilter] = useState('');

  const getFiles = async () => {
    const result = await feedService.getFiles(
      { contactId, organizationId, activityId },
      pagination
    );

    setFilteredFiles(result?.files);
    setPagination(result.pagination);
  };

  const getFilteredFiles = async (val) => {
    let type = '';
    if (val === 'company' || val === 'contact' || val === 'client') {
      type = val;
    }

    const res = await feedService.getFiles(
      { organizationId, type },
      pagination
    );
    setFilteredFiles(res?.files);
    setPagination(res?.pagination);
  };

  const ApplyFilter = async (e, obj) => {
    setFilter(obj);
    getFilteredFiles(obj.type);
  };

  const changePage = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  useEffect(() => {
    if (showModal || refreshRecentFiles || fromOrganization) {
      getFiles();
    }
  }, [pagination.page, showModal, refreshRecentFiles]);

  const closeBtn = (
    <button
      className="close"
      style={{ fontSize: '30px' }}
      onClick={() => {
        setShowModal(false);
      }}
    >
      &times;
    </button>
  );

  return (
    <Modal isOpen={showModal} fade={false}>
      <ModalHeader tag="h3" close={closeBtn}>
        All files
      </ModalHeader>
      <ModalBody>
        <div className="mt-1 border-bottom media">
          <h5 className="mb-3 mt-2">{`${
            filteredFiles?.length || 0
          } files uploaded`}</h5>
          <div className="ml-auto mr-0 mb-1">
            {fromOrganization ? (
              <ButtonFilterDropdown
                buttonText="All files"
                options={uploaders}
                filterOptionSelected={filter}
                handleFilterSelect={ApplyFilter}
                customKeys={['id', 'name']}
                menuClass="drop-menu-card"
              />
            ) : (
              ''
            )}
          </div>
        </div>
        {filteredFiles &&
          filteredFiles.map((file) => (
            <ActivityFile
              key={file.file_id}
              file={file}
              isModal
              getFiles={getFiles}
              setRefreshRecentFiles={setRefreshRecentFiles}
              publicPage={publicPage}
              isOwner={isOwner(file)}
              fromOrganization={fromOrganization}
            />
          ))}
        <div className="mt-2">
          <Pagination paginationInfo={pagination} onPageChange={changePage} />
        </div>
      </ModalBody>
    </Modal>
  );
};

export default ActivityFilesModal;
