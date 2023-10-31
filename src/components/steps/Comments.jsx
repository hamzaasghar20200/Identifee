import React, { useState, useEffect } from 'react';
import Avatar from '../Avatar';
import { DATE_FORMAT_TIME_WO_SEC, setDateFormat } from '../../utils/Utils';
import { CardButton } from '../layouts/CardLayout';
import feedService from '../../services/feed.service';
import stringConstants from '../../utils/stringConstants.json';
import MoreActions from '../MoreActions';
import ModalConfirm from '../modal/ModalConfirmDefault';
import MentionsInput from '../mentions/MentionsInput';
import { useProfileContext } from '../../contexts/profileContext';

export const items = () => {
  return [
    {
      id: 'edit',
      icon: 'edit',
      name: 'Edit',
    },
    {
      id: 'remove',
      icon: 'delete',
      name: 'Delete',
    },
  ];
};
const constants = stringConstants.feed.comments;
const defaultPagination = { page: 1, limit: 3 };
const Comments = ({
  me,
  activityId,
  activityPerantId,
  commentData,
  refreshFeed,
  isDeal,
  isContact,
  dataType,
  organizationId,
  getNotes,
  fromClientPortal,
  sharedById,
}) => {
  const { profileInfo } = useProfileContext();
  const [feedComments, setFeedComments] = useState([]);
  const [pagination, setPagination] = useState(defaultPagination);
  const [commentEdit, setCommentEdit] = useState({ id: null });
  const [commentDelete, setCommentDelete] = useState(null);
  const [showInput, setShowInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingEdit, setIsLoadingEdit] = useState(false);
  const [name, setName] = useState('');
  const [openModal, setOpenModal] = useState(false);

  useEffect(() => {
    setFeedComments(commentData);
  }, [commentData]);

  const permission = {
    collection: 'contacts',
    action: 'edit',
  };
  const addComment = async (raw, assigned_user_id, feedId) => {
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

    const userId = fromClientPortal ? sharedById : profileInfo?.id;

    try {
      await feedService.addNotesComment(
        name,
        raw,
        (assigned_user_id = userId),
        (feedId = activityId),
        params
      );
      setShowInput(false);
      refreshFeed();
      if (activityPerantId) {
        getNotes();
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const closeAddComment = (e) => {
    setShowInput(false);
    e.preventDefault();
    e.stopPropagation();
  };

  const openAddComment = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowInput(true);
  };

  const onHandleModeEdit = (item) => {
    setCommentEdit(item);
    setName(item?.name);
  };

  const onHandleCancelModeEdit = () => {
    setCommentEdit({});
  };
  const onHandleEditComment = async (raw, feedId) => {
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
      setIsLoadingEdit(true);
      await feedService.updateNotesComment(
        commentEdit.id,
        name,
        raw,
        commentEdit?.assigned_user_id,
        (feedId = activityId),
        params
      );
      setCommentEdit({});
      refreshFeed();
      if (activityPerantId) {
        getNotes();
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoadingEdit(false);
    }
  };

  const onHandleRemoveComment = () => {
    feedService
      .deleteNote(commentDelete.id)
      .then(() => {
        setCommentEdit({});
        refreshFeed();
        setCommentDelete(null);
        setOpenModal(false);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setIsLoading(false);
        if (activityPerantId) {
          getNotes();
        }
      });
  };
  const renderEditComments = () => {
    return (
      <div className="w-100">
        <MentionsInput
          type={`comment`}
          activityId={activityId}
          noteTitle={name}
          setNoteTitle={setName}
          commentAttach={true}
          defaultState={
            commentEdit?.message || commentEdit?.comment || commentEdit?.note
          }
          handleSubmit={onHandleEditComment}
          onHandleCancel={onHandleCancelModeEdit}
          isLoading={isLoadingEdit}
          submitLabel={`Update`}
        />
      </div>
    );
  };

  return (
    <div>
      <ModalConfirm
        open={openModal}
        icon="warning"
        onHandleConfirm={onHandleRemoveComment}
        onHandleClose={() => {
          setOpenModal(false);
          setCommentDelete(null);
        }}
        textBody={constants.messageWarningModalDelete}
        labelButtonConfirm={'Yes, Delete'}
        iconButtonConfirm=""
        colorButtonConfirm={'outline-danger'}
      />
      <div className="pt-1 d-flex justify-content-between">
        <a
          className="cursor-pointer text-muted font-size-sm2 d-gray mb-1"
          onClick={(e) => openAddComment(e)}
        >
          <span className="material-icons-outlined">chat</span>{' '}
          {constants.addCommentButton}
        </a>
        {pagination?.count > 0 && (
          <p className="text-normal-bold font-size-xs text-muted">
            {pagination?.count} {constants.commentsLabel}
          </p>
        )}
      </div>
      <div className="comments-container">
        {showInput && (
          <>
            <MentionsInput
              handleSubmit={addComment}
              type={`comment`}
              commentAttach={true}
              activityId={activityId}
              setNoteTitle={setName}
              isLoading={isLoading}
              submitLabel={`Reply`}
              onHandleCancel={(e) => closeAddComment(e)}
            />
          </>
        )}

        {feedComments?.length ? (
          <div className="card mt-2 p-3">
            {feedComments?.map((item) => {
              // if current user has admin_access or the item is created by the user then allow editing only
              const isCommentOwner =
                me?.role?.admin_access || item?.created_by === me?.id;
              return (
                <div key={item.id}>
                  <div className="d-flex justify-content-start">
                    <div style={{ width: 30 }}>
                      {item.createdByContact ? (
                        <Avatar user={item.createdByContact} defaultSize="xs" />
                      ) : item.created_by_info && fromClientPortal ? (
                        <Avatar user={item.created_by_info} defaultSize="xs" />
                      ) : (
                        <Avatar user={profileInfo} defaultSize="xs" />
                      )}
                    </div>
                    <div className="ml-2 w-100">
                      <div>
                        <span>
                          <span className="text-normal-bold font-size-sm2 text-block">
                            {item.createdByContact
                              ? item.createdByContact.first_name +
                                ' ' +
                                item.createdByContact.last_name
                              : item.created_by_info && fromClientPortal
                              ? item.created_by_info.first_name +
                                ' ' +
                                item.created_by_info.last_name
                              : profileInfo?.first_name +
                                ' ' +
                                profileInfo?.last_name}
                          </span>
                        </span>
                        <span className="ml-2 text-muted font-size-xs">
                          {setDateFormat(
                            item.updatedAt,
                            DATE_FORMAT_TIME_WO_SEC
                          )}
                        </span>
                        {item.updatedAt !== item.createdAt && !item.deleted && (
                          <span className="fs-italic"> • Edited</span>
                        )}
                      </div>
                      {item.id !== commentEdit?.id ? (
                        <>
                          {!item.deleted ? (
                            <>
                              <h6 className="mb-0 mt-2">{item?.name}</h6>
                              <MentionsInput
                                readOnly
                                defaultState={
                                  item.message || item.comment || item?.note
                                }
                              />
                            </>
                          ) : (
                            <span className="fs-italic text-danger">
                              {constants.messageDelete}
                            </span>
                          )}
                        </>
                      ) : (
                        renderEditComments()
                      )}
                    </div>

                    {!item.deleted && isCommentOwner && (
                      <div className="ml-auto">
                        <MoreActions
                          permission={permission}
                          items={items()}
                          onHandleEdit={onHandleModeEdit.bind(null, item)}
                          onHandleRemove={() => {
                            setOpenModal(true);
                            setCommentDelete(item);
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          ''
        )}

        {pagination?.count > feedComments?.length &&
          pagination.page < pagination.totalPages && (
            <CardButton
              variant="white"
              title={constants.seeMoreComments}
              isLoading={isLoading}
              onClick={() => {
                setPagination((prev) => ({ ...prev, limit: prev.limit + 3 }));
              }}
              block
            />
          )}
      </div>
    </div>
  );
};

export default Comments;
