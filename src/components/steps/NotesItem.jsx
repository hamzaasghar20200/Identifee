import React, { useState } from 'react';
import {
  DATE_FORMAT_TIME_WO_SEC,
  createBlobObject,
  isPermissionAllowed,
  setDateFormat,
} from '../../utils/Utils';
import Comments from './Comments';
import MoreActions from '../MoreActions';
import { items } from './feedTypes/FeedActivity';
import MentionsInput from '../mentions/MentionsInput';
import Avatar from '../Avatar';
import { Link } from 'react-router-dom';
import feedService from '../../services/feed.service';
import stringConstants from '../../utils/stringConstants.json';
import routes from '../../utils/routes.json';
import { Collapse } from 'react-bootstrap';
import FeedFile from './feedTypes/FeedFile';
import filesService from '../../services/files.service';
import { MAX_WEIGHT, MAX_WEIGHT_ERROR_MESSAGE } from '../../utils/constants';
import AlertWrapper from '../Alert/AlertWrapper';
import Alert from '../Alert/Alert';

const constants = stringConstants.deals.contacts.profile;

export const NoteItem = ({
  data,
  feedId,
  organizationId,
  getProfileInfo,
  isDeal,
  isContact,
  dataType,
  getNotes,
  activityPerantId,
  me,
  refreshFeed,
  fromClientPortal,
  sharedById,
}) => {
  const [note, setNote] = useState(null);
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [fileInput, setFileInput] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const createdBy = data?.createdByContact || data?.created_by_info;

  const isOwner = (data) => {
    return (
      me?.role?.admin_access ||
      me?.role?.owner_access ||
      data?.created_by === me?.id
    );
  };
  const ResourceLink = ({ data, fromClientPortal }) => {
    if (data?.contact) {
      return (
        <>
          {fromClientPortal ? (
            <div className="text-block mx-1">
              <span className="badge bg-success">{`${data?.contact?.first_name} ${data?.contact?.last_name}`}</span>
            </div>
          ) : (
            <>
              <span className="mx-1">&bull;</span>
              <Link
                to={`${routes.contacts}/${data.contact_id}/profile`}
                className="text-block"
              >
                <span>{`${data?.contact?.first_name} ${data?.contact?.last_name}`}</span>
              </Link>
            </>
          )}
        </>
      );
    } else if (data?.deal) {
      return (
        <>
          {fromClientPortal ? (
            <div className="text-block mx-1">
              <span className="badge bg-success">{data?.deal?.name}</span>
            </div>
          ) : (
            <>
              <span className="mx-1">&bull;</span>
              <Link
                to={`/${routes.dealsPipeline}/${data.deal.id}`}
                className="text-block"
              >
                <span>{data?.deal?.name}</span>
              </Link>
            </>
          )}
        </>
      );
    } else if (data?.organization) {
      return (
        <>
          {fromClientPortal ? (
            <div className="text-block mx-1">
              <span className="badge bg-success">
                {data?.organization?.name}
              </span>
            </div>
          ) : (
            <>
              <span className="mx-1">&bull;</span>
              <Link
                to={`/${routes.companies}/${data.organization_id}/organization/profile`}
                className="text-block"
              >
                <span>{data?.organization?.name}</span>
              </Link>
            </>
          )}
        </>
      );
    } else if (data?.activity) {
      return (
        <>
          <span className="mx-1">&bull;</span>
          <span className="text-block text-capitalize">
            <span>{data?.activity?.name}</span>
          </span>
        </>
      );
    }
    return null;
  };
  const closeAddComment = () => {
    setNote(null);
  };

  const onHandleEdit = () => {
    setIsLoading(false);
    setName(data?.name);
    setNote(data);
  };
  const handleUpdate = async (raw, dealId, contactId) => {
    const params = {};
    if (isDeal) {
      params.dealId = isDeal?.id;
    } else if (isContact) {
      params.contactId = isContact?.id;
    } else if (activityPerantId) {
      params.activityId = activityPerantId;
    } else {
      params.organizationId = organizationId;
    }
    try {
      await feedService.updateNotesComment(
        data?.id,
        name,
        raw,
        me?.id,
        (feedId = null),
        params
      );
      setSuccessMessage(constants.noteUpdated);
      if (fileInput?.length) {
        fileInput?.map(async (file) => {
          const form = new FormData();

          const formBlob = await createBlobObject(file);

          const { size } = formBlob || {};

          if (size > MAX_WEIGHT) {
            return setErrorMessage(MAX_WEIGHT_ERROR_MESSAGE);
          }
          form.append('note_id', data?.id);
          form.append('isPublic', false);
          form.append('file', formBlob, file.name);

          try {
            await filesService.uploadFile(form);
            setSuccessMessage(constants.fileUploaded);
            if (activityPerantId) {
              getNotes();
            }
            setFileInput([]);
          } catch (error) {
            setErrorMessage(constants.fileUploadError);
          }
        });
      }
    } catch (error) {
      if (error.response.status === 401) {
        return setErrorMessage(constants.unathorizedError);
      }
      setErrorMessage(constants.noteError);
    } finally {
      refreshFeed();
      setNote();
      if (activityPerantId) {
        getNotes();
      }
    }
  };
  return (
    <>
      <AlertWrapper>
        <Alert
          color="success"
          message={successMessage}
          setMessage={setSuccessMessage}
        />
        <Alert
          color="danger"
          message={errorMessage}
          setMessage={setErrorMessage}
        />
      </AlertWrapper>
      {fromClientPortal ? (
        <div className="card chat-msg mb-3">
          <div className="card-body">
            <div className="top-area mb-3 d-flex justify-content-between align-items-center">
              <div className="left d-flex justify-content-between align-items-center gap-3">
                <Avatar user={createdBy} defaultSize="xs" />
                <div className="text">
                  <h5 className="d-flex align-items-center gap-2 mb-0">
                    {fromClientPortal ? (
                      <span>
                        {data?.created_by && (
                          <>
                            <span>{`${createdBy?.first_name || ''} `}</span>
                            <span>{createdBy?.last_name || ''}</span>
                          </>
                        )}
                      </span>
                    ) : (
                      <span>
                        {data?.created_by && (
                          <Link
                            to={`${routes.contacts}/${data?.created_by}/profile`}
                            className="text-block"
                          >
                            <span>{`${createdBy?.first_name || ''} `}</span>
                            <span>{createdBy?.last_name || ''}</span>
                          </Link>
                        )}
                      </span>
                    )}

                    <div className="step-text font-size-xs d-flex align-items-center font-weight-normal text-muted">
                      <span>
                        {setDateFormat(
                          data?.updated_at,
                          DATE_FORMAT_TIME_WO_SEC
                        )}
                      </span>
                      <ResourceLink
                        data={data}
                        fromClientPortal={fromClientPortal}
                      />
                    </div>
                  </h5>
                </div>
              </div>
            </div>
            <div className="bottom-area">
              <p className="mb-1">
                {!note ? (
                  <>
                    <h5>{data?.name}</h5>
                    {data?.description && !data?.note ? (
                      <div
                        dangerouslySetInnerHTML={{ __html: data?.description }}
                      />
                    ) : (
                      <MentionsInput defaultState={data?.note} readOnly />
                    )}
                  </>
                ) : (
                  <div className="pl-0 pt-0 pb-0">
                    <MentionsInput
                      defaultState={note?.description || note?.note}
                      type={`comment`}
                      noteTitle={name}
                      fileInput={fileInput}
                      setFileInput={setFileInput}
                      setNoteTitle={setName}
                      handleSubmit={handleUpdate}
                      submitLabel={`Update`}
                      isLoading={isLoading}
                      onHandleCancel={closeAddComment}
                    />
                  </div>
                )}
              </p>
            </div>
            <div className="row gy-2 mb-2">
              {data?.files?.map((file, i) => (
                <FeedFile
                  key={file.id}
                  data={file}
                  wholeLength={data?.files?.length}
                  index={i}
                  activityPerantId={activityPerantId}
                  getNotes={getNotes}
                  updated_at={file.updated_at}
                  note_id={data?.id}
                  setRefreshRecentFiles={refreshFeed}
                  isOwner={isOwner(file)}
                  fromClientPortal={fromClientPortal}
                />
              ))}
            </div>
            {(isPermissionAllowed('notes', 'create') || fromClientPortal) && (
              <Comments
                activityId={data?.id}
                activityPerantId={activityPerantId}
                data={data}
                isDeal={isDeal}
                isContact={isContact}
                dataType={dataType}
                organizationId={organizationId}
                refreshFeed={refreshFeed}
                getNotes={getNotes}
                commentData={data?.children}
                me={me}
                fromClientPortal={fromClientPortal}
                sharedById={sharedById}
              />
            )}
          </div>
        </div>
      ) : (
        <div
          className={`border-bottom p-3 bg-hover-gray ${
            data.createdByContact ? 'light-yellow' : ''
          }`}
        >
          <div className="d-flex align-items-start gap-2">
            <div style={{ width: 30 }}>
              <Avatar user={createdBy} defaultSize="xs" />
            </div>
            <div className="flex-grow-1">
              <h5 className="mb-1 d-flex align-items-center gap-2">
                <span>
                  {data?.created_by && (
                    <Link
                      to={`${routes.contacts}/${data?.created_by}/profile`}
                      className="text-block"
                    >
                      <span>{`${createdBy?.first_name || ''} `}</span>
                      <span>{createdBy?.last_name || ''}</span>
                    </Link>
                  )}
                </span>
                <div className="step-text font-size-xs d-flex align-items-center font-weight-normal text-muted">
                  <span>
                    {setDateFormat(data?.updated_at, DATE_FORMAT_TIME_WO_SEC)}
                  </span>
                  <ResourceLink
                    data={data}
                    fromClientPortal={fromClientPortal}
                  />
                </div>
              </h5>
              <p className="mb-1">
                {!note ? (
                  <>
                    <h5>{data?.name}</h5>
                    {data?.description && !data?.note ? (
                      <div
                        dangerouslySetInnerHTML={{ __html: data?.description }}
                      />
                    ) : (
                      <MentionsInput defaultState={data?.note} readOnly />
                    )}
                  </>
                ) : (
                  <div className="pl-0 pt-0 pb-0">
                    <MentionsInput
                      defaultState={note?.description || note?.note}
                      type={`comment`}
                      noteTitle={name}
                      fileInput={fileInput}
                      setFileInput={setFileInput}
                      setNoteTitle={setName}
                      handleSubmit={handleUpdate}
                      submitLabel={`Update`}
                      isLoading={isLoading}
                      onHandleCancel={closeAddComment}
                    />
                  </div>
                )}
              </p>
              {data?.files?.map((file, i) => (
                <Collapse key={file.id}>
                  <FeedFile
                    key={file.id}
                    data={file}
                    wholeLength={data?.files?.length}
                    index={i}
                    activityPerantId={activityPerantId}
                    getNotes={getNotes}
                    updated_at={file.updated_at}
                    note_id={data?.id}
                    setRefreshRecentFiles={refreshFeed}
                    isOwner={isOwner(file)}
                  />
                </Collapse>
              ))}
              {(isPermissionAllowed('notes', 'create') || fromClientPortal) && (
                <Comments
                  activityId={data?.id}
                  activityPerantId={activityPerantId}
                  data={data}
                  isDeal={isDeal}
                  isContact={isContact}
                  dataType={dataType}
                  organizationId={organizationId}
                  refreshFeed={refreshFeed}
                  getNotes={getNotes}
                  commentData={data?.children}
                  me={me}
                  fromClientPortal={fromClientPortal}
                  sharedById={sharedById}
                />
              )}
            </div>
            {isOwner && (
              <div onClick={(e) => e.stopPropagation()}>
                <MoreActions
                  items={items('notes', 'edit')}
                  onHandleEdit={onHandleEdit}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
