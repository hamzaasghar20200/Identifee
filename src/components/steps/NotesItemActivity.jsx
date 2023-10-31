import React, { useState } from 'react';
import {
  DATE_FORMAT_TIME_WO_SEC,
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
import AlertWrapper from '../Alert/AlertWrapper';
import Alert from '../Alert/Alert';

const constants = stringConstants.deals.contacts.profile;

export const NoteItem = ({
  data,
  feedInfo,
  feedId,
  getProfileInfo,
  isOwner,
  me,
  refreshFeed,
}) => {
  const [note, setNote] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { errorMessage, setErrorMessage } = useState('');
  const { successMessage, setSuccessMessage } = useState('');
  const ResourceLink = ({ data }) => {
    if (data?.contact) {
      return (
        <>
          <span className="mx-1">&bull;</span>
          <Link
            to={`${routes.contacts}/${data.contact_id}/profile`}
            className="text-block"
          >
            <span>{`${data?.contact?.first_name} ${data?.contact?.last_name}`}</span>
          </Link>
        </>
      );
    } else if (data?.organization) {
      return (
        <>
          <span className="mx-1">&bull;</span>
          <Link
            to={`/${routes.companies}/${data.organization_id}/organization/profile`}
            className="text-block"
          >
            <span>{data?.organization?.name}</span>
          </Link>
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
    setNote(data);
  };

  const handleUpdate = async (raw) => {
    try {
      const { id } = note;
      await feedService.updateNote(feedId, id, raw);
      setNote(null);
      setSuccessMessage(constants.noteUpdated);
      refreshFeed();
    } catch (error) {
      if (error.response.status === 401) {
        setNote(null);
        return setErrorMessage(constants.unathorizedError);
      }

      setErrorMessage(constants.noteError);
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
      <div className="border-bottom p-3 bg-hover-gray">
        <div className="d-flex align-items-start gap-2">
          <div style={{ width: 30 }}>
            <Avatar user={feedInfo?.created_by_info} defaultSize="xs" />
          </div>
          <div className="flex-grow-1">
            <h5 className="mb-1 d-flex align-items-center gap-2">
              <span>
                {feedInfo?.created_by && (
                  <Link
                    to={`${routes.contacts}/${feedInfo?.created_by}/profile`}
                    className="text-block"
                  >
                    <span>{`${
                      feedInfo?.created_by_info?.first_name || ''
                    } `}</span>
                    <span>{feedInfo?.created_by_info?.last_name || ''}</span>
                  </Link>
                )}
              </span>
              <div className="step-text font-size-xs d-flex align-items-center font-weight-normal text-muted">
                <span>
                  {setDateFormat(feedInfo?.updated_at, DATE_FORMAT_TIME_WO_SEC)}
                </span>
                <ResourceLink data={feedInfo} />
              </div>
            </h5>
            <p className="mb-1">
              {note === null ? (
                <>
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
                    handleSubmit={handleUpdate}
                    submitLabel={`Update`}
                    isLoading={isLoading}
                    onHandleCancel={closeAddComment}
                  />
                </div>
              )}
            </p>
            {isPermissionAllowed('notes', 'create') && (
              <Comments data={feedInfo} me={me} />
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
    </>
  );
};
