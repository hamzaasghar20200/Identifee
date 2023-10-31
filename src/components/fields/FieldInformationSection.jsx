import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { TransitionGroup } from 'react-transition-group';
import Collapse from '@mui/material/Collapse';
import FieldItem from './FieldItem';
import NoDataFound from '../commons/NoDataFound';
import React from 'react';
import NoDataFoundTitle from './NoDataFoundTitle';

const FieldInformationSection = ({
  data,
  fieldSection,
  onHandleDragEnd,
  onHandleEdit,
  onHandleRemove,
  onHandleMove,
  onHandleUp,
  onHandleDown,
  fromCustomizeFieldModal,
}) => {
  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };
  return (
    <>
      <h5 className="pt-2 pb-0 px-3 mb-0">
        {capitalizeFirstLetter(
          fieldSection.name
            .replace(/Contact/g, data.contact.singular)
            .replace(/Company/g, data.organization.singular)
            .replace(/Product/g, data.product.singular)
            .replace(/Task/g, data.task.singular)
            .replace(/Call/g, data.call.singular)
            .replace(/Event/g, data.event.singular)
            .replace(/Deal/g, data.deal.singular)
        )}
      </h5>
      <>
        {fieldSection.fields.length > 0 ? (
          <DragDropContext onDragEnd={onHandleDragEnd}>
            <Droppable droppableId={`${fieldSection.name}Fields`}>
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  <TransitionGroup appear={true}>
                    {fieldSection.fields?.map((field, index) => (
                      <Collapse key={field.id}>
                        <FieldItem
                          fieldSection={fieldSection}
                          field={field}
                          index={index}
                          key={index}
                          onHandleEdit={onHandleEdit}
                          onHandleRemove={onHandleRemove}
                          onHandleMove={onHandleMove}
                          onHandleUp={onHandleUp}
                          onHandleDown={onHandleDown}
                          fromCustomizeFieldModal={fromCustomizeFieldModal}
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
            title={<NoDataFoundTitle str={`No fields found.`} />}
          />
        )}
      </>
    </>
  );
};

export default FieldInformationSection;
