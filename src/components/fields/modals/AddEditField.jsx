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
import DropdownSelect from '../../DropdownSelect';
import PicklistOptions from '../PicklistOptions';
import { useModuleContext } from '../../../contexts/moduleContext';

const DrawerHeader = ({ mode, section }) => {
  const { moduleMap } = useModuleContext();
  return (
    <h3 className="mb-0">
      {moduleMap.organization && (
        <ModalTitleWithSection
          title={mode === Actions.Edit ? 'Edit Field' : `Create Custom Field`}
          section={section
            .replace(/Contacts/g, moduleMap.contact.plural)
            .replace(/Companies/g, moduleMap.organization.plural)
            .replace(/Products/g, moduleMap.product.plural)
            .replace(/Tasks/g, moduleMap.task.plural)
            .replace(/Calls/g, moduleMap.call.plural)
            .replace(/Events/g, moduleMap.event.plural)
            .replace(/Deals/g, moduleMap.deal.plural)}
        />
      )}
    </h3>
  );
};

const DrawerBody = ({
  field,
  editedField,
  handleValueChange,
  errors,
  register,
  mode,
  handleSubmit,
  handleSave,
  setEditedField,
  options,
  listOptions,
  setListOptions,
  subOption,
  setSubOption,
}) => (
  <div className="py-3">
    <Form onSubmit={handleSubmit(handleSave)}>
      <Row className="align-items-center pb-3">
        <Col md={3}>
          <h5 className="mb-0">
            Field Label <Asterick />{' '}
          </h5>
        </Col>
        <Col md={9}>
          {field.isCustom ? (
            <InputValidation
              name="name"
              type="input"
              autoFocus={true}
              placeholder="Field Label"
              disabled={false}
              value={editedField?.key || ''}
              errorDisplay="position-absolute error-show-right"
              validationConfig={{
                required: true,
                inline: true,
                onChange: handleValueChange,
              }}
              errors={errors}
              register={register}
            />
          ) : (
            <InputValidation
              name="name"
              type="input"
              autoFocus={true}
              placeholder="Field Label"
              disabled={mode === Actions.Edit}
              value={editedField?.key || ''}
              errorDisplay="position-absolute error-show-right"
              validationConfig={{
                required: true,
                inline: true,
                onChange: handleValueChange,
              }}
              errors={errors}
              register={register}
            />
          )}
        </Col>
      </Row>

      <Row className="align-items-center pb-3">
        <Col md={3}>
          <h5 className="mb-0">Field Type</h5>
        </Col>
        <Col md={9}>
          <DropdownSelect
            data={options}
            onHandleSelect={(item) =>
              setEditedField({
                ...editedField,
                field_type: item.field_type,
                value_type: item.value_type,
              })
            }
            select={
              editedField?.field_type === 'PICKLIST_MULTI'
                ? 'PICKLIST'
                : editedField?.field_type
            }
            typeMenu="custom"
            placeholder="Field Type"
            customClasses={'w-100 overflow-y-auto max-h-300'}
            disabled={mode === Actions.Edit}
          />
        </Col>
      </Row>

      {editedField.field_type === 'PICKLIST' ||
      editedField.field_type === 'PICKLIST_MULTI' ? (
        <Row className="align-items-center">
          <Col md={3}>
            <h5 className="mb-0">Sub Type</h5>
          </Col>
          <Col md={9}>
            <DropdownSelect
              data={[{ name: 'Single Select' }, { name: 'Multi-Select' }]}
              onHandleSelect={(item) => {
                setSubOption(item.name);
              }}
              select={subOption}
              placeholder="Select Picklist Type"
              customClasses={'w-100 overflow-y-auto max-h-300'}
              disabled={mode === Actions.Edit}
            />
          </Col>
        </Row>
      ) : (
        ''
      )}

      <Row className="align-items-center mt-2">
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
      {editedField.field_type === 'PICKLIST' ||
      editedField.field_type === 'PICKLIST_MULTI' ? (
        <>
          <div className="py-3">
            <h5 className="mb-0  mt-2">Picklist Options</h5>
            <PicklistOptions
              listOptions={listOptions}
              setListOptions={setListOptions}
              errors={errors}
              register={register}
            />
          </div>
          <h5 className="mb-0  mt-4 mb-2">Set Default Value</h5>
          <DropdownSelect
            data={listOptions.filter((item) => item?.name?.trim() !== '')}
            onHandleSelect={(item) => {
              const list = listOptions.map((val) => {
                if (val.id !== item.id) {
                  return { ...val, default: false };
                } else {
                  return { ...val, default: true };
                }
              });
              setListOptions(list);
            }}
            select={
              listOptions.filter((item) => item.default === true)[0]?.name ||
              '-None-'
            }
            placeholder="Select Default Value"
            customClasses={'w-100 overflow-y-auto max-h-300'}
          />
        </>
      ) : (
        ''
      )}
    </Form>
  </div>
);

const DrawerFooter = ({ loader, handleSave, handleClose }) => {
  return (
    <div className="d-flex align-items-center justify-content-end gap-2">
      <ButtonIcon color="white" onclick={handleClose} label="Cancel" />
      <ButtonIcon
        color="primary"
        loading={loader}
        onclick={handleSave}
        label="Save"
      />
    </div>
  );
};

const AddEditField = ({
  field,
  openModal,
  setOpenModal,
  handleConfirmModal,
  mode = 'add',
  section,
  loader,
  options,
  setOptions,
  subOption,
  setSubOption,
}) => {
  const defaultFieldObject = {
    key: '',
    field_type: '',
    value_type: '',
    mandatory: false,
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
  const [editedField, setEditedField] = useState({ ...field });
  const [listOptions, setListOptions] = useState(field?.value_option || []);

  useEffect(() => {
    setEditedField(field);
    setValue('name', field?.key);
    setListOptions(field?.value_option || []);
  }, [field]);

  const handleValueChange = (e) => {
    const { value } = e.target;
    setEditedField({ ...editedField, key: value });
    setValue('name', value);
  };

  const handleSave = async () => {
    const success = await handleConfirmModal(
      editedField,
      listOptions,
      subOption
    );
    if (success) {
      setListOptions([]);
      reset(defaultFieldObject);
    }
  };

  const handleClose = () => {
    setOpenModal(false);
    setListOptions([]);
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
          field={field}
          mode={mode}
          handleSubmit={handleSubmit}
          options={options}
          errors={errors}
          register={register}
          handleSave={handleSave}
          handleValueChange={handleValueChange}
          listOptions={listOptions}
          setListOptions={setListOptions}
          subOption={subOption}
          setSubOption={setSubOption}
        />
      }
      footer={
        <DrawerFooter
          editedField={editedField}
          setOpenModal={setOpenModal}
          loader={loader}
          handleSave={handleSave}
          handleClose={handleClose}
        />
      }
      containerWidth={500}
    />
  );
};

export default AddEditField;
