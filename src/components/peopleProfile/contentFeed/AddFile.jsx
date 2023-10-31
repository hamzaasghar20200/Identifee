/* eslint-disable no-debugger */
import React, { useEffect, useState } from 'react';

import Alert from '../../Alert/Alert';
import AlertWrapper from '../../Alert/AlertWrapper';
import filesService from '../../../services/files.service';
import feedService from '../../../services/feed.service';
import FeedFile from '../../steps/feedTypes/FeedFile';
import ActivityFilesModal from '../../modal/ActivityFilesModal';
import { createBlobObject } from '../../../utils/Utils';
import stringConstants from '../../../utils/stringConstants.json';
import { MAX_WEIGHT, MAX_WEIGHT_ERROR_MESSAGE } from '../../../utils/constants';
import IdfUploadFiles from '../../idfComponents/idfUploadFiles/IdfUploadFiles';
import ButtonFilterDropdown from '../../../components/commons/ButtonFilterDropdown';
import TransitionGroup from 'react-transition-group/TransitionGroup';
import { Collapse } from 'react-bootstrap';
const constants = stringConstants.deals.contacts;

const AddFile = ({
  contactId,
  activityId,
  organizationId,
  getProfileInfo,
  dealId,
  getDeal,
  activityDetail,
  publicPage,
  me,
  fromActivity = false,
  noFilesMessage = '',
  fromOrganization,
  classNames = 'pt-3 pb-4',
}) => {
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [openFilesModal, setOpenFilesModal] = useState(false);
  const [refreshRecentFiles, setRefreshRecentFiles] = useState(true);
  const [files, setFiles] = useState([]);
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [uploaders] = useState([
    { key: 0, name: 'All files', type: 'allfiles' },
    { key: 1, name: 'Company', type: 'company' },
    { key: 2, name: 'Contact', type: 'contact' },
    { key: 3, name: 'Client Portal', type: 'client' },
  ]);
  const [filter, setFilter] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 15 });
  const [fileInput, setFileInput] = useState(undefined);
  const [isLoading, setIsLoading] = useState(false);

  const isOwner = (data) => {
    return (
      me?.role?.admin_access ||
      me?.role?.owner_access ||
      data?.created_by === me?.id
    );
  };

  const handleSubmit = async (file, setIsLoading, getRecentFiles) => {
    const form = new FormData();

    const formBlob = await createBlobObject(file);

    const { size } = formBlob || {};

    if (size > MAX_WEIGHT) {
      setIsLoading(false);
      return setErrorMessage(MAX_WEIGHT_ERROR_MESSAGE);
    }

    if (contactId) {
      form.append('contact_id', contactId);
    }
    if (organizationId) {
      form.append('organization_id', organizationId);
    }
    if (dealId) {
      form.append('deal_id', dealId);
    }
    if (activityId) {
      form.append('activity_id', activityId);
    }
    form.append('isPublic', false);
    form.append('file', formBlob, file.name);

    try {
      await filesService.uploadFile(form);
      setSuccessMessage(constants.profile.fileUploaded);
      if (activityId) {
        activityDetail(activityId);
      }
      if (dealId) {
        getDeal();
      }
      setFileInput(undefined);
      getFiles();
      getRecentFiles();
    } catch (error) {
      setErrorMessage(constants.profile.fileUploadError);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteFile = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setFileInput(undefined);
  };

  const getFiles = async () => {
    const res = await feedService.getFiles(
      { contactId, organizationId, activityId, dealId },
      pagination
    );
    setFiles(res?.files);
    setFilteredFiles(res?.files);
    setPagination(res?.pagination);
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

  useEffect(() => {
    if (refreshRecentFiles && (activityId || organizationId)) {
      getFiles();
      setRefreshRecentFiles(false);
    }
  }, [refreshRecentFiles, organizationId]);

  return (
    <div className={classNames}>
      <AlertWrapper>
        <Alert message={successMessage} setMessage={setSuccessMessage} />
        <Alert
          color="danger"
          message={errorMessage}
          setMessage={setErrorMessage}
        />
      </AlertWrapper>
      <ActivityFilesModal
        setShowModal={setOpenFilesModal}
        showModal={openFilesModal}
        contactId={contactId}
        activityId={activityId}
        organizationId={organizationId}
        setRefreshRecentFiles={setRefreshRecentFiles}
        refreshRecentFiles={refreshRecentFiles}
        publicPage={publicPage}
        isOwner={isOwner}
        fromOrganization={fromOrganization}
      />

      <div className="mx-3 public-page-setting">
        <IdfUploadFiles
          fileInput={fileInput}
          setFileInput={setFileInput}
          deleteFile={deleteFile}
          setIsLoading={setIsLoading}
          activityId={activityId}
          handleSubmit={handleSubmit}
          loading={isLoading}
          organizationId={organizationId}
          setErrorMessage={setErrorMessage}
          openFilesModal={openFilesModal}
          setOpenFilesModal={setOpenFilesModal}
          publicPage={publicPage}
        />
        {!publicPage && (
          <div
            className={`my-2 d-flex align-items-center pt-2 pb-3 media ${
              filteredFiles?.length > 0 ? 'border-bottom' : ''
            }`}
          >
            {fromActivity ? (
              ''
            ) : (
              <>
                {fromOrganization ? (
                  <>
                    {filteredFiles.length > 0 ? (
                      <h5 className="mb-0">{`${
                        filteredFiles?.length || 0
                      } files uploaded`}</h5>
                    ) : null}
                    <div className="ml-auto">
                      <ButtonFilterDropdown
                        buttonText="All Files"
                        options={uploaders}
                        filterOptionSelected={filter}
                        handleFilterSelect={ApplyFilter}
                        menuClass="drop-menu-card"
                      />
                    </div>
                  </>
                ) : (
                  ''
                )}
              </>
            )}
          </div>
        )}
      </div>

      {!publicPage && (
        <TransitionGroup>
          {filteredFiles?.slice(0, 5).map((file, i) => (
            <Collapse key={file.id}>
              <FeedFile
                key={file.id}
                data={file.file}
                uploadedBy={file}
                activityId={activityId}
                wholeLength={files?.slice(0, 5).length}
                index={i}
                updated_at={file.updated_at}
                setRefreshRecentFiles={setRefreshRecentFiles}
                organizationId={organizationId}
                isOwner={isOwner(file)}
                fromFiles={true}
                fromOrganization={fromOrganization}
              />
            </Collapse>
          ))}
          {pagination.count > 4 && (
            <div className="mt-2 mb-0 mx-3">
              <button
                className="btn btn-white btn-sm col-12 px-0 mx-0"
                onClick={() => {
                  setOpenFilesModal(true);
                }}
              >
                View all
              </button>
            </div>
          )}
        </TransitionGroup>
      )}

      {!(filteredFiles.length > 0) && noFilesMessage}
    </div>
  );
};

export default AddFile;
