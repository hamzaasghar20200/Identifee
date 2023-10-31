import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import {
  Spinner,
  Form,
  FormGroup,
  Label,
  CardBody,
  CardFooter,
} from 'reactstrap';
import RightPanelModal from '../modal/RightPanelModal';

import roleService from '../../services/role.service';
import {
  initialCreateRoleState,
  CANCEL_LABEL,
  ROLE_CREATED,
  ERROR_ROLE_EXIST,
  ERROR_ROLE_REQUIRED,
  ADD_NEW_PROFILE_LABEL,
} from '../../utils/constants';
import stringConstants from '../../utils/stringConstants.json';
import routes from '../../utils/routes.json';
import Alert from '../Alert/Alert';
import AlertWrapper from '../Alert/AlertWrapper';
import { useForm } from 'react-hook-form';
import AutoComplete from '../AutoComplete';
import InputValidation from '../commons/InputValidation';
import { RIGHT_PANEL_WIDTH } from '../../utils/Utils';

const constants = stringConstants.settings.roles.add;

const CreateRoleModal = ({
  showModal,
  setShowModal,
  selectedItem,
  setSelectedItem,
  ...restProps
}) => {
  const usersProfileForm = {
    name: '',
    clone: '',
    description: '',
    admin_access: false,
    owner_access: false,
  };
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: usersProfileForm,
  });
  const [modified, setModified] = useState(false);
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [createRoleData, setCreateRoleData] = useState(usersProfileForm);
  const [loading, setLoading] = useState(false);

  const [searchItem, setSearchItem] = useState({
    search: '',
  });
  const history = useHistory();

  // Handler of Modal close
  const onHandleCloseModal = () => {
    reset(
      setCreateRoleData({
        name: '',
        clone: '',
        description: '',
      })
    );
    setModified(false);
    setErrorMessage(null);
    setSuccessMessage(null);
    setCreateRoleData(initialCreateRoleState);
    setShowModal(false);
    setSelectedItem('');
  };

  // Create role service
  const createNewRole = async (newRole, cloneId) => {
    setSuccessMessage(null);
    await roleService
      .CreateRole(newRole)
      .then(async (response) => {
        const permissions = await roleService.getPermissionsByRole(cloneId);
        await roleService.updatePermissions(response.id, permissions);
        setSuccessMessage(ROLE_CREATED);
        setTimeout(() => {
          history.push(`${routes.roles}/${response.id}`);
        }, 1000);
      })
      .catch(() => {
        setErrorMessage(ERROR_ROLE_EXIST);
      });
    setShowModal(false);
    reset(
      setCreateRoleData({
        name: '',
        clone: '',
        description: '',
      })
    );
  };

  // Form basic validations
  useEffect(() => {
    modified &&
      createRoleData.name === '' &&
      setErrorMessage(ERROR_ROLE_REQUIRED);
  }, [createRoleData]);

  // Capture form input changes
  const onInputChange = (e) => {
    const { name, value } = e.target || {};
    setCreateRoleData({
      ...createRoleData,
      [name]: value,
    });
    setModified(true);
  };

  // Handler of submit
  const handleCreate = async () => {
    delete createRoleData.clone;
    const clonedRole = selectedItem || roles[0];
    setIsLoading(true);
    const newRole = {
      ...createRoleData,
      admin_access: clonedRole.admin_access,
      owner_access: clonedRole.owner_access,
    };
    setCreateRoleData(newRole);
    await createNewRole(newRole, clonedRole.id);
    setSelectedItem('');
    setIsLoading(false);
    setIsRedirecting(true);
  };

  const stateChange = (e) => {
    setSearchItem({
      ...searchItem,
      search: e.target.value,
    });
  };
  const getRoles = async (count) => {
    setLoading(true);
    const result = await roleService.GetRoles(searchItem);
    setRoles(result.data);
    setLoading(false);
  };
  useEffect(() => {
    getRoles();
  }, [searchItem]);
  useEffect(() => {
    getRoles();
  }, []);
  const fieldInFields = (item) => {
    setSelectedItem(item);
    setValue('clone', item);
  };
  return (
    <RightPanelModal
      showModal={showModal}
      setShowModal={() => setShowModal(false)}
      showOverlay={true}
      containerBgColor={'pb-0'}
      containerWidth={RIGHT_PANEL_WIDTH}
      containerPosition={'position-fixed'}
      headerBgColor="bg-gray-5"
      Title={
        <div className="d-flex py-2 align-items-center text-capitalize">
          <h3 className="mb-0">{ADD_NEW_PROFILE_LABEL}</h3>
        </div>
      }
    >
      <CardBody>
        <AlertWrapper>
          <Alert
            color="danger"
            message={errorMessage}
            setMessage={setErrorMessage}
          />
          <Alert
            color="success"
            message={successMessage}
            setMessage={setSuccessMessage}
          />
        </AlertWrapper>
        <Form>
          <FormGroup>
            <Label htmlFor="name">{constants.name}</Label>
            <InputValidation
              type="input"
              name="name"
              id="name"
              required
              value={createRoleData.name}
              register={register}
              validationConfig={{
                required: `Name is required.`,
                onChange: onInputChange,
              }}
              errors={errors}
              placeholder={constants.name}
            />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="clone">{constants.clone}</Label>
            <AutoComplete
              placeholder="Search for Profile"
              data={roles}
              customKey="name"
              id={'clone'}
              loading={loading}
              onHandleSelect={(item) => fieldInFields(item)}
              selected={selectedItem ? selectedItem.name : roles[0]?.name}
              onChange={stateChange}
              showIcon
              validationConfig={{
                required: `Clone is required.`,
                onChange: fieldInFields,
              }}
              register={register}
              errors={errors}
              {...restProps}
            />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="description">{constants.description}</Label>
            <textarea
              type="text"
              name="description"
              rows={4}
              id="description"
              className="form-control"
              value={createRoleData.description}
              placeholder={constants.description}
              onChange={onInputChange}
            ></textarea>
          </FormGroup>
        </Form>
      </CardBody>
      <CardFooter className="px-3 text-right">
        <button
          className="btn btn-sm btn-white"
          data-dismiss="modal"
          data-uw-styling-context="true"
          onClick={onHandleCloseModal}
        >
          {CANCEL_LABEL}
        </button>
        {isRedirecting ? (
          <>
            <Spinner className={`text-primary spinner-grow-xs`} />
            <span className={`text-primary`}>{constants.redirecting}</span>
          </>
        ) : (
          <button
            type="button"
            className="btn btn-sm btn-primary ml-lg-2"
            data-uw-styling-context="true"
            onClick={handleSubmit(handleCreate)}
          >
            {isLoading ? (
              <Spinner className="spinner-grow-xs" />
            ) : (
              <span>Save</span>
            )}
          </button>
        )}
      </CardFooter>
    </RightPanelModal>
  );
};

export default CreateRoleModal;
