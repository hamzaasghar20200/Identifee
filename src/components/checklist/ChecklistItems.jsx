import IdfTooltip from '../idfComponents/idfTooltip';
import MaterialIcon from '../commons/MaterialIcon';
import React, { useRef, useState } from 'react';
import {
  ChecklistFieldsTabs,
  ChecklistStatuses,
  getChecklist,
  saveChecklist,
} from '../../utils/checklist.constants';
import NoDataFoundTitle from '../fields/NoDataFoundTitle';
import NoDataFound from '../commons/NoDataFound';
import { Col, Input, Row } from 'reactstrap';
import ButtonIcon from '../commons/ButtonIcon';
import Alert from '../Alert/Alert';
import AlertWrapper from '../Alert/AlertWrapper';

const ChecklistItem = ({
  item,
  index,
  markAsCompleted,
  onUpload,
  onDownload,
}) => {
  const [icon, setIcon] = useState('circle');
  const [file, setFile] = useState({});
  const ref = useRef(null);
  const handleLoadFile = (e) => {
    const file = e.target.files[0];
    setFile({ name: file.name });
    onUpload(item, file);
  };

  return (
    <Row key={index} className="py-1 align-items-center">
      <Col md={5}>
        <h6 className="mb-0">{item.title}</h6>
      </Col>
      <Col md={7}>
        <div className={`d-flex flex-fill gap-1 align-items-center`}>
          <ButtonIcon
            icon="description"
            classnames={`btn-xs ${item?.attachment ? '' : 'hide'}`}
            color="white"
            label="Document"
            onclick={onDownload}
          />
          <label htmlFor={`checklistFile`} className="mb-0">
            <ButtonIcon
              icon={
                item.action.icon === 'description'
                  ? 'file_upload'
                  : item.action.icon
              }
              color={
                item?.status.value === ChecklistStatuses.Completed.value
                  ? 'default'
                  : 'primary'
              }
              classnames={`btn-xs ${
                item?.status.value === ChecklistStatuses.Completed.value
                  ? 'bg-gray-400'
                  : ''
              }`}
              disabled={
                item?.status.value === ChecklistStatuses.Completed.value
              }
              label={
                item.action.name === 'Upload' ? 'Upload File' : item.action.name
              }
              style={{ width: 130 }}
              onclick={() => {
                ref.current.click();
              }}
            />
          </label>
          <IdfTooltip
            text={
              item?.status.value === ChecklistStatuses.Completed.value
                ? 'Completed'
                : 'Mark as Completed'
            }
          >
            <a
              onClick={() => markAsCompleted(item)}
              onMouseEnter={() => setIcon('check_circle')}
              onMouseLeave={() => setIcon('circle')}
              className={`icon-hover-bg ${
                item?.status.value === ChecklistStatuses.Completed.value
                  ? ''
                  : 'cursor-pointer'
              }`}
            >
              <MaterialIcon
                icon={
                  item?.status.value === ChecklistStatuses.Completed.value
                    ? 'check_circle'
                    : icon
                }
                clazz={`text-hover-green ${
                  item?.status.value === ChecklistStatuses.Completed.value
                    ? 'text-success pe-none'
                    : 'text-gray-300'
                } font-size-xl`}
                filled
              />
            </a>
          </IdfTooltip>
          <Input
            type="file"
            name={file?.name}
            innerRef={ref}
            id={`checklistFile`}
            onClick={(e) => {
              e.target.value = '';
            }}
            className="d-none"
            onChange={handleLoadFile}
          />
        </div>
      </Col>
    </Row>
  );
};

const ChecklistItems = ({ checklist, setChecklist, hideInternal }) => {
  const [successMessage, setSuccessMessage] = useState('');
  const checklistFromStorage = getChecklist();
  const [items, setItems] = useState(
    checklist?.items?.filter((it) => it.type === ChecklistFieldsTabs.Client)
  );
  const [internalItems, setInternalItems] = useState(
    checklist?.items?.filter((it) => it.type === ChecklistFieldsTabs.Internal)
  );

  const updateChecklistItems = (item, newChecklist, global) => {
    const newItems = [...newChecklist.items].map((it) => ({
      ...it,
      status: item.id === it.id ? ChecklistStatuses.Completed : it.status,
    }));
    setItems(newItems);

    const updatedChecklist = {
      ...newChecklist,
      items: newItems,
    };

    setItems(newItems.filter((it) => it.type === ChecklistFieldsTabs.Client));
    setInternalItems(
      newItems.filter((it) => it.type === ChecklistFieldsTabs.Internal)
    );
    setChecklist(updatedChecklist);
    global && saveChecklist(updatedChecklist);
  };
  const markAsCompleted = (item) => {
    if (hideInternal) {
      updateChecklistItems(item, checklist, false);
    } else {
      updateChecklistItems(item, checklistFromStorage, true);
    }
  };
  const onUpload = (item) => {
    markAsCompleted(item);
  };
  const onDownload = () => {
    setSuccessMessage('Document will be downloaded.');
  };

  return (
    <>
      <AlertWrapper className="alert-position">
        <Alert
          color="success"
          message={successMessage}
          setMessage={setSuccessMessage}
        />
      </AlertWrapper>
      {items?.length ? (
        <>
          <div className="py-2">
            {!hideInternal && <h3 className="mb-0">For Client</h3>}
            {items.map((item, index) => (
              <ChecklistItem
                key={index}
                item={item}
                index={index}
                markAsCompleted={() => markAsCompleted(item)}
                onUpload={onUpload}
                onDownload={onDownload}
              />
            ))}
          </div>
          {!hideInternal && (
            <div className="py-2">
              <h3 className="mb-0">For Internal</h3>
              {internalItems.map((item, index) => (
                <ChecklistItem
                  key={index}
                  item={item}
                  index={index}
                  markAsCompleted={() => markAsCompleted(item)}
                  onUpload={onUpload}
                  onDownload={onDownload}
                />
              ))}
            </div>
          )}
        </>
      ) : (
        <NoDataFound
          icon="edit_note"
          iconStyle="font-size-3em"
          containerStyle="text-gray-search my-1 py-1"
          title={<NoDataFoundTitle clazz="fs-7" str={`No checklist items.`} />}
        />
      )}
    </>
  );
};

export default ChecklistItems;
