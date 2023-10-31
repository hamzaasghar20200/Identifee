import React, { useState, useEffect } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { Badge, Spinner } from 'reactstrap';
import { Dropdown } from 'react-bootstrap';

import Avatar from '../Avatar';
import Alert from '../Alert/Alert';
import AlertWrapper from '../Alert/AlertWrapper';
import Heading from '../heading';
import userService from '../../services/user.service';
import organizationService from '../../services/organization.service';
import stringConstants from '../../utils/stringConstants.json';
import routes from '../../utils/routes.json';
import IdfOwnersHeader from '../idfComponents/idfAdditionalOwners/IdfOwnersHeader';
import filesService from '../../services/files.service';
import ModalAvatar from '../modal/ModalAvatar';
import {
  base64ToBlob,
  isPermissionAllowed,
  isValidUrl,
} from '../../utils/Utils';
import { CardButton } from '../layouts/CardLayout';
import SendOrDownloadModal from './SendOrDownloadModal';
import DeleteModal from '../modal/DeleteModal';
import { useProfileContext } from '../../contexts/profileContext';
import PageTitle from '../commons/PageTitle';
import usePermission from '../../hooks/usePermission';
import { PermissionsConstants } from '../../utils/permissions.constants';
const globalStrings = stringConstants.global.avatar;
const organizationConstants = stringConstants.deals.organizations;
const Header = ({
  contact,
  withFollowers,
  moduleMap,
  mainOwner,
  service,
  data,
  refreshOwners,
  setRefresOwners,
  isPrincipalOwner,
  getProfileInfo,
  me,
  ...props
}) => {
  const { organizationId, contactId, id: dealId } = useParams();
  const serviceId = organizationId || contactId || dealId;
  const [owners, setOwners] = useState([]);
  const [, setCount] = useState(0);
  const [followersInfo, setFollowersInfo] = useState([]);
  const [userId, setUserId] = useState('');
  const { profileInfo } = useProfileContext();
  const [isFollowing, setIsFollowing] = useState(false);
  const [isOwner, setIsOwner] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [openOwnerModal, setOpenOwnerModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [organizationInfo, setOrganizationInfo] = useState({});
  const [ownerInfo, setOwnerInfo] = useState({});
  const [loading, setLoading] = useState(false);
  const [openModalAvatar, setOpenModalAvatar] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [toast, setToast] = useState(null);
  const [selectedData, setSelectedData] = useState([]);
  const [selectedOwner, setSelectedOwner] = useState([]);
  const [allOrganizations, setAllOrganizations] = useState([]);
  const [allOwners, setAllOwners] = useState([]);
  const [deleteResults, setDeleteResults] = useState([]);
  const [showDeleteReport, setShowDeleteReport] = useState(false);
  const [modified, setModified] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const [colorToast, setColorToast] = useState('success');
  const [spinner, setSpinner] = useState(false);
  const { isAllowed } = usePermission(
    PermissionsConstants.ClientPortal,
    'view',
    true
  );

  const history = useHistory();

  useEffect(() => {
    setOrganizationInfo(data);
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
      const response = await organizationService.deleteOrganizations([
        organizationInfo.id,
      ]);
      setDeleteResults(response);
      setIsDeleted(response[0].result === 'success');
      setShowDeleteReport(true);
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const deleteOwner = async () => {
    try {
      const response = await organizationService.removeOwner(
        props.organizationId,
        ownerInfo.id
      );
      setDeleteResults([{ id: ownerInfo.id, msg: '', result: 'success' }]);
      setIsDeleted(response.status === 200);
      setShowDeleteReport(true);
      setRefresOwners(true);
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const setDeleteOwner = (profile) => {
    setOwnerInfo(profile.user);
    setAllOwners([profile.user]);
    setSelectedOwner([profile.user.id]);
    console.log(profile.user);
    setOpenOwnerModal(true);
  };

  const updateOrganizationAvatar = (avatarId) => {
    organizationService
      .updateOrganization(organizationInfo.id, { avatar: avatarId })
      .then(() => {
        setSuccessMessage(
          avatarId
            ? globalStrings.uploadSuccessOrg.replace(/Company/g, moduleMap)
            : globalStrings.removedSuccessOrg.replace(/Company/g, moduleMap)
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

    setOrganizationInfo((prev) => ({
      ...prev,
      avatar: result.data.id,
      avatarSrc: src,
    }));

    if (result?.data?.id) {
      await updateOrganizationAvatar(result.data.id);
      setLoading(false);
    }
  };

  const removeFile = async () => {
    if (organizationInfo?.avatar && isValidUrl(organizationInfo?.avatar)) {
      updateOrganizationAvatar(null);
      setOrganizationInfo((prev) => ({
        ...prev,
        avatar: null,
        avatarSrc: null,
      }));
    } else {
      filesService
        .removeFileById(organizationInfo.avatar)
        .then(() => {
          updateOrganizationAvatar(null);
          setOrganizationInfo((prev) => ({
            ...prev,
            avatar: null,
            avatarSrc: null,
          }));
        })
        .catch(() => {
          setErrorMessage(globalStrings.uploadError);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  const getUserId = () => {
    const id = profileInfo?.id;
    if (id) {
      setUserId(id);
    }
  };

  useEffect(() => {
    if (serviceId) onGetOwners();
  }, [serviceId, refreshOwners, isFollowing]);

  const ownersService = async (pagination) => {
    return await service
      .getOwners(serviceId, pagination)
      .catch((err) => console.log(err));
  };

  const putItemsFirst = ({ findFunction, array }) => [
    ...array.filter(findFunction),
    ...array.filter((item) => !findFunction(item)),
  ];
  useEffect(() => {
    setOwners([
      ...putItemsFirst({
        array: [...owners],
        findFunction: (rc) => {
          return rc.user?.id === mainOwner?.id;
        },
      }),
    ]);
  }, [mainOwner]);

  useEffect(() => {
    if (
      mainOwner &&
      (owners.length === 0 || owners[0].user_id !== mainOwner?.id)
    ) {
      setOwners([
        {
          organization_id: withFollowers,
          user: { ...mainOwner, type: 'primaryOwner' },
          user_id: mainOwner?.id,
        },
        ...owners,
      ]);
    }
  }, [owners]);

  const checkFollower = async () => {
    const result = await organizationService.checkFollowing(serviceId, userId);
    const IsOwner =
      owners.filter((owner) => {
        return owner.user_id === userId && owner.user.type !== 'follower';
      }).length > 0;
    setIsOwner(IsOwner);
    setIsFollowing(result);
  };

  useEffect(() => {
    getFollowers();
  }, []);

  useEffect(() => {
    if (userId) {
      checkFollower();
    }
  }, [userId, followersInfo]);

  useEffect(() => {
    getUserId();
  }, [profileInfo]);

  const onGetOwners = async (pagination = { page: 1, limit: 10 }) => {
    const requests = [];
    requests.push(ownersService(pagination));
    if (withFollowers) {
      requests.push(organizationService.getFollowers(withFollowers, {}));
    }
    const resp = await Promise.all(requests);
    const owners = resp[0];

    const {
      data,
      pagination: { count },
    } = owners || {};

    const contacts = withFollowers && (resp[1].data || []);
    const ownersList = data.map((ow) => ({
      ...ow,
      user: { ...ow.user, type: 'owner' },
    }));
    const contactsList =
      (contacts &&
        contacts.map((fo) => ({
          ...fo,
          user: { ...fo.user, type: 'follower' },
        }))) ||
      [];
    setOwners([...ownersList, ...contactsList]);
    setCount(count);
  };

  const getFollowers = async () => {
    const result = await organizationService.getFollowers(serviceId, {});
    setFollowersInfo(result?.data);
  };

  const stopFollowing = async () => {
    setSpinner(true);
    await organizationService
      .stopFollowing(serviceId, userId)
      .catch(() =>
        setErrorMessage('There is something wrong in Stop Following!')
      );
    await getFollowers();
    setSpinner(false);
  };

  const startFollowing = async () => {
    setSpinner(true);
    await organizationService
      .startFollowing(serviceId, userId)
      .catch(() =>
        setErrorMessage('There is something wrong in Start Following!')
      );
    await getFollowers();
    setSpinner(false);
  };
  return (
    <>
      <PageTitle
        page={organizationInfo.name || `${moduleMap} Profile`}
        pageModule="Contacts"
      />
      <div className="page-header mb-0 pb-0 ">
        {openModal && (
          <DeleteModal
            type="organizations"
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

        {openOwnerModal && (
          <DeleteModal
            type="owners"
            showModal={openOwnerModal}
            setShowModal={setOpenOwnerModal}
            selectedData={selectedOwner}
            setSelectedData={setSelectedOwner}
            event={deleteOwner}
            data={allOwners}
            results={deleteResults}
            setResults={setDeleteResults}
            showReport={showDeleteReport}
            setShowReport={setShowDeleteReport}
            modified={modified}
            setModified={setModified}
            constants={organizationConstants.ownerDelete}
            resetSeletedData={false}
          />
        )}

        <ModalAvatar
          open={openModalAvatar}
          onHandleClose={() => setOpenModalAvatar(false)}
          userInfo={organizationInfo}
          onRemove={removeFile}
          loading={loading}
          onSaveAvatar={onHandleSaveAvatar}
          type="organization"
        />

        <div className="row align-items-end">
          <div className="col-sm mb-sm-0">
            <Heading
              useBc
              title={organizationInfo.name || `${moduleMap} Profile`}
              showGreeting={false}
            />
            <div className="media mb-3">
              {isPermissionAllowed('contacts', 'edit') && (
                <label
                  className="avatar avatar-xl avatar-circle avatar-border-lg avatar-uploader mr-3"
                  htmlFor="avatarUploader"
                  onClick={() => setOpenModalAvatar(true)}
                >
                  <Avatar
                    classModifiers="max-wh"
                    sizeIcon="font-size-2xl"
                    user={organizationInfo}
                    type="organization"
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
                  <div className="header-profile col-lg mb-3 mb-lg-0">
                    <h1 className="page-header-title">
                      {organizationInfo.name || `${moduleMap} Profile`}
                    </h1>
                    <div className="row align-items-center no-gutters mt-2">
                      <div className="col-auto d-flex align-items-center w-100">
                        {organizationInfo.is_customer ? (
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
                        ) : (
                          <Badge
                            id={organizationInfo?.label?.id}
                            style={{
                              fontSize: '12px',
                              backgroundColor: `${organizationInfo?.label?.color}`,
                            }}
                            className="text-uppercase mr-3"
                          >
                            {organizationInfo?.label?.name}
                          </Badge>
                        )}
                        {isPermissionAllowed('contacts', 'create') ? (
                          <IdfOwnersHeader
                            className="mx-0"
                            mainOwner={mainOwner}
                            service={organizationService}
                            serviceId={data?.id}
                            refreshOwners={refreshOwners}
                            setRefresOwners={setRefresOwners}
                            isprincipalowner={isPrincipalOwner}
                            onClick={setDeleteOwner}
                          />
                        ) : (
                          <IdfOwnersHeader
                            className="mx-0"
                            mainOwner={mainOwner}
                            service={organizationService}
                            serviceId={data?.id}
                            refreshOwners={refreshOwners}
                            setRefresOwners={setRefresOwners}
                            isprincipalowner={isPrincipalOwner}
                          />
                        )}

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
                              <Spinner
                                color="black"
                                size="sm"
                                className="m-1"
                              />
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

                  {isAllowed && (
                    <CardButton
                      className="font-weight-500 mr-2 btn-sm px-3"
                      title="Client Share"
                      variant="success"
                      icon={'co_present'}
                      onClick={() => setShowShareModal(true)}
                    />
                  )}

                  {isPrincipalOwner && (
                    <div className="col-lg-auto ml-1">
                      {isPermissionAllowed('contacts', 'delete') && (
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
                              {`Delete`}
                            </Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showShareModal && (
        <SendOrDownloadModal
          contact={contact}
          showModal={showShareModal}
          setShowModal={setShowShareModal}
          getProfileInfo={getProfileInfo}
          setToast={setToast}
          setColorToast={setColorToast}
          organizationId={organizationInfo.id}
          profileInfo={data}
        />
      )}

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

      <AlertWrapper>
        <Alert message={toast} setMessage={setToast} color={colorToast} />
      </AlertWrapper>
    </>
  );
};

export default Header;
