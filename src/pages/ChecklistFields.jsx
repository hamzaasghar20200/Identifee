import React, { useEffect, useState } from 'react';
import {
  Card,
  CardBody,
  CardFooter,
  Col,
  FormGroup,
  Label,
  Row,
} from 'reactstrap';

import Alert from '../components/Alert/Alert';
import AlertWrapper from '../components/Alert/AlertWrapper';
import { FormCheck, FormControl } from 'react-bootstrap';
import ButtonFilterDropdown from '../components/commons/ButtonFilterDropdown';
import ButtonIcon from '../components/commons/ButtonIcon';
import MaterialIcon from '../components/commons/MaterialIcon';
import NoDataFound from '../components/commons/NoDataFound';
import NoDataFoundTitle from '../components/fields/NoDataFoundTitle';
import IdfTooltip from '../components/idfComponents/idfTooltip';
import AddEditChecklistItem from '../components/fields/modals/AddEditChecklistItem';
import TooltipComponent from '../components/lesson/Tooltip';
import { Actions } from '../components/fields/fields.constants';
import { v4 as uuidv4 } from 'uuid';
import DeleteConfirmationModal from '../components/modal/DeleteConfirmationModal';
import {
  CHECKLIST_ACTIONS,
  ChecklistFieldsTabs,
  ChecklistStatuses,
  getChecklist,
  saveChecklist,
} from '../utils/checklist.constants';
import MoreActions from '../components/MoreActions';

const tabsData = [
  {
    title: 'Internal Checklist',
    key: ChecklistFieldsTabs.Internal,
    tabId: ChecklistFieldsTabs.Internal,
  },
  {
    title: 'Client Checklist',
    key: ChecklistFieldsTabs.Client,
    tabId: ChecklistFieldsTabs.Client,
  },
];

const ChecklistOption = ({ item, editItem, removeItem }) => {
  const actionItems = [
    {
      id: 'remove',
      icon: 'delete',
      name: 'Delete',
    },
  ];
  return (
    <div className="d-flex py-1 setting-item w-100 justify-content-between gap-1 align-items-center">
      <div className="border rounded justify-content-between d-flex align-items-center gap-1 p-2 flex-fill">
        <div className="d-flex gap-1 flex-fill align-items-center">
          <TooltipComponent title={item?.action?.name}>
            <MaterialIcon icon={item?.action?.icon} />
          </TooltipComponent>
          <span>{item.title}</span>
        </div>
        <div className="d-flex align-items-center gap-1">
          <TooltipComponent title="Edit">
            <a
              onClick={editItem}
              className="cursor-pointer refresh-icon text-gray-800 icon-hover-bg"
            >
              <MaterialIcon icon="edit" />
            </a>
          </TooltipComponent>
          <a className={`icon-hover-bg refresh-icon cursor-pointer`}>
            <MoreActions
              icon="more_vert"
              items={actionItems}
              onHandleRemove={() => removeItem(item)}
              toggleClassName="w-auto p-0 h-auto"
              menuWidth={180}
            />
          </a>
        </div>
      </div>
    </div>
  );
};

const ChecklistOptions = ({
  items,
  setItems,
  setSuccessMessage,
  activeTab,
}) => {
  const [openAddModal, setOpenAddModal] = useState(false);
  const [editedField, setEditedField] = useState({});
  const [mode, setMode] = useState(Actions.Add);
  const [componentsToDelete, setComponentsToDelete] = useState([]);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [options, setOptions] = useState([]);

  const addItem = () => {
    setMode(Actions.Add);
    setEditedField({
      id: uuidv4(),
      status: ChecklistStatuses.InProgress,
      type: activeTab,
      action: CHECKLIST_ACTIONS[0],
    });
    setOpenAddModal(true);
  };
  const editItem = (item) => {
    setMode(Actions.Edit);
    setEditedField(item);
    setOpenAddModal(true);
  };

  const handleConfirmDeleteField = async () => {
    setItems([...items.filter((f) => f.id !== componentsToDelete[0].id)]);
    setComponentsToDelete([]);
    setSuccessMessage('Checklist item deleted.');
    setOpenDeleteModal(false);
  };
  const removeItem = (item) => {
    setComponentsToDelete([item]);
    setOpenDeleteModal(true);
  };
  const handleConfirm = (newItem, action) => {
    if (action === Actions.Edit) {
      setItems([
        ...items.map((f) => (f.id === newItem.id ? { ...newItem } : f)),
      ]);
      setSuccessMessage('Checklist item updated.');
    } else {
      setItems(items ? [...items, newItem] : [newItem]);
      setSuccessMessage('Checklist item created.');
    }
  };

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

  useEffect(() => {
    if (activeTab === ChecklistFieldsTabs.Client) {
      setOptions(items?.filter((it) => it.type === ChecklistFieldsTabs.Client));
    } else {
      setOptions(
        items?.filter((it) => it.type === ChecklistFieldsTabs.Internal)
      );
    }
  }, [activeTab, items]);

  return (
    <>
      <FormGroup>
        <div className="d-flex gap-1 align-items-center">
          <Label className="mb-0">Checklist items</Label>
          <ButtonIcon
            label="Add"
            icon="add_circle"
            classnames="btn-xs"
            color="outline-primary"
            onclick={addItem}
          />
        </div>
      </FormGroup>
      {options?.length ? (
        <div className="pb-2">
          {options.map((item, index) => (
            <ChecklistOption
              key={index}
              item={item}
              index={index}
              total={items.length}
              editItem={() => editItem(item)}
              setItems={setItems}
              removeItem={() => removeItem(item)}
            />
          ))}
        </div>
      ) : (
        <NoDataFound
          icon="edit_note"
          iconStyle="font-size-3em"
          containerStyle="text-gray-search my-1 py-1"
          title={<NoDataFoundTitle clazz="fs-7" str={`No checklist items.`} />}
        />
      )}
      <AddEditChecklistItem
        openModal={openAddModal}
        setOpenModal={setOpenAddModal}
        items={items}
        setItems={setItems}
        mode={mode}
        field={editedField}
        section={activeTab}
        loader={false}
        handleConfirmModal={handleConfirm}
      />
      <DeleteConfirmationModal
        showModal={openDeleteModal}
        setShowModal={setOpenDeleteModal}
        setSelectedCategories={setComponentsToDelete}
        event={handleConfirmDeleteField}
        itemsConfirmation={componentsToDelete}
        itemsReport={[]}
        customBody={
          <DeleteFieldBody text="Are you sure you want delete following checklist item?" />
        }
      />
    </>
  );
};

const renewalDateOptions = [
  { key: '30', name: '30 days prior' },
  { key: '60', name: '60 days prior' },
  { key: '90', name: '90 days prior' },
  { key: '120', name: '120 days prior' },
];
const recurringOptions = [
  { key: 'noRepeat', name: 'Does not repeat' },
  { key: 'yearly', name: 'Yearly' },
  { key: 'monthly', name: 'Monthly' },
];

const ChecklistSection = () => {
  const [activeTab, setActiveTab] = useState(ChecklistFieldsTabs.Client);
  const defaultState = {
    renewalDate: renewalDateOptions[1],
    recurring: recurringOptions[1],
    items: [],
    clientMessage: '',
    title: '',
    global: false,
    active: false,
  };
  const checklistFromStorage = getChecklist();
  const [data, setData] = useState(checklistFromStorage || defaultState);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSaveChecklist = () => {
    setSuccessMessage('Checklist saved.');
    saveChecklist({
      ...data,
      createdDate: Date.now(),
      status: ChecklistStatuses.InProgress,
    });
  };

  const handleClearItems = () => {
    setSuccessMessage('Checklist items status set to in progress.');
    saveChecklist({
      ...data,
      createdDate: Date.now(),
      status: ChecklistStatuses.InProgress,
      items: data.items.map((it) => ({
        ...it,
        status: ChecklistStatuses.InProgress,
      })),
    });
  };
  const handleDeleteChecklist = () => {
    setSuccessMessage('Checklist deleted.');
    setData(defaultState);
    saveChecklist({});
  };

  return (
    <>
      <AlertWrapper className="alert-position">
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
      <CardBody className="overflow-y-auto border-top">
        <div>
          <FormGroup>
            <Label className="mb-0 fs-7 font-weight-bold">Title</Label>
            <FormControl
              type="text"
              value={data.title}
              onChange={(e) => setData({ ...data, title: e.target.value })}
            />
          </FormGroup>
          <FormGroup>
            <div className="d-flex py-2 align-items-center justify-content-between">
              <Label className="mb-0 fs-7 font-weight-bold">Renewal Date</Label>
              <ButtonFilterDropdown
                buttonText="Select Renewal Date"
                btnToggleStyle="text-truncate min-width-200 btn-h-sm"
                options={renewalDateOptions}
                filterOptionSelected={data.renewalDate || renewalDateOptions[0]}
                handleFilterSelect={(e, item) => {
                  setData({ ...data, renewalDate: item });
                }}
              />
            </div>
          </FormGroup>
          <FormGroup>
            <div className="d-flex py-2 align-items-center justify-content-between">
              <Label className="mb-0 fs-7 font-weight-bold">Recurring</Label>
              <ButtonFilterDropdown
                buttonText="Select Recurring"
                btnToggleStyle="text-truncate min-width-200 btn-h-sm"
                options={recurringOptions}
                filterOptionSelected={data.recurring || recurringOptions[1]}
                handleFilterSelect={(e, item) => {
                  setData({ ...data, recurring: item });
                }}
              />
            </div>
          </FormGroup>
          <FormGroup>
            <Label className="mb-0 fs-7 font-weight-bold">Client Message</Label>
            <FormControl
              as="textarea"
              maxLength={500}
              aria-rowcount={4}
              rows={4}
              value={data.clientMessage}
              max={500}
              onChange={(e) =>
                setData({ ...data, clientMessage: e.target.value })
              }
            />
          </FormGroup>
          <nav
            className="modal-report-tabs bg-white w-100 nav-justified py-2 nav"
            style={{ width: 'fit-content' }}
          >
            <a
              onClick={(e) => {
                e.preventDefault();
                setActiveTab(tabsData[1].tabId);
              }}
              className={`mb-0 py-2 rounded-pill nav-item ${
                activeTab === tabsData[1].tabId
                  ? 'cursor-default active bg-primary text-white'
                  : 'cursor-pointer bg-hover-gray'
              } nav-link mr-1`}
            >
              {tabsData[1].title}
            </a>
            <a
              onClick={(e) => {
                e.preventDefault();
                setActiveTab(tabsData[0].tabId);
              }}
              className={`mb-0 rounded-pill py-2 nav-item ${
                activeTab === tabsData[0].tabId
                  ? 'cursor-default active bg-primary text-white'
                  : 'cursor-pointer bg-hover-gray'
              } nav-link mr-1`}
            >
              {tabsData[0].title}
            </a>
          </nav>
          <ChecklistOptions
            items={data.items}
            setItems={(newItems) => {
              setData({ ...data, items: newItems });
            }}
            activeTab={activeTab}
            setSuccessMessage={setSuccessMessage}
          />
          <FormGroup>
            <Row className="align-items-center py-2">
              <Col md={6}>
                <Label className="mb-0 fs-7 font-weight-bold">Global</Label>
              </Col>
              <Col md={6} className="text-right">
                <FormCheck
                  id="global"
                  type="switch"
                  custom={true}
                  name="global"
                  checked={data?.global}
                  onChange={(e) =>
                    setData({ ...data, global: e.target.checked })
                  }
                />
              </Col>
            </Row>
          </FormGroup>
          <FormGroup>
            <Row className="align-items-center py-2">
              <Col md={6}>
                <Label className="mb-0 fs-7 font-weight-bold">Active</Label>
              </Col>
              <Col md={6} className="text-right">
                <FormCheck
                  id="active"
                  type="switch"
                  custom={true}
                  name="active"
                  checked={data?.active}
                  onChange={(e) =>
                    setData({ ...data, active: e.target.checked })
                  }
                />
              </Col>
            </Row>
          </FormGroup>
        </div>
      </CardBody>
      <CardFooter className="d-flex align-items-center justify-content-between">
        <div className="d-flex gap-1 align-items-center">
          {data?.items?.length ? (
            <IdfTooltip text="This will put all checklist items back to in-progress status.">
              <ButtonIcon
                color="white"
                disabled={data.items.length === 0}
                label="Clear"
                onclick={handleClearItems}
                classnames="btn-sm"
              />
            </IdfTooltip>
          ) : null}
          {data?.items?.length ? (
            <IdfTooltip text="This will remove checklist data from storage. Have to create new one.">
              <ButtonIcon
                color="outline-danger"
                disabled={data.items.length === 0}
                label="Delete"
                onclick={handleDeleteChecklist}
                classnames="btn-sm"
              />
            </IdfTooltip>
          ) : null}
        </div>
        <ButtonIcon
          color="primary"
          disabled={data?.items?.length === 0}
          label="Save"
          onclick={handleSaveChecklist}
          classnames="btn-sm"
        />
      </CardFooter>
    </>
  );
};

const ChecklistFields = () => {
  return (
    <Row className="vertical-section-board flex-nowrap overflow-x-auto pb-2">
      <Col className={`vertical-section-chk-list`}>
        <Card className="h-100 hover-actions">
          <ChecklistSection />
        </Card>
      </Col>
    </Row>
  );
};

export default ChecklistFields;
