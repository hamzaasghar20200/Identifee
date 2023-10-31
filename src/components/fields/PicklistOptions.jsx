import React from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import TooltipComponent from '../lesson/Tooltip';
import InputValidation from '../commons/InputValidation';
import MaterialIcon from '../commons/MaterialIcon';

const PicklistOptions = ({ listOptions, setListOptions, errors, register }) => {
  const onDragEnd = (result) => {
    if (!result.destination) {
      return;
    }

    const reorderedListOptions = Array.from(listOptions);
    const [movedItem] = reorderedListOptions.splice(result.source.index, 1);
    reorderedListOptions.splice(result.destination.index, 0, movedItem);

    setListOptions(reorderedListOptions);
  };

  const addNewField = (index) => {
    const uniqueId = `item${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const newItem = { id: uniqueId, name: '', default: false };
    const updatedListOptions = [...listOptions];
    updatedListOptions.splice(index, 0, newItem);
    setListOptions(updatedListOptions);
  };

  const removeField = (index) => {
    if (listOptions.length > 1) {
      const updatedListOptions = [...listOptions];
      if (updatedListOptions[index].default === true)
        updatedListOptions[0].default = true;
      updatedListOptions.splice(index, 1);
      setListOptions(updatedListOptions);
    }
  };

  const handleInputChange = (index, value) => {
    const updatedListOptions = [...listOptions];
    updatedListOptions[index].name = value;
    setListOptions(updatedListOptions);
  };

  return (
    <div>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="droppable">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              {listOptions.map((option, index) => {
                return index !== 0 && option?.id ? (
                  <Draggable
                    key={option.id}
                    draggableId={option.id}
                    index={index}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`d-flex pl-2 pr-3 py-1 setting-item rounded bg-hover-gray align-items-center`}
                      >
                        <MaterialIcon
                          icon="drag_indicator"
                          clazz="text-gray-600"
                        />
                        <div className="d-flex align-items-center w-100 gap-2">
                          <div
                            className={`ml-1 d-flex align-items-center flex-fill bg-white`}
                          >
                            <InputValidation
                              name={option.id}
                              type="input"
                              autoFocus={true}
                              placeholder="Specify option"
                              disabled={false}
                              value={option.name}
                              errorDisplay="position-absolute error-show-right"
                              validationConfig={{
                                required: true,
                                inline: true,
                                onChange: (e) =>
                                  handleInputChange(index, e.target.value),
                              }}
                              errors={errors}
                              register={register}
                            />
                          </div>
                          <div
                            className={`d-flex align-items-center refresh-icon`}
                            style={{ width: '50px' }}
                          >
                            <TooltipComponent title="Add option">
                              <a
                                onClick={() => addNewField(index + 1)}
                                className={`icon-hover-bg mr-1 cursor-pointer`}
                              >
                                <MaterialIcon
                                  icon="add_circle"
                                  filled
                                  clazz="text-success font-size-lg"
                                />{' '}
                              </a>
                            </TooltipComponent>
                            <TooltipComponent
                              title={`${
                                listOptions.length > 3
                                  ? 'Delete option'
                                  : 'Minimum two options required'
                              }`}
                            >
                              <a
                                onClick={() => {
                                  listOptions.length > 3 && removeField(index);
                                }}
                                className={`icon-hover-bg mr-1 cursor-pointer`}
                              >
                                <MaterialIcon
                                  icon="do_not_disturb_on"
                                  filled
                                  clazz={`${
                                    listOptions.length > 3
                                      ? 'text-danger-soft'
                                      : ''
                                  } font-size-lg`}
                                />{' '}
                              </a>
                            </TooltipComponent>
                          </div>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ) : null;
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      <div
        onClick={(e) => {
          e.preventDefault();
          addNewField(listOptions.length);
        }}
        className="picklist-button d-flex justify-content-center align-items-center color-primary bg-white mt-2 shadow p-2 rounded"
      >
        <span className="text-primary h5 my-auto">+ Add Option</span>
      </div>
    </div>
  );
};

export default PicklistOptions;
