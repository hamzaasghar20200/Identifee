import React, { useState, useEffect } from 'react';
import { Card } from 'react-bootstrap';
import groupService from '../../../../services/groups.service';
import stringConstants from '../../../../utils/stringConstants.json';
import CreateGroupModal from '../../../../components/groups/CreateGroupModal';
import Alert from '../../../../components/Alert/Alert';
import AlertWrapper from '../../../../components/Alert/AlertWrapper';
import LayoutHead from '../../../../components/commons/LayoutHead';
import DeleteConfirmationModal from '../../../../components/modal/DeleteConfirmationModal';
import { TreeViewTable } from '../../../../components/prospecting/v2/common/TreeViewTable';
import { useForm } from 'react-hook-form';
// import { isAlphanumeric } from '../../../../utils/Utils';
const constants = stringConstants.settings.groups;
// const errorAlphanumeric = stringConstants.settings.users.filters.alphanumeric;

const Groups = () => {
  const groupObj = {
    name: '',
    perant_id: '',
    description: '',
  };
  const [groupForm, setGroupForm] = useState(groupObj);
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: groupForm,
  });
  const [showDropdown, setShowDropdown] = useState(false);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [allGroups, setAllGroups] = useState([]);
  const [selectedData, setSelectedData] = useState([]);
  const [siblingAccess, setSblingAccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [deleteRoleData, setDeleteRoleData] = useState('');
  const [showUpdateGroupModal, setShowUpdateGroupModal] = useState(false);
  const [transferIdTrue, setTransferIdTrue] = useState(false);
  const [dataGet, setDataGet] = useState('');
  const [isShow, setIsShow] = useState('');
  const [isAddSingleRole, setIsAddSingleRole] = useState('');
  const [showLoading, setShowLoading] = useState(false);
  const [deleteTreeViewShow, setDeleteTreeViewShow] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const getRolue = async () => await groupService.getRolues();
  const getListGroups = async () => {
    setShowLoading(true);
    try {
      const result = await getRolue();
      setAllGroups(result);
      setShowLoading(false);
    } catch (error) {
      setErrorMessage();
    }
  };
  const handleModelShow = async (item) => {
    setTransferIdTrue(true);
    setDeleteRoleData({ ...item, title: item.name });
    setOpenModal(true);
    setShowDropdown(true);
    setDeleteTreeViewShow(true);
  };
  const handleDelete = async () => {
    if (!isShow?.id) {
      return setErrorMessage(constants.edit?.selectRoleTransfer);
    }
    try {
      await groupService.deleteGroup(deleteRoleData.id, isShow?.id);
      setOpenModal(false);
      setDeleteRoleData([]);
      setIsShow('');
      getListGroups();
      setErrorMessage(constants.delete.transfer);
    } catch (error) {
      setErrorMessage(constants.edit?.groupUpdateFailed);
    }
  };

  const handleEditModelShow = async (item) => {
    setDataGet(item);
    const roleById = await groupService.getGroupById(item?.id);
    roleById &&
      setGroupForm({
        name: roleById?.name || '',
        description: roleById?.description || '',
        id: roleById?.id || '',
        has_sibling_access: roleById.has_sibling_access || false,
        parent_id: isShow?.id || '',
        parent: roleById.parent || '',
      });
    setOpenEditModal(true);
    setValue('name', roleById?.name);
    setValue('description', roleById?.description);
    setValue('parent_id', isShow?.id);
  };

  const handleGetRoleById = async () => {
    setIsLoading(true);
    try {
      await groupService.updateGroup({
        ...groupForm,
        parent_id: isShow?.id,
      });
      setOpenEditModal(false);
      reset(
        setGroupForm({
          name: '',
          description: '',
          parent_id: '',
          has_sibling_access: '',
        })
      );
      setIsShow('');
      getListGroups();
      setDataGet('');
      setSuccessMessage(constants.edit.groupUpdateSuccess);
    } catch (error) {
      setErrorMessage(constants.edit?.groupUpdateFailed);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getListGroups(true);
  }, []);

  useEffect(() => {
    if (openModal === false) {
      getListGroups();
    }
  }, []);

  const createGroup = async (group) => {
    setIsLoading(true);
    const data = {
      name: group?.group_name,
      parent_id: isShow?.id || isAddSingleRole?.id,
      has_sibling_access: siblingAccess,
      description: group?.description,
    };
    try {
      await groupService.CreateGroup(data);
      getListGroups();
      setIsAddSingleRole('');

      setSuccessMessage(constants.create.groupCreatedSuccess);
    } catch (error) {
      setErrorMessage(constants.create?.groupCreatedFailed);
    }
    closeModal();
    setIsLoading(false);
  };

  const closeModal = async () => {
    setShowCreateGroupModal(false);
    setIsShow('');
    setDataGet('');
    setIsAddSingleRole('');
    reset(
      setGroupForm({
        name: '',
        description: '',
        parent_id: '',
        has_sibling_access: '',
      })
    );
  };
  const closeEditModal = async () => {
    setOpenEditModal(false);
    setIsShow('');
    setDataGet('');
    setIsAddSingleRole('');
    reset(
      setGroupForm({
        name: '',
        description: '',
        parent_id: '',
        has_sibling_access: '',
      })
    );
  };
  const handleCreateModalShow = () => {
    setIsAddSingleRole('');
    setShowCreateGroupModal(true);
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
      <DeleteConfirmationModal
        showModal={openModal}
        setShowModal={setOpenModal}
        setShowRolesData={setSelectedData}
        itemsConfirmation={[deleteRoleData]}
        itemsReport={[]}
        event={handleDelete}
        transferIdTrue={transferIdTrue}
        showDropdown={showDropdown}
        data={allGroups}
        setIsDropdownId={setIsShow}
        isDropdownId={isShow}
        deleteTreeViewShow={deleteTreeViewShow}
        setSelectedCategories={() => {}}
      />
      <LayoutHead
        alignTop="position-absolute -top-55"
        onHandleCreate={() => handleCreateModalShow()}
        buttonLabel={constants.edit.add}
        selectedData={selectedData}
        headingTitle=""
        dataInDB={allGroups}
        headingText=""
        onDelete={setOpenModal.bind(true)}
      />
      <Card className="mb-5">
        <Card.Body className="p-0">
          <TreeViewTable
            setUpdateGroupModal={setShowUpdateGroupModal}
            updateGroupModal={showUpdateGroupModal}
            data={allGroups}
            handleEditModelShow={handleEditModelShow}
            setShowReport={handleModelShow}
            handleGetRoleById={handleGetRoleById}
            editRoleData={groupForm}
            closeEditModal={closeEditModal}
            openEditModal={openEditModal}
            setOpenEditModal={setOpenEditModal}
            dataGet={dataGet}
            isLoading={isLoading}
            setIsDropdownId={setIsShow}
            isDropdownId={isShow}
            setShowCreateGroupModal={setShowCreateGroupModal}
            setIsAddSingleRole={setIsAddSingleRole}
            showLoading={showLoading}
            setEditRoleData={setGroupForm}
            register={register}
            handleSubmit={handleSubmit}
            reset={reset}
            setValue={setValue}
            errors={errors}
          />
        </Card.Body>
      </Card>

      <CreateGroupModal
        showModal={showCreateGroupModal}
        setShowModal={closeModal}
        data={allGroups}
        createGroup={createGroup}
        setErrorMessage={setErrorMessage}
        setIsDropdownId={setIsShow}
        setSblingAccess={setSblingAccess}
        isLoading={isLoading}
        isAddSingleRole={isAddSingleRole}
        perantId={isShow?.id || isAddSingleRole?.id}
        siblingAccess={siblingAccess}
        isDropdownId={isShow}
        onChangeDrop={(e) => (e?.target ? setAllGroups(e.target.value) : null)}
      />
    </>
  );
};

export default Groups;
