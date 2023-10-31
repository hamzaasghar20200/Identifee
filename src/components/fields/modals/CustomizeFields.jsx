import { Col, Row } from 'reactstrap';
import ButtonIcon from '../../commons/ButtonIcon';
import RightSlidingDrawer from '../../modal/RightSlidingDrawer';
import React, { useState } from 'react';
import FieldSkeletonLoader from '../FieldSkeletonLoader';
import FieldInformationSection from '../FieldInformationSection';
import UnusedFieldsList from '../UnusedFieldsList';
import fieldService from '../../../services/field.service';

const DrawerHeader = ({ fieldSection }) => {
  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };
  return (
    <h3 className="mb-0">
      Edit {capitalizeFirstLetter(fieldSection?.pluralName)} Fields
    </h3>
  );
};
const DrawerBody = ({
  loader,
  data,
  fieldsBySection,
  onHandleRemove,
  onHandleEdit,
  onHandleMove,
  onHandleMoveToDefault,
  onHandleDragEnd,
  onHandleAdd,
  fieldSection,
  customFields,
  fieldTypes,
  setFieldTypes,
  onHandleUp,
  onHandleDown,
  parentFields,
  setParentFields,
  setErrorMessage,
  setSuccessMessage,
}) => {
  return (
    <Row className="px-0 overflow-x-hidden">
      <Col md={7} className="pl-1">
        <div className="py-3">
          {loader ? (
            <div className="my-1 px-3">
              <FieldSkeletonLoader rows={5} />
            </div>
          ) : (
            <>
              {Object.keys(fieldsBySection).map((key, index) => {
                return (
                  <FieldInformationSection
                    key={index}
                    fieldSection={{
                      name: key,
                      fields: fieldsBySection[key],
                      isDraggable: false,
                    }}
                    data={data}
                    onHandleRemove={onHandleRemove}
                    onHandleEdit={onHandleEdit}
                    onHandleMove={onHandleMove}
                    onHandleUp={onHandleUp}
                    onHandleDown={onHandleDown}
                    onHandleDragEnd={onHandleDragEnd}
                    fromCustomizeFieldModal={true}
                  />
                );
              })}
            </>
          )}
        </div>
      </Col>
      <Col md={5} className="bg-gray-5 px-0">
        <div className="py-3">
          <ButtonIcon
            color="outline-primary"
            icon="add"
            onclick={onHandleAdd}
            label="Custom Field"
            classnames="btn-sm bg-white pr-3 ml-3"
          />
          <UnusedFieldsList
            fieldSection={fieldSection}
            parentFields={parentFields}
            groupBySection={fieldsBySection}
            setParentFields={setParentFields}
            setErrorMessage={setErrorMessage}
            setSuccessMessage={setSuccessMessage}
            fieldTypes={fieldTypes}
            onHandleMoveToDefault={onHandleMoveToDefault}
          />
        </div>
      </Col>
    </Row>
  );
};
const DrawerFooter = ({
  customFields,
  setOpenEditModal,
  handleConfirmModal,
  loader,
}) => {
  return (
    <div className="d-flex justify-content-between align-items-center">
      <div className="d-flex fs-8 text-gray-dark align-items-center">
        <div>
          {' '}
          <span className="green-dot"></span> Used Custom Fields:{' '}
        </div>
        <div className="font-weight-semi-bold ml-1">
          {customFields.used}/{customFields.total}
        </div>
      </div>
      <div className="d-flex align-items-center gap-2">
        <ButtonIcon
          color="white"
          onclick={() => {
            setOpenEditModal(false);
          }}
          classnames="font-weight-normal"
          label="Cancel"
        />
        <ButtonIcon
          color="primary"
          onclick={handleConfirmModal}
          loading={loader}
          label="Save"
        />
      </div>
    </div>
  );
};

const CustomizeFields = ({
  pluralValue,
  data,
  openEditModal,
  setOpenEditModal,
  fieldSection,
  allFields,
  loader,
  fieldsBySection,
  customFields,
  onHandleRemove,
  onHandleDown,
  onHandleUp,
  onHandleAdd,
  onHandleEdit,
  onHandleMove,
  onHandleMoveToDefault,
  onHandleDragEnd,
  fieldTypes,
  setFieldTypes,
  parentFields,
  setParentFields,
  setErrorMessage,
  setSuccessMessage,
}) => {
  const [savingCustom, setSavingCustom] = useState(false);
  const handleSaveCustomFieldsOrder = async () => {
    setSavingCustom(true);
    try {
      await fieldService.createQuickPrefFields(
        fieldSection.type,
        allFields.map((field, index) => ({
          id: field.id,
          order: index + 1,
          preferred: field.isFixed ? true : field.preferred,
        }))
      );
      setSuccessMessage('Fields saved successfully.');
      setOpenEditModal(false);
    } catch (err) {
      console.log(err);
      setErrorMessage('Unable to save fields.');
    } finally {
      setSavingCustom(false);
    }
    setSavingCustom(false);
  };

  return (
    <>
      <RightSlidingDrawer
        open={openEditModal}
        withCard={true}
        toggleDrawer={() => {
          setOpenEditModal(false);
        }}
        header={<DrawerHeader fieldSection={pluralValue} data={data} />}
        body={
          <DrawerBody
            loader={loader}
            data={data}
            customFields={customFields}
            fieldsBySection={fieldsBySection}
            fieldSection={fieldSection}
            openEditModal={openEditModal}
            setOpenEditModal={setOpenEditModal}
            onHandleEdit={onHandleEdit}
            onHandleAdd={onHandleAdd}
            onHandleUp={onHandleUp}
            onHandleDown={onHandleDown}
            onHandleMove={onHandleMove}
            onHandleMoveToDefault={onHandleMoveToDefault}
            onHandleRemove={onHandleMove}
            onHandleDragEnd={onHandleDragEnd}
            parentFields={parentFields}
            setParentFields={setParentFields}
            fieldTypes={fieldTypes}
            setFieldTypes={setFieldTypes}
            setSuccessMessage={setSuccessMessage}
            setErrorMessage={setErrorMessage}
          />
        }
        footer={
          <DrawerFooter
            customFields={customFields}
            setOpenEditModal={() => setOpenEditModal(false)}
            handleConfirmModal={handleSaveCustomFieldsOrder}
            loader={savingCustom}
          />
        }
      />
    </>
  );
};

export default CustomizeFields;
