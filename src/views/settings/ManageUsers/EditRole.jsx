import { useContext, useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';

import {
  Card,
  CardForm,
  CardHeader,
  CardBlock,
  CardContentCustom,
  CardSection,
  CardSideCustom,
  CardTitle,
  CardSubtitle,
  CardSubContent,
  CardButton,
  List,
  Item,
  ItemAvatar,
  ItemUser,
  ItemActions,
  SwitchInput,
} from '../../../components/layouts/CardLayout';
import Alert from '../../../components/Alert/Alert';
import roleService from '../../../services/role.service';
import userService from '../../../services/user.service';
import stringConstants from '../../../utils/stringConstants.json';
import permissions from '../../../utils/permissions';
import { isAlphanumeric, isModuleAllowed } from '../../../utils/Utils';
import Avatar from '../../../components/Avatar';
import AlertWrapper from '../../../components/Alert/AlertWrapper';
import { PermissionsContext } from '../../../contexts/permissionContext';
import { Col, Row } from 'reactstrap';
import { Form, FormCheck } from 'react-bootstrap';
import { CANCEL_LABEL, NAME_INVITED_USER } from '../../../utils/constants';
import MaterialIcon from '../../../components/commons/MaterialIcon';
import TooltipComponent from '../../../components/lesson/Tooltip';
import _, { capitalize } from 'lodash';
import { useTenantContext } from '../../../contexts/TenantContext';
import AutoComplete from '../../../components/AutoComplete';
import DeleteConfirmationModal from '../../../components/modal/DeleteConfirmationModal';
import { trainingPermissions } from '../../../utils/trainingPermissions';

const constants = stringConstants.settings.roles.edit;

const permissionList = permissions.permissionList;

const role = {
  name: '',
  description: '',
  id: '',
  isAdmin: false,
};

const buttons = {
  save: {
    title: constants.saveRole,
    variant: 'primary',
  },
  remove: {
    title: constants.remove,
    variant: 'outline-danger',
  },
  add: {
    title: constants.add,
    variant: 'outline-primary',
  },
};

const switches = {
  admin: {
    isAdmin: {
      id: 'sw-is-admin',
      label: constants.isAdmin,
    },
  },
  owner: {
    isOwner: {
      id: 'sw-is-owner',
      label: constants.isOwner,
    },
  },
};

const EditRoles = () => {
  const history = useHistory();
  const [removeModal, setRemoveModal] = useState(false);
  const [roleData, setRoleData] = useState(role);
  const [searchUser, setSearchUser] = useState({});
  const [usersData, setUsersData] = useState([]);
  const [userSelection, setUserSelection] = useState([{}]);
  const [initialRoleUsers, setInitialRoleUsers] = useState([{}]);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [, setInputSearchError] = useState({});
  const [ownerAccessSwitch, setOwnerAccessSwitch] = useState(false);
  const [permissionSwitches, setpermissionSwitches] = useState();
  const { permissionChanges, setPermissionChanges } =
    useContext(PermissionsContext);

  const [permissions, setPermissions] = useState([...permissionList]);
  const [permissionsDropdown, setPermissionsDropdown] = useState('');
  const { tenant } = useTenantContext();
  const onInputChange = (e) => {
    const { name, value } = e.target || {};
    setRoleData({
      ...roleData,
      [name]: value,
    });
  };
  const alphanumericError = (input) => {
    const msgError = 'Only alphanumeric characters are allowed';
    if (input === 'search') {
      setInputSearchError({ error: true, msg: msgError });
      setTimeout(() => setInputSearchError({ error: false, msg: '' }), 3500);
    }
  };
  const onInputSearch = (e) => {
    const { value } = e.target || {};
    isAlphanumeric(value)
      ? setSearchUser({
          ...searchUser,
          search: value,
        })
      : alphanumericError(`search`);
  };

  const roleId = useParams();
  const deleteUserItem = async (itemIndex) => {
    const updatedUsers = userSelection.filter(
      (item, index) => index !== itemIndex
    );
    setUserSelection(updatedUsers);
  };
  // Update role service
  const updateRole = () => {
    return new Promise((resolve, reject) => {
      roleData.id = roleId.id;
      roleData.isOwner = ownerAccessSwitch || false;

      userSelection.length > 0 &&
        userSelection.forEach(async (user) => {
          const checkIfExist = initialRoleUsers.some(
            (item) => item.id === user.id
          );
          if (!checkIfExist) {
            const userUpdate = {
              roleId: roleId.id,
              first_name: user?.first_name,
              last_name: user?.last_name,
              avatar: user?.avatar,
              status: user?.status,
            };

            userService
              .updateUserInfoById(user.id, userUpdate)
              .catch((err) => console.log(err));
          }
        });
      initialRoleUsers.length > 0 &&
        initialRoleUsers.forEach(async (user) => {
          const checkIfExist = userSelection.some(
            (item) => item.id === user.id
          );
          if (!checkIfExist) {
            const userUpdate = {
              roleId: null,
              first_name: null,
              last_name: null,
              avatar: null,
            };

            userService
              .updateUserInfoById(user.id, userUpdate)
              .catch((err) => console.log(err));
          }
        });

      setInitialRoleUsers(userSelection);

      return roleService.updateRole(roleData).then(resolve).catch(reject);
    });
  };

  const getRoleById = () => {
    const roleById = roleService.getRoleById(roleId.id);
    roleById &&
      roleById.then((roleResult) => {
        setRoleData({
          name: roleResult.name || '',
          description: roleResult.description || '',
          id: roleResult.id || '',
        });
        setOwnerAccessSwitch(roleResult.owner_access || '');
      });
  };

  const getRoleUsers = async () => {
    const response = await userService
      .getUsers({ roleId: roleId.id }, { limit: 20 })
      .catch((err) => console.log(err));

    const roleUsers = response.data.users;

    const roleUsersList = roleUsers.map((user) => {
      const roleUsersItem = {
        name: `${
          user.first_name !== null ? user.first_name : NAME_INVITED_USER
        } ${user.last_name !== null ? user.last_name : ''}`,
        email: user.email,
        avatar: user.avatar,
        id: user.id,
        status: user?.status,
        roleId: user.roleId,
        first_name: user.first_name,
        last_name: user.last_name,
      };
      return roleUsersItem;
    });
    setUserSelection(roleUsersList);
    setInitialRoleUsers(roleUsersList);
  };

  const getRolePermissions = async () => {
    const rolePermissions = await roleService
      .getPermissionsByRole(roleId.id)
      .catch((err) => console.log(err));

    const permissionsCollection = rolePermissions.filter((item) => {
      return item.collection;
    });

    const groupedPermission = _.groupBy(permissionsCollection, 'collection');

    const loadedPermissions = Object.keys(groupedPermission).map((key) => {
      const inner = groupedPermission[key]; // array
      const innerPermssion = {};
      innerPermssion.name = key;
      innerPermssion.label = capitalize(key);
      innerPermssion.group = inner.map((perm) => {
        return {
          name: perm.action,
          label: capitalize(perm.action),
          isChecked: true,
          permissions: [
            {
              label: capitalize(perm.action),
              collection: perm.collection,
              action: perm.action,
            },
          ],
        };
      });
      return innerPermssion;
    });

    const permissionJson = [...permissions];
    permissionJson.forEach((permission) => {
      permission.inner_permissions.forEach((permCat) => {
        const permFound = loadedPermissions.find(
          (f) => f.name === permCat.name
        );
        if (permFound) {
          const groupItems = permFound.group.map((m) => m.name);
          permCat.group.forEach((m2) => {
            m2.isChecked = groupItems.indexOf(m2.name) > -1;
          });
        }
      });
    });
    setPermissions(permissionJson);
    setpermissionSwitches(permissionsCollection);
  };

  useEffect(() => {
    getRoleById();
    getRoleUsers();
    getRolePermissions();
  }, []);
  const getUsers = async () => {
    const searchResults = await userService
      .getUsers(
        {},
        {
          page: 1,
          limit: 10,
        }
      )
      .catch((err) => console.log(err));

    const { data } = searchResults || {};
    setUsersData(data?.users);
  };
  useEffect(() => {
    getUsers();
  }, []);
  useEffect(() => {
    if (ownerAccessSwitch) setOwnerAccessSwitch(true);
  }, [ownerAccessSwitch]);

  const handleSubmit = async () => {
    setIsLoading(true);
    await updateRole();
    await roleService.updatePermissions(roleId.id, [...permissionSwitches]);
    await getRolePermissions();
    setIsLoading(false);
    setToast(constants.roleUpdateSuccess);
    setPermissionChanges(!permissionChanges);
    handleDropdownPermission('');
  };

  const handleDeleteProfile = async () => {
    try {
      await roleService.deleteRole(roleId.id);
      history.goBack();
    } catch (error) {
      setToast(constants.roleRemoveFailed);
    }
  };

  const handleSwitchEvent = async (e, permissionGroup, permissionsCategory) => {
    const isChecked = e.target.checked;
    const newPermissionGroup = {
      collection: permissionGroup.permissions[0].collection,
      action: permissionGroup.name,
    };

    // update permissions category group
    const updatedGroup = permissionsCategory.group.map((group) => ({
      ...group,
      isChecked:
        group.name === permissionGroup.name
          ? !group.isChecked
          : group.isChecked,
    }));

    const updatedPermissions = [...permissions].map((perm) => ({
      ...perm,
      inner_permissions: [...perm.inner_permissions].map((permCat) => ({
        ...permCat,
        group:
          permCat.name === permissionsCategory.name
            ? updatedGroup
            : permCat.group,
      })),
    }));
    setPermissions(updatedPermissions);
    if (isChecked) {
      let newPermissionsData = [...permissionSwitches, newPermissionGroup];
      if (newPermissionGroup?.collection === 'lessons') {
        const course = {
          collection: 'courses',
          action: newPermissionGroup?.action,
        };
        const categories = {
          collection: 'categories',
          action: newPermissionGroup?.action,
        };
        newPermissionsData = [
          ...permissionSwitches,
          newPermissionGroup,
          course,
          categories,
        ];
      }
      setpermissionSwitches(newPermissionsData);
    } else {
      if (
        permissionGroup?.name === 'view' &&
        newPermissionGroup?.collection !== 'prospects'
      ) {
        const updatedCheckedPermissions = permissionSwitches?.filter(
          (permissionCheck) => {
            return permissionCheck.collection !== permissionsCategory?.name;
          }
        );
        const updatedGroup = permissionsCategory.group.map((group) => ({
          ...group,
          isChecked: false,
        }));
        const updatedPermissions = [...permissions].map((perm) => ({
          ...perm,
          inner_permissions: [...perm.inner_permissions].map((permCat) => ({
            ...permCat,
            group:
              permCat.name === permissionsCategory.name
                ? updatedGroup
                : permCat.group,
          })),
        }));
        setPermissions(updatedPermissions);
        setpermissionSwitches(updatedCheckedPermissions);
        setPermissionsDropdown('');
      } else {
        let updatedSwitches = permissionSwitches.filter(
          (f) =>
            f.collection !== newPermissionGroup.collection ||
            f.action !== newPermissionGroup.action
        );
        if (newPermissionGroup.collection === 'lessons') {
          permissionSwitches.forEach((switchItem) => {
            if (
              switchItem.collection === 'courses' ||
              switchItem.collection === 'categories'
            ) {
              updatedSwitches = permissionSwitches.filter(
                (item) =>
                  (item.collection !== 'courses' ||
                    item.action !== newPermissionGroup.action) &&
                  (item.collection !== 'lessons' ||
                    item.action !== newPermissionGroup.action) &&
                  (item.collection !== 'categories' ||
                    item.action !== newPermissionGroup.action)
              );
            }
          });
        }
        setpermissionSwitches(updatedSwitches);
      }
    }
    if (updatedGroup.every((item) => !item.isChecked)) {
      handleDropdownPermission('');
    }
  };

  const handlePermissionCategoryChange = async (
    permission,
    permissionCategory
  ) => {
    // now each permission object has inner_permissions array which is being rendered in UI, so we have to update that
    // in order to reflect in state/UI
    // instead of using .isChecked, you've started using permissionSwitches in value of toggle
    const updatedGroup = permissionCategory?.group.map((group) => ({
      ...group,
      isChecked: !permissionCategory.isChecked,
    }));
    const updatedInnerPermissions = [...permission.inner_permissions].map(
      (permCat) => ({
        ...permCat,
        isChecked:
          permissionCategory.name === permCat.name
            ? !permissionCategory.isChecked
            : permCat.isChecked,
        group:
          permissionCategory.name === permCat.name
            ? updatedGroup
            : permCat.group,
      })
    );

    // once we have inner_permissions updated we need to updated its parent too.
    const updatedPermissions = [...permissions].map((perm) => ({
      ...perm,
      inner_permissions:
        perm.name === permission.name
          ? updatedInnerPermissions
          : perm.inner_permissions,
    }));
    setPermissions(updatedPermissions);
    const collection = permission.inner_permissions.find((item) => {
      return item.name === permissionCategory.name;
    });
    const action = collection?.group?.filter((item) => {
      return item.name;
    });
    const permissionCheckUnCheck = permissionSwitches?.find((item) => {
      return item.collection === permissionCategory.name;
    });
    let updatedCheckedPermissions = [];
    if (permissionCategory.isChecked) {
      updatedCheckedPermissions = permissionSwitches?.filter(
        (permissionCheck) => {
          return (
            permissionCheck.collection !== permissionCheckUnCheck.collection
          );
        }
      );
      setpermissionSwitches(updatedCheckedPermissions);
      handleTraining(updatedCheckedPermissions);
      handleDropdownPermission('');
    } else {
      const arr = [];
      const permissionArray = action.map((group) => {
        const permissionChecked = {
          collection: group.permissions[0].collection,
          action: group.permissions[0].action,
        };
        return permissionChecked;
      });
      if (permissionCategory.name === 'deals') {
        const getContactCollection = permission.inner_permissions.find(
          (item) => item.name === 'contacts'
        );
        const getProductCollection = permission.inner_permissions.find(
          (item) => item.name === 'products'
        );
        const getNoteCollection = permission.inner_permissions.find(
          (item) => item.name === 'notes'
        );
        if (
          !permissionArray.some(
            (item) =>
              item.collection === getContactCollection?.name &&
              item.action === getContactCollection?.group[0].name
          ) &&
          !permissionArray.some(
            (item) =>
              item.collection === getProductCollection?.name &&
              item.action === getProductCollection?.group[0].name
          ) &&
          !permissionArray.some(
            (item) =>
              item.collection === getNoteCollection?.name &&
              item.action === getNoteCollection?.group[0].name
          )
        ) {
          arr.push(
            {
              collection: getContactCollection?.name,
              action: getContactCollection?.group[0].name,
            },
            {
              collection: getProductCollection?.name,
              action: getProductCollection?.group[0].name,
            },
            {
              collection: getNoteCollection?.name,
              action: getNoteCollection?.group[0].name,
            }
          );
        }
      } else if (permissionCategory.name === 'activities') {
        const getContactCollection = permission.inner_permissions.find(
          (item) => item.name === 'contacts'
        );
        const getDealCollection = permission.inner_permissions.find(
          (item) => item.name === 'deals'
        );
        const getNoteCollection = permission.inner_permissions.find(
          (item) => item.name === 'notes'
        );
        // Check if the objects are not already in the array before pushing
        if (
          !permissionArray.some(
            (item) =>
              item.collection === getContactCollection?.name &&
              item.action === getContactCollection?.group[0].name
          ) &&
          !permissionArray.some(
            (item) =>
              item.collection === getDealCollection?.name &&
              item.action === getDealCollection?.group[0].name
          ) &&
          !permissionArray.some(
            (item) =>
              item.collection === getNoteCollection?.name &&
              item.action === getNoteCollection?.group[0].name
          )
        ) {
          arr.push(
            {
              collection: getContactCollection?.name,
              action: getContactCollection?.group[0].name,
            },
            {
              collection: getDealCollection?.name,
              action: getDealCollection?.group[0].name,
            },
            {
              collection: getNoteCollection?.name,
              action: getNoteCollection?.group[0].name,
            }
          );
        }
      }
      const allPermissionsData = [
        ...permissionSwitches,
        ...permissionArray,
        ...arr,
      ];
      if (permissionCategory?.name === 'lessons') {
        handleTraining(allPermissionsData);
      }
      setpermissionSwitches(allPermissionsData);
    }
  };

  const handleTraining = (allPermissionsData) => {
    if (
      allPermissionsData.every((item) => item.collection !== 'courses') &&
      allPermissionsData.every((item) => item.collection !== 'categories')
    ) {
      const allowedActions = ['edit', 'delete', 'view', 'create'];

      const isAllowedActionExists = allPermissionsData.some(
        (permission) =>
          permission.collection === 'lessons' &&
          allowedActions.includes(permission.action)
      );

      if (!isAllowedActionExists) {
        allPermissionsData = allPermissionsData.filter(
          (permission) =>
            permission.collection !== 'courses' &&
            permission.collection !== 'categories'
        );
      }
      const newCourse = allowedActions
        .map((action) => ({
          collection: 'courses',
          action: isAllowedActionExists ? action : '',
        }))
        .filter((obj) => obj.collection !== '' && obj.action !== '');

      const newCategory = allowedActions
        .map((action) => ({
          collection: 'categories',
          action: isAllowedActionExists ? action : '',
        }))
        .filter((obj) => obj.collection !== '' && obj.action !== '');

      setpermissionSwitches([
        ...allPermissionsData,
        ...newCategory,
        ...newCourse,
      ]);
    }
  };
  const handleDropdownPermission = (item) => {
    if (permissionsDropdown) {
      setPermissionsDropdown('');
    } else if (!permissionsDropdown) {
      setPermissionsDropdown(item);
    }
  };
  const handleSwtichCheck = (isChecked) => {
    const updatedPermissions = [...permissionList];
    updatedPermissions.forEach((permission) => {
      permission.inner_permissions.forEach((permCategory) => {
        permCategory.isChecked = isChecked;
        permCategory.group.forEach((group) => {
          group.isChecked = isChecked;
        });
      });
    });
    setPermissions(updatedPermissions);
  };

  const handleOwnerSwitch = async () => {
    setpermissionSwitches('');
    setOwnerAccessSwitch(!ownerAccessSwitch);
    if (!ownerAccessSwitch) {
      const allPermission = permissionList?.flatMap((_) => {
        return _.inner_permissions?.flatMap((_) => {
          return _.group?.flatMap((_) => {
            return _.permissions?.flatMap((_) => {
              return {
                collection: _.collection,
                action: _.action,
              };
            });
          });
        });
      });
      const trainingData = trainingPermissions?.flatMap((_) => {
        return _.group?.flatMap((_) => {
          return _.permissions?.flatMap((_) => {
            return {
              collection: _.collection,
              action: _.action,
            };
          });
        });
      });
      const addTrainingPermission = [...allPermission, ...trainingData];
      setpermissionSwitches(addTrainingPermission);
      handleSwtichCheck(true);
    } else {
      setpermissionSwitches([]);
      handleSwtichCheck(false);
    }
  };
  const handleSelected = (item) => {
    const arr = [...userSelection];
    arr.push(item);
    setUserSelection(arr);
    setSearchUser('');
  };
  return (
    <>
      <AlertWrapper>
        <Alert message={toast} setMessage={setToast} color="success" />
      </AlertWrapper>
      <DeleteConfirmationModal
        showModal={removeModal}
        setShowModal={setRemoveModal}
        itemsConfirmation={[roleData]}
        itemsReport={[]}
        event={handleDeleteProfile}
        setSelectedCategories={() => {}}
        description={
          stringConstants.deleteConfirmationModal.deleteProfileMessage
        }
      />
      <Card>
        <CardHeader>
          <CardTitle>{constants.title}</CardTitle>
          <div>
            {initialRoleUsers?.length < 1 && (
              <CardButton
                title={buttons.remove.title}
                variant={'danger'}
                onClick={() => setRemoveModal(true)}
                className="btn-sm mr-2"
              />
            )}
            <CardButton
              title={CANCEL_LABEL}
              variant={'success'}
              onClick={() => history.goBack()}
              className="btn-sm mr-2"
            />
            <CardButton
              title={buttons.save.title}
              variant={buttons.save.variant}
              onClick={handleSubmit}
              isLoading={isLoading}
              className="btn-sm ms-2"
            />
          </div>
        </CardHeader>
        <CardForm wrapInContainer={false}>
          <CardSection endLine>
            <CardBlock>
              <Form.Group as={Row} className="my-2">
                <Col xs={2}>
                  <Form.Label>
                    <h5>{constants.name}</h5>
                  </Form.Label>
                </Col>
                <Col xs={10}>
                  <Form.Control
                    type="text"
                    name={`name`}
                    value={roleData.name}
                    onChange={onInputChange}
                  />
                </Col>
              </Form.Group>
              <Form.Group as={Row} className="my-2">
                <Col xs={2}>
                  <Form.Label>
                    <h5>{constants.description}</h5>
                  </Form.Label>
                </Col>
                <Col xs={10}>
                  <textarea
                    name={`description`}
                    placeholder="description"
                    rows={4}
                    className="form-control"
                    value={roleData.description}
                    onChange={onInputChange}
                  ></textarea>
                </Col>
              </Form.Group>
            </CardBlock>
          </CardSection>
          <CardSection>
            <CardContentCustom>
              <CardSubtitle endLine>{constants.users}</CardSubtitle>
              <CardSubContent>
                <AutoComplete
                  placeholder="Search for users"
                  data={usersData}
                  customKey="name"
                  id={'clone'}
                  onHandleSelect={(item) => handleSelected(item)}
                  onChange={onInputSearch}
                  showIcon
                />
                <List>
                  {userSelection
                    .filter((value) => Object.keys(value).length !== 0)
                    .map((user, index) => (
                      <Item id={`user-${index}`} key={index}>
                        <ItemAvatar>
                          <Avatar user={user} classModifiers="mr-2" />
                        </ItemAvatar>

                        <ItemUser name={user.name} email={user.email} />
                        <ItemActions>
                          <a
                            onClick={(e) => {
                              deleteUserItem(index);
                            }}
                            className="cursor-pointer"
                          >
                            <TooltipComponent title={'Remove'}>
                              <MaterialIcon
                                icon={'delete'}
                                clazz="text-danger"
                              />
                            </TooltipComponent>
                          </a>
                        </ItemActions>
                      </Item>
                    ))}
                  {userSelection.filter(
                    (value) => Object.keys(value).length !== 0
                  ).length < 1 && (
                    <p className="text-muted text-center">{`No users`}</p>
                  )}
                </List>
              </CardSubContent>
            </CardContentCustom>
            <CardSideCustom>
              <CardSubtitle endLine>{constants.adminPermissions}</CardSubtitle>
              <CardSubContent>
                <SwitchInput
                  id={switches.owner.isOwner.id}
                  label={switches.owner.isOwner.label}
                  checked={ownerAccessSwitch}
                  onChange={() => handleOwnerSwitch()}
                />
              </CardSubContent>
              {permissions.length > 0 &&
                permissions.map((permission, i) => (
                  <div key={`permissions${i}`}>
                    <h5 className={`${i === 1 ? 'mt-4' : ''}`}>
                      {permission.name}
                    </h5>
                    {permission.inner_permissions.length > 0 &&
                      permission.inner_permissions.map(
                        (permissionsCategory) => {
                          if (
                            isModuleAllowed(
                              tenant.modules,
                              permissionsCategory.tenantModule
                            )
                          ) {
                            const isContactsAndCreateExist =
                              permissionSwitches?.some(
                                (item) =>
                                  item.collection === 'contacts' &&
                                  item.action === 'create'
                              );
                            return (
                              <>
                                <Row
                                  className="switch-setting-main align-items-center mx-0 pl-0"
                                  key={permissionsCategory.name}
                                >
                                  <Col md={5} className="pl-0">
                                    <h6>{permissionsCategory.label}</h6>
                                  </Col>

                                  <Col md={7}>
                                    <div
                                      className={
                                        ownerAccessSwitch ||
                                        (permissionsCategory.label ===
                                          'Insights' &&
                                          !ownerAccessSwitch)
                                          ? 'd-flex align-items-center pt-0 pb-2 pointer-event'
                                          : 'd-flex align-items-center pt-0 pb-2'
                                      }
                                    >
                                      <FormCheck
                                        id={permissionsCategory.label}
                                        type="switch"
                                        custom={true}
                                        className={`${
                                          ownerAccessSwitch ||
                                          (!ownerAccessSwitch &&
                                            [
                                              'Dashboards',
                                              'Insights',
                                              'Branding',
                                              'Fields',
                                              'Pipeline & Stages',
                                              'Users & Controls',
                                            ].includes(
                                              permissionsCategory.label
                                            )) ||
                                          (permissionSwitches?.some(
                                            (item) =>
                                              item.collection === 'deals'
                                          ) &&
                                            [
                                              'Contacts',
                                              'Products',
                                              'Notes',
                                            ].includes(
                                              permissionsCategory.label
                                            )) ||
                                          (permissionSwitches?.some(
                                            (item) =>
                                              item.collection === 'activities'
                                          ) &&
                                            [
                                              'Deals',
                                              'Contacts',
                                              'Notes',
                                            ].includes(
                                              permissionsCategory.label
                                            )) ||
                                          (permissionsCategory.label ===
                                            'Bulk Import' &&
                                            permissionSwitches?.some(
                                              (item) =>
                                                item.collection !== 'contacts'
                                            ))
                                            ? 'disabled'
                                            : ''
                                        }`}
                                        name={permissionsCategory.label}
                                        disabled={
                                          ownerAccessSwitch ||
                                          (!ownerAccessSwitch &&
                                            [
                                              'Dashboards',
                                              'Insights',
                                              'Branding',
                                              'Fields',
                                              'Pipeline & Stages',
                                              'Users & Controls',
                                            ].includes(
                                              permissionsCategory.label
                                            )) ||
                                          (permissionSwitches?.some(
                                            (item) =>
                                              item.collection === 'deals'
                                          ) &&
                                            [
                                              'Contacts',
                                              'Products',
                                              'Notes',
                                            ].includes(
                                              permissionsCategory.label
                                            )) ||
                                          (permissionSwitches?.some(
                                            (item) =>
                                              item.collection === 'activities'
                                          ) &&
                                            [
                                              'Deals',
                                              'Contacts',
                                              'Notes',
                                            ].includes(
                                              permissionsCategory.label
                                            )) ||
                                          (permissionsCategory.label ===
                                            'Bulk Import' &&
                                            permissionSwitches?.some(
                                              (item) =>
                                                item.collection !== 'contacts'
                                            ))
                                        }
                                        checked={
                                          (isContactsAndCreateExist &&
                                            permissionsCategory.label ===
                                              'Bulk Import') ||
                                          permissionSwitches?.find((item) => {
                                            return item.collection ===
                                              permissionsCategory.name
                                              ? (permissionsCategory.isChecked = true)
                                              : (permissionsCategory.isChecked = false);
                                          })
                                        }
                                        onChange={() =>
                                          handlePermissionCategoryChange(
                                            permission,
                                            permissionsCategory
                                          )
                                        }
                                      />
                                      <div>
                                        {permissionsCategory.group.length > 0 &&
                                          permissionsCategory.isChecked && (
                                            <div
                                              className="switch-setting-1"
                                              onClick={() =>
                                                handleDropdownPermission(
                                                  permissionsCategory.name
                                                )
                                              }
                                            >
                                              {permissionsCategory.isChecked &&
                                                permissionsCategory.group.map(
                                                  (permissionGroup, index) => {
                                                    permissionSwitches?.find(
                                                      (item) => {
                                                        return permissionsCategory.name ===
                                                          item.collection &&
                                                          item.action ===
                                                            permissionGroup.name
                                                          ? (permissionGroup.isChecked = true)
                                                          : (permissionGroup.isChecked = false);
                                                      }
                                                    );
                                                    return (
                                                      <>
                                                        {permissionGroup.isChecked && (
                                                          <div className="abc">
                                                            <span className="text-capitalize">
                                                              {
                                                                permissionGroup.label
                                                              }
                                                            </span>
                                                          </div>
                                                        )}
                                                      </>
                                                    );
                                                  }
                                                )}
                                            </div>
                                          )}
                                        {permissionsCategory.group.length > 0 &&
                                          permissionsCategory.name ===
                                            permissionsDropdown && (
                                            <div className="switch-setting shadow">
                                              {permissionsCategory.group.map(
                                                (permissionGroup) => {
                                                  return (
                                                    <>
                                                      <label
                                                        className="d-block text-capitalize"
                                                        htmlFor={
                                                          permissionGroup.name
                                                        }
                                                      >
                                                        <input
                                                          id={
                                                            permissionGroup.name
                                                          }
                                                          type="checkbox"
                                                          disabled={
                                                            (permissionSwitches?.some(
                                                              (item) =>
                                                                item.collection ===
                                                                'deals'
                                                            ) &&
                                                              [
                                                                'Contacts',
                                                                'Products',
                                                                'Notes',
                                                              ].includes(
                                                                permissionsCategory.label
                                                              ) &&
                                                              permissionGroup.label ===
                                                                'View') ||
                                                            (permissionSwitches?.some(
                                                              (item) =>
                                                                item.collection ===
                                                                'activities'
                                                            ) &&
                                                              [
                                                                'Deals',
                                                                'Contacts',
                                                                'Notes',
                                                              ].includes(
                                                                permissionsCategory.label
                                                              ) &&
                                                              permissionGroup.label ===
                                                                'View')
                                                          }
                                                          checked={permissionSwitches?.find(
                                                            (item) => {
                                                              return permissionsCategory.name ===
                                                                item.collection &&
                                                                item.action ===
                                                                  permissionGroup.name
                                                                ? (permissionGroup.isChecked = true)
                                                                : (permissionGroup.isChecked = false);
                                                            }
                                                          )}
                                                          onChange={(e) =>
                                                            handleSwitchEvent(
                                                              e,
                                                              permissionGroup,
                                                              permissionsCategory
                                                            )
                                                          }
                                                        />
                                                        <span>
                                                          {
                                                            permissionGroup.label
                                                          }
                                                        </span>
                                                      </label>
                                                    </>
                                                  );
                                                }
                                              )}
                                            </div>
                                          )}
                                      </div>
                                    </div>
                                  </Col>
                                </Row>
                              </>
                            );
                          } else {
                            return '';
                          }
                        }
                      )}
                  </div>
                ))}
            </CardSideCustom>
          </CardSection>
        </CardForm>
      </Card>
    </>
  );
};

export default EditRoles;
