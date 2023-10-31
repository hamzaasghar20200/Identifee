import React, { useEffect, useState } from 'react';
import { useProfileContext } from '../../contexts/profileContext';
import { useTenantContext } from '../../contexts/TenantContext';
import { capitalize, groupBy } from 'lodash';
import fieldService from '../../services/field.service';
import MaterialIcon from '../commons/MaterialIcon';
import DeleteConfirmationModal from '../modal/DeleteConfirmationModal';
import { Card, CardBody, CardFooter, CardHeader, Col, Row } from 'reactstrap';
import ButtonIcon from '../commons/ButtonIcon';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { TransitionGroup } from 'react-transition-group';
import Collapse from '@mui/material/Collapse';
import NoDataFound from '../commons/NoDataFound';
import MoreActions from '../MoreActions';
import FieldItem from './FieldItem';
import { Messages, Actions, FIELD_NEW_KEY, reorder } from './fields.constants';
import SimpleModalCreation from '../modal/SimpleModalCreation';
import { overflowing } from '../../utils/Utils';
import { useForm } from 'react-hook-form';
import { Form } from 'react-bootstrap';
import Asterick from '../commons/Asterick';
import InputValidation from '../commons/InputValidation';
import FieldInformationSection from './FieldInformationSection';
import FieldSkeletonLoader from './FieldSkeletonLoader';
import CustomizeFields from './modals/CustomizeFields';
import NoDataFoundTitle from './NoDataFoundTitle';
import ModalTitleWithSection from './ModalTitleWithSection';
import { useModuleContext } from '../../contexts/moduleContext';
import AddEditField from './modals/AddEditField';
import { moduleConstants } from '../../utils/constants';
import ModulesServices from '../../services/modules.service';
import TooltipComponent from '../lesson/Tooltip';
const QuickCreatePreferenceModal = ({
  data,
  fieldSection,
  openModal,
  setOpenModal,
  setSuccessMessage,
  setErrorMessage,
}) => {
  const [loader, setLoader] = useState(false);
  const [loaderQuickPref, setLoaderQuickPref] = useState(false);
  const [fields, setFields] = useState([]);

  const sortByPreferred = (a, b) => b.preferred - a.preferred;

  const onHandleDragEnd = (result) => {
    if (!result.destination) {
      return;
    }

    const items = reorder(
      [...fields],
      result.source.index,
      result.destination.index
    );
    setFields(items);
  };

  const loadFields = async () => {
    setLoader(true);
    try {
      const { data } = await fieldService.getFields(fieldSection.type);
      setFields(data.sort(sortByPreferred));
    } catch (err) {
      console.log(err);
    } finally {
      setLoader(false);
    }
  };
  useEffect(() => {
    loadFields();
  }, []);

  const SavePreferenceButton = () => {
    return (
      <div className="d-flex align-items-center">
        <span>Save Preference</span>
      </div>
    );
  };

  const handleSavePreference = async () => {
    setLoaderQuickPref(true);
    try {
      await fieldService.createQuickPrefFields(
        fieldSection.type,
        fields.map((field, index) => ({
          id: field.id,
          order: index + 1,
          preferred: field.isFixed ? true : field.preferred,
        }))
      );
      setSuccessMessage(Messages.FieldQuickCreatePref);
    } catch (err) {
      console.log(err);
      setErrorMessage(Messages.FieldQuickCreatePrefError);
    } finally {
      setLoaderQuickPref(false);
    }
    setOpenModal(false);
  };

  const updateFields = (currentField) => {
    const updatedFields = [...fields].map((fs) =>
      fs.id === currentField.id ? { ...currentField } : { ...fs }
    );
    setFields(updatedFields.sort(sortByPreferred));
  };

  return (
    <SimpleModalCreation
      modalTitle={
        <ModalTitleWithSection
          title="Quick Create Fields"
          section={fieldSection.name
            .replace(/Contacts/g, data.contact.plural)
            .replace(/Companies/g, data.organization.plural)
            .replace(/Product/g, data.product.plural)
            .replace(/Task/g, data.task.plural)
            .replace(/Call/g, data.call.plural)
            .replace(/Event/g, data.event.plural)
            .replace(/Deal/g, data.deal.plural)}
        />
      }
      handleSubmit={fields.length > 0 && handleSavePreference}
      saveButtonStyle="btn btn-primary btn-sm"
      saveButton={<SavePreferenceButton />}
      open={openModal}
      bankTeam={false}
      isLoading={loaderQuickPref}
      bodyClassName={`overflow-y-auto ${
        fields.length > 0 ? 'pipeline-board-edit-form' : ''
      }`}
      onHandleCloseModal={() => {
        overflowing();
        setOpenModal(!openModal);
      }}
    >
      <p>
        Choose the fields that needs to be shown in the Quick Create popup when
        you try to create a new {fieldSection.type} from a lookup field.
      </p>

      {loader ? (
        <div className="my-1 px-3">
          <FieldSkeletonLoader rows={5} />
        </div>
      ) : (
        <>
          {fields.length > 0 ? (
            <DragDropContext onDragEnd={onHandleDragEnd}>
              <Droppable droppableId={`${fieldSection.name}Fields`}>
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef}>
                    <TransitionGroup appear={true}>
                      {fields?.map((field, index) => (
                        <Collapse key={field.id}>
                          <FieldItem
                            fieldSection={{
                              ...fieldSection,
                              isDraggable: true,
                            }}
                            withCheckBoxes={true}
                            field={field}
                            index={index}
                            key={index}
                            updateFields={updateFields}
                          />
                        </Collapse>
                      ))}
                      {provided.placeholder}
                    </TransitionGroup>
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          ) : (
            <NoDataFound
              icon="edit_note"
              containerStyle="text-gray-search my-6 py-6"
              title={
                <NoDataFoundTitle
                  str={`No ${fieldSection.name.toLowerCase()} fields found.`}
                />
              }
            />
          )}
        </>
      )}
    </SimpleModalCreation>
  );
};

const EditModuleModal = ({
  capitalizeFirstLetter,
  setSuccessMessage,
  setErrorMessage,
  getModuleNames,
  setLoader,
  field,
  name,
  openModal,
  singleValue,
  pluralValue,
  modalData,
  modalFieldsData,
  setOpenModal,
  mode = 'add',
  section,
  loader,
  setModalData,
  options,
  setOptions,
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
    formState: { errors },
  } = useForm({
    defaultValues: defaultFieldObject,
  });
  const [saveLoading, setSaveLoading] = useState(false);
  let data;
  const updateFieldsValue = async () => {
    setSaveLoading(true);
    data = await ModulesServices.upsertModule({
      name: section,
      singularName: capitalizeFirstLetter(singleValue.singularName),
      pluralName: capitalizeFirstLetter(pluralValue.pluralName),
    });
    if (data.status === 200) {
      setSaveLoading(true);
      setSuccessMessage('Module Name Updated');
      getModuleNames();
      setOpenModal(!openModal);
    } else {
      setSaveLoading(true);
      setErrorMessage('Operation Failed');
      setOpenModal(!openModal);
    }
  };
  const handleSave = () => {
    updateFieldsValue();
    setLoader(false);
    reset(defaultFieldObject);
  };
  return (
    <SimpleModalCreation
      modalTitle="Edit Module Name"
      open={openModal}
      bankTeam={false}
      isLoading={saveLoading}
      handleSubmit={handleSubmit((d) => handleSave(d))}
      onHandleCloseModal={() => {
        overflowing();
        reset(defaultFieldObject);
        modalFieldsData();
        setOpenModal(!openModal);
      }}
    >
      <Form onSubmit={handleSubmit(handleSave)}>
        <Row className="align-items-center pb-3">
          <Col md={3}>
            <h5 className="mb-0">
              Plural <Asterick />{' '}
            </h5>
          </Col>
          <Col md={9}>
            <InputValidation
              name="plural"
              required="true"
              classNames="text-capitalize"
              type="input"
              placeholder="Field Label"
              value={pluralValue.pluralName || ''}
              errorDisplay="position-absolute error-show-right"
              validationConfig={{
                required: true,
                inline: true,
                onChange: (e) =>
                  setModalData({
                    singularName: singleValue.singularName,
                    pluralName: e.target.value,
                  }),
              }}
              errors={errors}
              register={register}
            />
          </Col>
        </Row>
        <Row className="align-items-center pb-3">
          <Col md={3}>
            <h5 className="mb-0">
              Singular <Asterick />{' '}
            </h5>
          </Col>
          <Col md={9}>
            <InputValidation
              name="singular"
              required="true"
              type="input"
              classNames="text-capitalize"
              placeholder="Field Label"
              value={singleValue.singularName || ''}
              errorDisplay="position-absolute error-show-right"
              validationConfig={{
                required: true,
                inline: true,
                onChange: (e) =>
                  setModalData({
                    pluralName: pluralValue.pluralName,
                    singularName: e.target.value,
                  }),
              }}
              errors={errors}
              register={register}
            />
          </Col>
        </Row>
      </Form>
    </SimpleModalCreation>
  );
};

const FieldSectionFooter = ({
  fields,
  fieldSection,
  isEditingMode,
  onHandleAdd,
  updateFieldSections,
}) => {
  const [customFields, setCustomFields] = useState({ used: 0, total: 0 });

  useEffect(() => {
    if (fields.length) {
      setCustomFields({
        used: fields.filter((f) => f.isCustom && f.usedField).length,
        total: fields.filter((f) => f.isCustom).length || 0,
      });
    }
  }, [fields]);

  return (
    <>
      {fieldSection.isDraggable ? (
        <>
          <button
            type="button"
            className={`btn btn-primary btn-sm`}
            onClick={() => {
              updateFieldSections(Actions.Update, {
                ...fieldSection,
                isDraggable: false,
              });
            }}
          >
            Save
          </button>
          <button
            className="btn btn-white btn-sm ml-2"
            onClick={() => {
              updateFieldSections(Actions.Update, {
                ...fieldSection,
                isDraggable: false,
              });
            }}
          >
            Cancel
          </button>
        </>
      ) : (
        <div className="d-flex justify-content-between align-items-center">
          <ButtonIcon
            color="link"
            icon=""
            onclick={() => onHandleAdd(Actions.Add, fieldSection)}
            label="Customize Fields"
            classnames="border-0 fs-7 px-0 text-primary"
          />
          <div className="d-flex fs-7 text-gray-dark align-items-center">
            <div>
              {' '}
              <span className="green-dot"></span> Used Custom Fields:{' '}
            </div>
            <div className="font-weight-semi-bold ml-1">
              {customFields.used}/{customFields.total}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const FieldSectionHeader = ({
  moduleName,
  rearrange,
  onRearrange,
  openModuleModal,
  setOpenModuleModal,
  handleQuickCreatePreference,
  handleUnusedFields,
}) => {
  const actionItems = [
    {
      id: 'edit',
      icon: 'category',
      name: 'Rearrange Fields',
      className: 'd-none',
    },
    {
      id: 'add',
      icon: 'settings',
      name: 'Quick Create Preference',
    },
  ];
  const onHandleRemove = () => {
    handleUnusedFields();
  };

  const onHandleEdit = () => {
    onRearrange(!rearrange);
  };

  const onHandleAdd = () => {
    handleQuickCreatePreference();
  };
  const onHandleName = () => {
    setOpenModuleModal(!openModuleModal);
  };

  return (
    <div className="d-flex align-items-center action-items">
      {moduleName && (
        <TooltipComponent title="Edit Module Name">
          <a
            onClick={() => {
              setOpenModuleModal(!openModuleModal);
            }}
            className={`icon-hover-bg mr-1 cursor-pointer`}
          >
            <MaterialIcon icon="edit" clazz="text-gray-700 font-size-lg" />{' '}
          </a>
        </TooltipComponent>
      )}
      <a className={`icon-hover-bg cursor-pointer`}>
        <MoreActions
          icon="more_vert"
          items={actionItems}
          onHandleNameEdit={() => onHandleName(null)}
          onHandleRemove={() => onHandleRemove(null)}
          onHandleEdit={() => onHandleEdit(null)}
          onHandleAdd={() => onHandleAdd(null)}
          toggleClassName="w-auto p-0 h-auto"
          menuWidth={220}
        />
      </a>
    </div>
  );
};

const FieldSection = ({
  fieldSection,
  updateFieldSections,
  setSuccessMessage,
  setErrorMessage,
  options,
  setOptions,
}) => {
  const [loader, setLoader] = useState(false);
  const [fields, setFields] = useState([]);
  const [allFields, setAllFields] = useState([]);
  const [fieldsBySection, setFieldsBySection] = useState([]);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openMoveModal, setOpenMoveModal] = useState(false);
  const [openDefaultMoveModal, setOpenDefaultMoveModal] = useState(false);
  const [openCustomizeFieldsModal, setOpenCustomizeFieldsModal] =
    useState(false);
  const [openModuleModal, setOpenModuleModal] = useState(false);
  const [selectedField, setSelectedField] = useState({});
  const [mode, setMode] = useState('add');
  const [componentsToDelete, setComponentsToDelete] = useState([]);
  const [loaderField, setLoaderField] = useState(false);
  const { profileInfo } = useProfileContext();
  const { tenant } = useTenantContext();
  const [isEditingMode, setIsEditingMode] = useState(false);
  const [openQuickCreatePreferenceModal, setOpenQuickCreatePreferenceModal] =
    useState(false);
  const [customFields, setCustomFields] = useState({ used: 0, total: 0 });
  const [openAddModal, setOpenAddModal] = useState(false);
  const [subOption, setSubOption] = useState('Single Select');
  const [modalData, setModalData] = useState();
  const { moduleName, getModuleNames, moduleMap } = useModuleContext();
  const [pluralNameValue, setPluralName] = useState();
  const [, setSingularName] = useState();
  let tempData;
  useEffect(() => {
    modalFieldsData();
  }, [moduleName]);

  const modalFieldsData = () => {
    if (moduleName) {
      tempData = moduleConstants.reduce((accumulator, item) => {
        if (item.name === fieldSection.type) {
          accumulator.name = item.name;
          accumulator.pluralName = item.pluralName;
          accumulator.singularName = item.singularName;
        }
        return accumulator;
      }, {});
      const indexed = moduleName.data.findIndex(
        (nameItem) => nameItem.name === tempData.name
      );
      if (indexed !== -1) {
        tempData = {
          name: moduleName.data[indexed].name,
          singularName: moduleName.data[indexed].singularName,
          pluralName: moduleName.data[indexed].pluralName,
        };
      }
      setModalData(tempData);
      setPluralName(tempData);
      setSingularName(tempData);
    }
  };
  const groupBySection = (fieldsList) => {
    setFieldsBySection(groupBy(fieldsList, 'section'));
  };

  const updateFields = (newFields) => {
    setAllFields([...newFields]);
    setFields(newFields);
    setCustomFields({
      used: newFields.filter((f) => f.isCustom && f.usedField).length,
      total: newFields.filter((f) => f.isCustom).length || 0,
    });
  };

  const loadFields = async () => {
    setLoader(true);
    try {
      const { data } = await fieldService.getFields(fieldSection.type, {
        usedField: true,
        isCustom: true,
      });
      // if there are no fields then create default
      if (!data.length) {
        try {
          if (tenant?.id !== 'root') {
            const defaultFields = await fieldService.createDefaultFields(
              fieldSection.type
            );
            // only show usedField: true when default fields are created for the first time.
            const usedFieldsList = defaultFields.filter((f) => f.usedField);
            updateFields(usedFieldsList);
            groupBySection(usedFieldsList);
          }
        } catch (e) {
          console.log(e);
          setErrorMessage(
            Messages.FieldDefaultError.replace(
              '$$type$$',
              capitalize(fieldSection.type)
            )
          );
        } finally {
          setLoader(false);
        }
      } else {
        updateFields(data);
        groupBySection(data);
      }
    } catch (err) {
      console.log(err);
      setErrorMessage(
        Messages.FieldLoadError.replace(
          '$$type$$',
          capitalize(fieldSection.type)
        )
      );
    } finally {
      setLoader(false);
    }
  };

  const onHandleMove = (field) => {
    setMode(Actions.Move);
    setIsEditingMode(false);
    setSelectedField(field);
    setComponentsToDelete([{ ...field, title: field.key }]);
    setOpenMoveModal(true);
  };

  const onHandleMoveToDefault = (field) => {
    setMode(Actions.Move);
    setIsEditingMode(false);
    setSelectedField(field);
    setComponentsToDelete([{ ...field, title: field.key }]);
    setOpenDefaultMoveModal(true);
  };

  const onHandleUp = (fieldSection, index) => {
    if (index > 0) {
      const newFieldsSection = [...fieldSection.fields];
      const newIndex = index - 1;
      const temp = newFieldsSection[newIndex];
      newFieldsSection[newIndex] = newFieldsSection[index];
      newFieldsSection[index] = temp;
      setFieldsBySection({
        ...fieldsBySection,
        [fieldSection.name]: newFieldsSection,
      });
      const currentField = fieldSection.fields[index];
      const updatedItems = [...allFields];
      const currentFieldIndex = updatedItems.findIndex(
        (f) => f.id === currentField.id
      );
      const movedItem = updatedItems.splice(currentFieldIndex, 1)[0];
      updatedItems.splice(currentFieldIndex - 1, 0, movedItem);
      setAllFields(updatedItems);
    }
  };
  const onHandleDown = (fieldSection, index) => {
    if (index < fields.length - 1) {
      const newFields = [...fieldSection.fields];
      const newIndex = index + 1;
      const temp = newFields[newIndex];
      newFields[newIndex] = newFields[index];
      newFields[index] = temp;
      setFieldsBySection({
        ...fieldsBySection,
        [fieldSection.name]: newFields,
      });
      const currentField = fieldSection.fields[index];
      const updatedItems = [...allFields];
      const currentFieldIndex = updatedItems.findIndex(
        (f) => f.id === currentField.id
      );
      const movedItem = updatedItems.splice(currentFieldIndex, 1)[0];
      updatedItems.splice(currentFieldIndex + 1, 0, movedItem);
      setAllFields(updatedItems);
    }
  };

  const onHandleRemove = (field) => {
    setMode(Actions.Remove);
    setIsEditingMode(false);
    setSelectedField(field);
    setComponentsToDelete([{ ...field, title: field.key }]);
    setOpenDeleteModal(true);
  };

  const getPicklistOptions = (field) => {
    let modifiedList = null;
    if (
      field?.value_option !== null &&
      field?.value_option !== undefined &&
      field?.value_option?.length > 2
    ) {
      modifiedList = field.value_option.map((item) => {
        const { value, default: isDefault } = item;
        const uniqueId = `item${Date.now()}-${Math.floor(
          Math.random() * 10000
        )}`;
        return { id: uniqueId, name: value, default: isDefault };
      });
    }

    return modifiedList;
  };

  const onHandleEdit = (field) => {
    setIsEditingMode(false);
    setSelectedField({
      ...field,
      type: fieldSection.type,
      value_option: getPicklistOptions(field),
    });
    if (field?.field_type === 'PICKLIST') setSubOption('Single Select');
    else if (field?.field_type === 'PICKLIST_MULTI')
      setSubOption('Multi_Select');
    setMode(Actions.Edit);
    setOpenAddModal(true);
  };

  const onHandleAdd = () => {
    setIsEditingMode(false);
    setSubOption('Single Select');
    setSelectedField({
      field_type: 'TEXT',
      value_type: 'string',
      id: FIELD_NEW_KEY,
      columnName: '',
      type: fieldSection.type,
    });
    setMode(Actions.Add);
    setOpenCustomizeFieldsModal(true);
  };

  const onHandleDragEnd = (result) => {
    if (!result.destination) {
      return;
    }

    const items = reorder(
      [...fields],
      result.source.index,
      result.destination.index
    );
    updateFields(items);
    groupBySection(items);
  };

  const handleConfirmDeleteField = async () => {
    try {
      await fieldService.deleteField(selectedField.id);
      setSuccessMessage(Messages.FieldRemoved);
      setOpenDeleteModal(false);
      const updatedFields = [...fields].filter(
        (s) => s.id !== selectedField.id
      );
      updateFields(updatedFields);
      groupBySection(updatedFields);
      setComponentsToDelete([]);
    } catch (err) {
      console.log(err);
      setErrorMessage(Messages.FieldUpdateError);
    }
  };

  const handleConfirmMoveField = async () => {
    try {
      const updatingField = {
        ...selectedField,
        usedField: false, // moving to unused not deleting it
      };
      await fieldService.updateField(selectedField.id, updatingField);
      setSuccessMessage(Messages.FieldUnused);
      setOpenMoveModal(false);
      const updatedFields = [...fields].filter(
        (s) => s.id !== selectedField.id
      );
      updateFields(updatedFields);
      groupBySection(updatedFields);
      setComponentsToDelete([]);
    } catch (err) {
      console.log(err);
      setErrorMessage(Messages.FieldUpdateError);
    }
  };

  const handleConfirmMoveFieldToDefault = async () => {
    try {
      const updatingField = {
        ...selectedField,
        usedField: true, // moving to unused not deleting it
      };
      await fieldService.updateField(selectedField.id, updatingField);
      setSuccessMessage(Messages.FieldMoved);
      setOpenDefaultMoveModal(false);
      const fieldIndex = fields.findIndex((f) => f.id === updatingField.id);
      let updatedFields = [];
      if (fieldIndex > -1) {
        updatedFields = [
          ...fields.map((f) =>
            f.id === updatingField.id ? { ...updatingField } : f
          ),
        ];
      } else {
        updatedFields = [...fields, updatingField];
      }
      updateFields(updatedFields);
      groupBySection(updatedFields);
      setComponentsToDelete([]);
    } catch (err) {
      console.log(err);
      setErrorMessage(Messages.FieldUpdateError);
    }
  };

  const updateAndCloseModal = (updatedFields) => {
    updateFields(updatedFields);
    groupBySection(updatedFields);
    setIsEditingMode(false);
    setOpenAddModal(false);
  };

  const handleConfirmUpdateField = async (
    updatedField,
    listOptions,
    subOption
  ) => {
    setLoaderField(true);
    if (!updatedField.key || updatedField?.key === '') {
      setErrorMessage(Messages.FieldLabelEmpty);
      setLoaderField(false);
      return false;
    }
    if (
      updatedField.field_type === 'PICKLIST' ||
      updatedField.field_type === 'PICKLIST_MULTI'
    ) {
      const hasEmptyField = listOptions.some(
        (option) => option.name.trim() === ''
      );
      if (hasEmptyField) {
        setErrorMessage('Error: Empty options are not allowed.');
        setLoaderField(false);
        return false;
      }
      const nameSet = new Set();
      let hasDuplicates = false;
      for (const option of listOptions) {
        if (option.name !== '' && nameSet.has(option.name.trim())) {
          hasDuplicates = true;
          break;
        }
        nameSet.add(option.name);
      }
      if (hasDuplicates) {
        setErrorMessage('Error: Duplicate options are not allowed.');
        setLoaderField(false);
        return false;
      }
      const modifiedList = listOptions.map((item) => {
        const { name, default: isDefault } = item;
        return { value: name, default: isDefault };
      });
      subOption === 'Single Select'
        ? (updatedField = {
            ...updatedField,
            name: 'Picklist',
            description:
              'Picklist field is used to store a selected value from value_option.',
            field_type: 'PICKLIST',
          })
        : (updatedField = {
            ...updatedField,
            name: 'Picklist Multi-Select',
            description:
              'Picklist Multi field is used to store a multiple selected value from value_option.',
            field_type: 'PICKLIST_MULTI',
          });
      updatedField = { ...updatedField, value_option: modifiedList };
    } else {
      updatedField = { ...updatedField, value_option: null };
    }
    let updatedFields = [];
    if (updatedField.id === FIELD_NEW_KEY) {
      // create field in api
      delete updatedField.id;
      try {
        const data = await fieldService.createField({
          ...updatedField,
          isCustom: true,
          usedField: true,
          created_by: profileInfo.id,
          section: 'Additional Information', // wow API guys
        });
        updatedFields = [...fields, data];
        setSuccessMessage(Messages.Field);
        updateAndCloseModal(updatedFields);
        return true;
      } catch (err) {
        console.log(err);
        updatedField.id = FIELD_NEW_KEY;
        err.response.status === 409
          ? setErrorMessage(Messages.FieldExists)
          : setErrorMessage(Messages.FieldError);
        return false;
      } finally {
        setLoaderField(false);
      }
    } else {
      try {
        const data = await fieldService.updateField(updatedField.id, {
          ...updatedField,
          created_by: profileInfo.id,
        });
        updatedFields = [
          ...fields.map((f) => (f.id === updatedField.id ? { ...data } : f)),
        ];
        setSuccessMessage(Messages.FieldUpdated);
        updateAndCloseModal(updatedFields);
        return true;
      } catch (err) {
        console.log(err);
        err.response.status === 409
          ? setErrorMessage(Messages.FieldExists)
          : setErrorMessage(Messages.FieldError);
        return false;
      } finally {
        setLoaderField(false);
      }
    }
  };

  useEffect(() => {
    loadFields();
  }, [tenant]);

  const DeleteFieldBody = ({ text }) => {
    return (
      <div>
        <div className="d-flex justify-content-center align-items-center">
          <MaterialIcon icon="report_problem" clazz="font-size-4em" />
        </div>
        <hr />
        <h4>{text}</h4>
        <ul className="list-disc">
          {componentsToDelete.map((item) => (
            <li className="font-weight-medium ml-4" key={item?.id}>
              <p className="mb-1">{item?.title}</p>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const onHandleEditField = (field) => {
    setSelectedField({
      ...field,
      value_option: getPicklistOptions(field),
      type: fieldSection.type,
    });
    if (field?.field_type === 'PICKLIST') setSubOption('Single Select');
    else if (field?.field_type === 'PICKLIST_MULTI')
      setSubOption('Multi_Select');
    setMode(Actions.Edit);
    setOpenAddModal(true);
  };

  const onHandleAddField = () => {
    setSubOption('Single Select');
    setSelectedField({
      field_type: 'TEXT',
      value_type: 'string',
      id: FIELD_NEW_KEY,
      columnName: '',
      type: fieldSection.type,
      value_option: [
        { id: 'none', name: '-None-', default: true },
        {
          id: `item${Date.now()}-${Math.floor(Math.random() * 10000)}`,
          name: '',
          default: false,
        },
        {
          id: `item${Date.now()}-${Math.floor(Math.random() * 10000)}`,
          name: '',
          default: false,
        },
      ],
    });
    setMode(Actions.Add);
    setOpenAddModal(true);
  };

  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };
  return (
    <>
      <DeleteConfirmationModal
        showModal={openDeleteModal}
        setShowModal={setOpenDeleteModal}
        setSelectedCategories={setComponentsToDelete}
        event={handleConfirmDeleteField}
        itemsConfirmation={componentsToDelete}
        itemsReport={[]}
        customBody={
          <DeleteFieldBody text="Are you sure you want delete following custom field?" />
        }
      />
      <DeleteConfirmationModal
        showModal={openMoveModal}
        setShowModal={setOpenMoveModal}
        setSelectedCategories={setComponentsToDelete}
        event={handleConfirmMoveField}
        itemsConfirmation={componentsToDelete}
        itemsReport={[]}
        customBody={
          <DeleteFieldBody text="Are you sure you want to move following field to unused list?" />
        }
        positiveBtnText="Yes, Move"
      />
      <DeleteConfirmationModal
        showModal={openDefaultMoveModal}
        setShowModal={setOpenDefaultMoveModal}
        setSelectedCategories={setComponentsToDelete}
        event={handleConfirmMoveFieldToDefault}
        itemsConfirmation={componentsToDelete}
        itemsReport={[]}
        customBody={
          <DeleteFieldBody text="Are you sure you want to move following field to default list?" />
        }
        positiveBtnText="Yes, Move"
      />
      {openModuleModal && (
        <EditModuleModal
          capitalizeFirstLetter={capitalizeFirstLetter}
          setSuccessMessage={setSuccessMessage}
          setErrorMessage={setErrorMessage}
          setLoader={setLoader}
          openModal={openModuleModal}
          getModuleNames={getModuleNames}
          setOpenModal={setOpenModuleModal}
          mode={mode}
          modalFieldsData={modalFieldsData}
          singleValue={modalData}
          pluralValue={modalData}
          setModalData={setModalData}
          field={selectedField}
          section={fieldSection.type}
          loader={loaderField}
          options={options}
          setOptions={setOptions}
        />
      )}
      {openQuickCreatePreferenceModal && (
        <QuickCreatePreferenceModal
          openModal={openQuickCreatePreferenceModal}
          setOpenModal={setOpenQuickCreatePreferenceModal}
          fieldSection={fieldSection}
          data={moduleMap.task && moduleMap}
          setSuccessMessage={setSuccessMessage}
          setErrorMessage={setErrorMessage}
        />
      )}

      <Card className="h-100 hover-actions">
        <CardHeader className="px-3 py-2">
          <div className="d-flex align-items-center w-100 justify-content-between">
            <div>
              {pluralNameValue && (
                <h4 className="mb-0">
                  {capitalizeFirstLetter(pluralNameValue.pluralName) || ''}
                </h4>
              )}
            </div>
            <FieldSectionHeader
              fields={fields}
              moduleName={moduleName}
              modalFieldsData={modalFieldsData}
              openModuleModal={openModuleModal}
              setOpenModuleModal={setOpenModuleModal}
              type={fieldSection.name}
              rearrange={fieldSection.isDraggable}
              onRearrange={(isDraggable) => {
                updateFieldSections(Actions.Update, {
                  ...fieldSection,
                  isDraggable,
                });
              }}
              handleQuickCreatePreference={() => {
                setOpenQuickCreatePreferenceModal(true);
              }}
            />
          </div>
        </CardHeader>
        <CardBody className="py-2 px-0 overflow-y-auto">
          <>
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
                      data={moduleMap.task && moduleMap}
                      fieldSection={{ name: key, fields: fieldsBySection[key] }}
                      onHandleRemove={onHandleRemove}
                      onHandleUp={onHandleUp}
                      onHandleDown={onHandleDown}
                      onHandleEdit={onHandleEdit}
                      onHandleMove={onHandleMove}
                      onHandleDragEnd={onHandleDragEnd}
                    />
                  );
                })}
              </>
            )}
          </>
        </CardBody>
        <CardFooter className="px-3 py-2">
          <FieldSectionFooter
            fields={fields}
            fieldSection={fieldSection}
            isEditingMode={isEditingMode}
            onHandleAdd={onHandleAdd}
            updateFieldSections={updateFieldSections}
          />
        </CardFooter>
      </Card>

      <CustomizeFields
        loader={loader}
        data={moduleMap.task && moduleMap}
        pluralValue={modalData}
        customFields={customFields}
        fieldsBySection={fieldsBySection}
        fieldSection={fieldSection}
        openEditModal={openCustomizeFieldsModal}
        setOpenEditModal={setOpenCustomizeFieldsModal}
        onHandleEdit={onHandleEditField}
        onHandleAdd={onHandleAddField}
        onHandleMove={onHandleMove}
        onHandleMoveToDefault={onHandleMoveToDefault}
        onHandleRemove={onHandleRemove}
        onHandleDragEnd={onHandleDragEnd}
        onHandleUp={onHandleUp}
        onHandleDown={onHandleDown}
        parentFields={fields}
        allFields={allFields}
        setParentFields={setFields}
        fieldTypes={options}
        setFieldTypes={setOptions}
        setSuccessMessage={setSuccessMessage}
        setErrorMessage={setErrorMessage}
      />

      <AddEditField
        openModal={openAddModal}
        setOpenModal={setOpenAddModal}
        mode={mode}
        field={selectedField}
        section={fieldSection.name}
        loader={loaderField}
        handleConfirmModal={handleConfirmUpdateField}
        options={options}
        setOptions={setOptions}
        subOption={subOption}
        setSubOption={setSubOption}
      />
    </>
  );
};
export default FieldSection;
