import { useForm } from 'react-hook-form';
import React, { useEffect, useState } from 'react';
import RightSlidingDrawer from '../../modal/RightSlidingDrawer';
import { Actions } from '../fields.constants';
import ModalTitleWithSection from '../ModalTitleWithSection';
import { Form, FormCheck } from 'react-bootstrap';
import { Col, Row } from 'reactstrap';
import Asterick from '../../commons/Asterick';
import InputValidation from '../../commons/InputValidation';
import ButtonIcon from '../../commons/ButtonIcon';
import { CHOOSE_IMAGE_FILE } from '../../../utils/constants';
import DragDropUploadFile from '../../commons/DragDropUploadFile';
import DropdownSelect from '../../DropdownSelect';
import { CHECKLIST_ACTIONS } from '../../../utils/checklist.constants';

const DrawerHeader = ({ mode, section }) => (
  <h3 className="mb-0">
    <ModalTitleWithSection
      title={
        mode === Actions.Edit ? 'Edit Checklist Item' : 'Add Checklist Item'
      }
      section={section.toLowerCase() === 'deals' ? 'Pipelines' : section}
    />
  </h3>
);

const DrawerBody = ({
  openModal,
  editedField,
  setEditedField,
  handleValueChange,
  errors,
  register,
  handleSubmit,
  handleSave,
}) => {
  const onRemoveFile = () => {
    setEditedField({ ...editedField, attachment: null });
  };

  const onLoadFile = (e) => {
    const loadedFile = e.target.files[0];
    setEditedField({
      ...editedField,
      attachment: loadedFile ? { name: loadedFile.name } : null,
    });
  };

  return (
    <div className="py-3">
      <Form onSubmit={handleSubmit(handleSave)}>
        <Row className="align-items-center mt-2">
          <Col md={3}>
            <h5>
              Title <Asterick />{' '}
            </h5>
          </Col>
          <Col md={9}>
            <InputValidation
              name="title"
              type="input"
              autoFocus={true}
              placeholder="Title"
              value={editedField?.title || ''}
              validationConfig={{
                required: true,
                inline: true,
                onChange: handleValueChange,
              }}
              errors={errors}
              register={register}
            />
          </Col>
        </Row>
        <Row className="align-items-start mt-3">
          <Col md={3} className="align-items-start">
            <h5 className="mb-0">Attachment</h5>
          </Col>
          <Col md={9}>
            <DragDropUploadFile
              file={editedField?.attachment}
              setFile={(loadedFile) => {
                setEditedField({
                  ...editedField,
                  attachment: loadedFile ? { name: loadedFile.name } : null,
                });
              }}
              name="checklistFile"
              onLoadFile={onLoadFile}
              allowedFormat=".pdf,.doc,.xlsx"
              chooseFileText={CHOOSE_IMAGE_FILE}
              onRemoveFile={onRemoveFile}
              isLoading={false}
            />
          </Col>
        </Row>
        <Row className="align-items-center mt-0">
          <Col md={3}>
            <h5 className="mb-0 text-nowrap">Action</h5>
          </Col>
          <Col md={9}>
            <DropdownSelect
              data={CHECKLIST_ACTIONS}
              onHandleSelect={(item) => {
                setEditedField({
                  ...editedField,
                  action: item,
                });
              }}
              select={editedField?.action?.name || CHECKLIST_ACTIONS[0]?.name}
              selectIcon={
                editedField?.action?.icon || CHECKLIST_ACTIONS[0]?.icon
              }
              typeMenu="custom"
              placeholder="Choose Action"
              customClasses={'w-100 overflow-y-auto max-h-300'}
            />
          </Col>
        </Row>
        <Row className="align-items-center mt-1">
          <Col md={3}>
            <h5 className="mb-0">Mandatory</h5>
          </Col>
          <Col md={9}>
            <FormCheck
              id="fieldMandatory"
              type="switch"
              className="form-control border-0"
              custom={true}
              name="fieldMandatory"
              checked={editedField?.mandatory}
              onChange={(e) =>
                setEditedField({ ...editedField, mandatory: e.target.checked })
              }
            />
          </Col>
        </Row>
      </Form>
    </div>
  );
};

const DrawerFooter = ({ loader, handleSubmit, handleSave, handleClose }) => {
  return (
    <div className="d-flex align-items-center justify-content-end gap-2">
      <ButtonIcon color="white" onclick={handleClose} label="Cancel" />
      <ButtonIcon
        color="primary"
        loading={loader}
        onclick={handleSubmit(handleSave)}
        label="Save"
      />
    </div>
  );
};

const AddEditChecklistItem = ({
  field,
  openModal,
  setOpenModal,
  handleConfirmModal,
  mode = 'add',
  section,
  loader,
  options,
}) => {
  const defaultFieldObject = {
    title: '',
    document: null,
  };
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: defaultFieldObject,
  });
  const [editedField, setEditedField] = useState({});

  useEffect(() => {
    if (openModal) {
      setEditedField(field);
    }
  }, [openModal]);
  const handleValueChange = (e) => {
    const { value } = e.target;
    setEditedField({ ...editedField, title: value });
    setValue('title', value);
  };

  const handleSave = async () => {
    const newField = { ...editedField };
    handleConfirmModal(newField, mode);
    handleClose();
  };

  const handleClose = () => {
    setOpenModal(false);
    reset(defaultFieldObject);
  };

  return (
    <RightSlidingDrawer
      open={openModal}
      withCard={true}
      toggleDrawer={() => {
        setOpenModal(false);
      }}
      header={<DrawerHeader mode={mode} section={section} />}
      body={
        <DrawerBody
          editedField={editedField}
          setEditedField={setEditedField}
          mode={mode}
          openModal={openModal}
          handleSubmit={handleSubmit}
          options={options}
          errors={errors}
          register={register}
          handleSave={handleSave}
          handleValueChange={handleValueChange}
        />
      }
      footer={
        <DrawerFooter
          editedField={editedField}
          setOpenModal={setOpenModal}
          loader={loader}
          handleSubmit={handleSubmit}
          handleSave={handleSave}
          handleClose={handleClose}
        />
      }
      containerWidth={550}
    />
  );
};

export default AddEditChecklistItem;
