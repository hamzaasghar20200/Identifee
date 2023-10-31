import { Form } from 'react-bootstrap';
import TooltipComponent from '../lesson/Tooltip';
import MaterialIcon from '../commons/MaterialIcon';
import MoreActions from '../MoreActions';
import { Draggable } from 'react-beautiful-dnd';
import React from 'react';

const FieldItem = ({
  fieldSection,
  field,
  index,
  onHandleEdit,
  onHandleRemove,
  onHandleMove,
  onHandleUp,
  onHandleDown,
  withCheckBoxes,
  updateFields,
  fromCustomizeFieldModal,
}) => {
  let actionItems = [
    {
      id: 'edit',
      icon: 'open_with',
      name: 'Move',
    },
  ];

  if (field.isCustom) {
    actionItems = [
      {
        id: 'remove',
        icon: 'delete',
        name: 'Delete',
      },
      {
        id: 'edit',
        icon: 'open_with',
        name: 'Move',
      },
    ];
  }

  const JustTheField = () => {
    return (
      <>
        {withCheckBoxes && (
          <Form.Check
            inline
            label=""
            name="preferred"
            className="fs-7 ml-2 mr-1"
            type="checkbox"
            checked={field.preferred || field.isFixed}
            onChange={(e) => {
              if (field.isFixed) {
                return;
              }
              updateFields({
                ...field,
                preferred: e.target.checked,
              });
            }}
          />
        )}
        <div
          className={`ml-1 d-flex align-items-center flex-grow-1 w-100 px-2 ${
            withCheckBoxes || field.isFixed ? 'py-2' : 'py-1'
          } bg-white my-2 rounded ${
            field?.mandatory
              ? 'border-left-4 border-left-danger border-top border-right border-bottom'
              : 'border'
          }`}
        >
          <div className="flex-grow-1">
            <p className={`fs-7 mb-0`}>
              {field.key}{' '}
              {field.isCustom && <span className="green-dot"></span>}
            </p>
          </div>
          {withCheckBoxes ? (
            <></>
          ) : (
            <>
              {field.isFixed ? (
                ''
              ) : (
                <div className={`d-flex align-items-center refresh-icon`}>
                  <TooltipComponent title="Edit field">
                    <a
                      onClick={() => onHandleEdit(field, fieldSection)}
                      className={`icon-hover-bg mr-1 cursor-pointer`}
                    >
                      <MaterialIcon
                        icon="edit"
                        clazz="text-gray-700 font-size-lg"
                      />{' '}
                    </a>
                  </TooltipComponent>
                  <a className={`icon-hover-bg cursor-pointer`}>
                    <MoreActions
                      icon="more_vert"
                      items={actionItems}
                      onHandleRemove={() => onHandleRemove(field, fieldSection)}
                      onHandleEdit={() => onHandleMove(field, fieldSection)}
                      toggleClassName="w-auto p-0 h-auto"
                    />
                  </a>
                </div>
              )}
            </>
          )}
        </div>
      </>
    );
  };

  const CustomizeFieldItem = () => {
    return (
      <div className="d-flex align-items-center w-100 gap-2">
        <div
          className={`ml-1 d-flex align-items-center flex-fill px-2 ${
            withCheckBoxes || field.isFixed ? 'py-2' : 'py-1'
          } bg-white my-2 rounded ${
            field?.mandatory
              ? 'border-left-4 border-left-danger border-top border-right border-bottom'
              : 'border'
          }`}
        >
          <div className="flex-fill">
            <p className={`fs-7 mb-0 ${!field.isFixed ? 'py-1' : ''}`}>
              {field.key}{' '}
              {field.isCustom && <span className="green-dot"></span>}
            </p>
          </div>
        </div>
        <div
          className={`d-flex align-items-center refresh-icon`}
          style={{ width: 130 }}
        >
          <TooltipComponent title="Edit">
            <a
              onClick={() => onHandleEdit(field, fieldSection)}
              className={`icon-hover-bg mr-1 cursor-pointer`}
            >
              <MaterialIcon icon="edit" clazz="text-gray-700 font-size-lg" />{' '}
            </a>
          </TooltipComponent>

          {index > 0 && index < fieldSection.fields.length - 1 ? (
            <>
              <TooltipComponent title="Move Up">
                <a
                  onClick={() => onHandleUp(fieldSection, index)}
                  className={`icon-hover-bg mr-1 cursor-pointer`}
                >
                  <MaterialIcon
                    icon="arrow_upward"
                    filled
                    clazz="text-gray-700 font-size-lg"
                  />{' '}
                </a>
              </TooltipComponent>
              <TooltipComponent title="Move Down">
                <a
                  onClick={() => onHandleDown(fieldSection, index)}
                  className={`icon-hover-bg mr-1 cursor-pointer`}
                >
                  <MaterialIcon
                    icon="arrow_downward"
                    filled
                    clazz="text-gray-700 font-size-lg"
                  />{' '}
                </a>
              </TooltipComponent>
            </>
          ) : index === 0 && fieldSection.fields.length > 1 ? (
            <TooltipComponent title="Move Down">
              <a
                onClick={() => onHandleDown(fieldSection, index)}
                className={`icon-hover-bg mr-1 cursor-pointer`}
              >
                <MaterialIcon
                  icon="arrow_downward"
                  filled
                  clazz="text-gray-700 font-size-lg"
                />{' '}
              </a>
            </TooltipComponent>
          ) : (
            <>
              {fieldSection.fields.length > 1 ? (
                <TooltipComponent title="Move Up">
                  <a
                    onClick={() => onHandleUp(fieldSection, index)}
                    className={`icon-hover-bg mr-1 cursor-pointer`}
                  >
                    <MaterialIcon
                      icon="arrow_upward"
                      filled
                      clazz="text-gray-700 font-size-lg"
                    />{' '}
                  </a>
                </TooltipComponent>
              ) : (
                <></>
              )}
            </>
          )}

          <TooltipComponent title="Move to Unused Fields">
            <a
              onClick={() => onHandleRemove(field, fieldSection)}
              className={`icon-hover-bg mr-1 cursor-pointer`}
            >
              <MaterialIcon
                icon="do_not_disturb_on"
                filled
                clazz="text-danger-soft font-size-lg"
              />{' '}
            </a>
          </TooltipComponent>
        </div>
      </div>
    );
  };

  return (
    <>
      {fieldSection.isDraggable && (field.preferred || field.isFixed) ? (
        <Draggable
          key={field.id}
          draggableId={`id-block-${index}`}
          index={index}
        >
          {(provided, snapshot) => (
            <div
              key={index}
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
              className={`d-flex pl-2 pr-3 setting-item rounded inactive bg-hover-gray align-items-center ${
                snapshot.isDragging ? 'shadow-lg' : ''
              }}`}
            >
              <MaterialIcon icon="drag_indicator" clazz="text-gray-600" />
              {fromCustomizeFieldModal ? (
                <CustomizeFieldItem />
              ) : (
                <JustTheField />
              )}
            </div>
          )}
        </Draggable>
      ) : (
        <div
          className={`d-flex px-2 setting-item rounded bg-hover-gray align-items-center`}
        >
          {fromCustomizeFieldModal ? <CustomizeFieldItem /> : <JustTheField />}
        </div>
      )}
    </>
  );
};

export default FieldItem;
