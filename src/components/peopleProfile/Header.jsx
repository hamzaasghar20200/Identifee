import React, { useState, useEffect } from 'react';
import { Badge, Spinner } from 'reactstrap';
import { Dropdown } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';

import Avatar from '../Avatar';
import Alert from '../Alert/Alert';
import AlertWrapper from '../Alert/AlertWrapper';
import Heading from '../heading';
import userService from '../../services/user.service';
import contactService from '../../services/contact.service';
import stringConstants from '../../utils/stringConstants.json';
import routes from '../../utils/routes.json';
import IdfOwnersHeader from '../idfComponents/idfAdditionalOwners/IdfOwnersHeader';
import ModalAvatar from '../modal/ModalAvatar';
import filesService from '../../services/files.service';
import { useProfileContext } from '../../contexts/profileContext';
import {
  base64ToBlob,
  isPermissionAllowed,
  isValidUrl,
} from '../../utils/Utils';
import DeleteModal from '../modal/DeleteModal';
import PageTitle from '../commons/PageTitle';

const globalStrings = stringConstants.global.avatar;
const constants = stringConstants.deals.contacts.profile;
const organizationConstants = stringConstants.deals.organizations;

const Header = ({
  moduleMap,
  contactId,
  data,
  refreshOwners,
  setRefresOwners,
  isPrincipalOwner,
}) => {
  const [openModal, setOpenModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [userInfo, setUserInfo] = useState({});
  const [loading, setLoading] = useState(false);
  const [openModalAvatar, setOpenModalAvatar] = useState(false);
  const [selectedData, setSelectedData] = useState([]);
  const [allOrganizations, setAllOrganizations] = useState([]);
  const [deleteResults, setDeleteResults] = useState([]);
  const [showDeleteReport, setShowDeleteReport] = useState(false);
  const [modified, setModified] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const [fullname, setFullName] = useState('Contact Profile');
  const history = useHistory();

  useEffect(() => {
    setFullName(
      userInfo.first_name
        ? userInfo.first_name +
            ' ' +
            (userInfo.last_name ? userInfo.last_name : ' ')
        : `${moduleMap} Profile`
    );
  }, [userInfo]);

  useEffect(() => {
    setUserInfo(data);
    setAllOrganizations([data]);
    setSelectedData([data.id]);
  }, [data]);

  useEffect(() => {
    if (!openModal && isDeleted) {
      setTimeout(() => {
        history.push(routes.contacts);
      }, 1000);
    }
  }, [openModal]);

  const handleDelete = async () => {
    try {
      const response = await contactService.deleteContacts([userInfo.id]);
      setDeleteResults(response);
      setIsDeleted(response[0].result === 'success');
      setShowDeleteReport(true);
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const updateContactAvatar = (avatarId) => {
    contactService
      .updateContact(userInfo.id, { avatar: avatarId })
      .then(() => {
        setSuccessMessage(
          avatarId
            ? `Contact ${globalStrings.uploadSuccess}`
            : `Contact ${globalStrings.removedSuccess}`
        );
        setOpenModalAvatar(false);
      })
      .catch(() => {
        setErrorMessage(globalStrings.uploadError);
      });
  };

  const onHandleSaveAvatar = async ({ src, name }) => {
    setLoading(true);
    // onUploadAvatar
    const form = new FormData();
    form.append('file', await base64ToBlob(src), name);
    const avatarResult = await userService.uploadAvatar(form).catch((_) => {
      setErrorMessage(globalStrings.uploadError);
    });

    const result = avatarResult?.data;

    setUserInfo((prev) => ({
      ...prev,
      avatar: result.data.id,
      avatarSrc: src,
    }));

    if (result?.data?.id) {
      await updateContactAvatar(result.data.id);
      setLoading(false);
    }
  };

  const removeFile = async () => {
    if (userInfo?.avatar && isValidUrl(userInfo?.avatar)) {
      updateContactAvatar(null);
      setUserInfo((prev) => ({
        ...prev,
        avatar: null,
        avatarSrc: null,
      }));
    } else {
      setLoading(true);
      filesService
        .removeFileById(userInfo.avatar)
        .then(() => {
          updateContactAvatar(null);
          setUserInfo((prev) => ({
            ...prev,
            avatar: null,
            avatarSrc: null,
          }));
          setLoading(false);
        })
        .catch(() => {
          setErrorMessage(globalStrings.uploadError);
        });
    }
  };
  // All States
  const [isFollowing, setIsFollowing] = useState(false);
  const [isOwner, setIsOwner] = useState(true);
  const [followersInfo, setFollowersInfo] = useState([]);
  const { profileInfo } = useProfileContext();
  const [userId, setUserId] = useState();
  const [openAddFollower] = useState(false);
  const [spinner, setSpinner] = useState(false);

  const getUserId = () => {
    const id = profileInfo?.id;
    if (id) {
      setUserId(id);
    }
  };
  // All UseEffects
  useEffect(() => {
    if (userId) {
      checkFollower();
    }
  }, [userId, followersInfo]);
  useEffect(() => {
    onGetOwners();
  }, []);
  useEffect(() => {
    if (userId) {
      checkFollower();
    }
  }, [userId, followersInfo]);
  useEffect(() => {
    if (!openAddFollower) onGetOwners();
  }, [isFollowing, openAddFollower]);
  useEffect(() => {
    getUserId();
  }, [profileInfo]);

  // All function
  const getOwners = async (pagination) => {
    return await contactService
      .getOwners(contactId, pagination)
      .catch((err) => console.log(err));
  };
  const onGetOwners = async (pagination = { page: 1, limit: 10 }) => {
    const requests = [];
    requests.push(getOwners(pagination));
    const resp = await Promise.all(requests);
    const owners = resp[0];

    const { data } = owners || {};

    const ownersList = data.map((ow) => ({
      ...ow,
      user: { ...ow.user, type: 'owner' },
    }));
    setFollowersInfo([...ownersList]);
  };

  const stopFollowing = async () => {
    setSpinner(true);
    await contactService
      .stopFollowing(contactId, userId)
      .catch(() =>
        setErrorMessage('There is something wrong in Stop Following!')
      );
    await onGetOwners();
    setSpinner(false);
  };

  const startFollowing = async () => {
    setSpinner(true);
    await contactService
      .startFollowing(contactId, userId)
      .catch(() =>
        setErrorMessage('There is something wrong in Start Following!')
      );
    await onGetOwners();
    setSpinner(false);
  };
  const checkFollower = async () => {
    const result = await contactService.checkFollowing(contactId, userId);
    const IsOwner =
      followersInfo.filter((follower) => {
        return follower.user_id === userId && follower.user.type !== 'follower';
      }).length > 0;

    setIsOwner(IsOwner);
    setIsFollowing(result);
  };

  return (
    <div className="page-header mb-0 pb-0">
      <PageTitle page={fullname} pageModule="Contacts" />
      <AlertWrapper>
        <Alert
          message={errorMessage}
          setMessage={setErrorMessage}
          color="danger"
        />
        <Alert
          message={successMessage}
          setMessage={setSuccessMessage}
          color="success"
        />
      </AlertWrapper>
      {openModal && (
        <DeleteModal
          type="contacts"
          showModal={openModal}
          setShowModal={setOpenModal}
          selectedData={selectedData}
          setSelectedData={setSelectedData}
          event={handleDelete}
          data={allOrganizations}
          results={deleteResults}
          setResults={setDeleteResults}
          showReport={showDeleteReport}
          setShowReport={setShowDeleteReport}
          modified={modified}
          setModified={setModified}
          constants={organizationConstants.delete}
          resetSeletedData={false}
        />
      )}

      <ModalAvatar
        open={openModalAvatar}
        onHandleClose={() => setOpenModalAvatar(false)}
        userInfo={userInfo}
        onRemove={removeFile}
        loading={loading}
        onSaveAvatar={onHandleSaveAvatar}
        type="contact"
      />

      <div className="row align-items-end">
        <div className="col-sm mb-2 mb-sm-0">
          <Heading useBc title={fullname} showGreeting={false} />
          <div className="media mb-3">
            {isPermissionAllowed('contacts', 'edit') && (
              <label
                className="avatar avatar-xl avatar-circle avatar-border-lg avatar-uploader mr-3"
                htmlFor="avatarUploader"
                onClick={() => setOpenModalAvatar(true)}
              >
                <Avatar
                  classModifiers="max-wh"
                  defaultSize="lg"
                  sizeIcon="font-size-2xl profile-icon"
                  user={userInfo}
                />

                <span className="avatar-uploader-trigger">
                  <i className="material-icons-outlined avatar-uploader-icon shadow-soft">
                    photo_camera
                  </i>
                </span>
              </label>
            )}
            <div className="media-body">
              <div className="row align-items-center no-gutters">
                <div className="col-lg mb-3 mb-lg-0">
                  <h1 className="page-header-title">{fullname}</h1>
                  <div className="row align-items-center no-gutters mt-2">
                    <div className="col-auto d-flex align-items-center w-50">
                      {userInfo.is_customer ? (
                        <>
                          <Badge
                            color={`success`}
                            style={{ fontSize: '12px' }}
                            className="text-uppercase mr-3"
                          >
                            {
                              stringConstants.deals.organizations.profile
                                .customerTitle
                            }
                          </Badge>
                        </>
                      ) : (
                        <>
                          <Badge
                            id={userInfo?.label?.id}
                            style={{
                              fontSize: '12px',
                              backgroundColor: `${userInfo?.label?.color}`,
                            }}
                            className="text-uppercase mr-3"
                          >
                            {userInfo?.label?.name}
                          </Badge>
                        </>
                      )}
                      <IdfOwnersHeader
                        mainOwner={data?.assigned_user}
                        service={contactService}
                        serviceId={data?.id}
                        refreshOwners={refreshOwners}
                        setRefresOwners={setRefresOwners}
                        isprincipalowner={isPrincipalOwner}
                      />
                      {/* THis is added */}

                      {isOwner || isFollowing ? (
                        <>
                          <div
                            className={`d-flex ml-2 gap-1 px-2 rounded border btn-white align-items-center ${
                              isOwner ? 'disabled' : ''
                            }`}
                          >
                            <span className="material-icons-outlined">
                              visibility
                            </span>
                            <button
                              className={`btn border-0 btn-sm ${
                                isOwner ? 'disabled' : ''
                              }`}
                              onClick={!isOwner ? stopFollowing : () => {}}
                            >
                              Stop following
                            </button>
                            <span
                              style={{ color: 'green', fontSize: '15px' }}
                              className="material-icons-outlined px-2 p-1 bg-green rounded text-white ml-1"
                            >
                              check
                            </span>
                          </div>
                          {spinner === true && (
                            <Spinner color="black" size="sm" className="m-1" />
                          )}
                        </>
                      ) : (
                        <>
                          {isPermissionAllowed('contacts', 'create') && (
                            <>
                              <button
                                className="btn btn-white btn-sm ml-2"
                                onClick={startFollowing}
                              >
                                <span className="material-icons-outlined mr-1">
                                  add
                                </span>
                                Start following
                              </button>
                              {spinner === true && (
                                <Spinner
                                  color="black"
                                  size="sm"
                                  className="m-1"
                                />
                              )}
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {isPermissionAllowed('contacts', 'delete') &&
                  isPrincipalOwner && (
                    <div className="col-lg-auto ml-1">
                      <Dropdown
                        drop="down"
                        className="rounded idf-dropdown-item-list"
                      >
                        <Dropdown.Toggle
                          className="dropdown-search btn-icon rounded-circle no-caret"
                          variant="link"
                        >
                          <i className="material-icons-outlined">more_vert</i>
                        </Dropdown.Toggle>
                        <Dropdown.Menu className="py-1">
                          <Dropdown.Item
                            className="pl-2 bg-hover-danger text-gray-900"
                            onClick={() => setOpenModal(true)}
                          >
                            <i className="material-icons-outlined dropdown-item-icon">
                              delete
                            </i>
                            {constants.dropdown.delete}
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    </div>
                  )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
