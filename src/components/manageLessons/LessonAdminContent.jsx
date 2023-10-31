import { Button } from 'reactstrap';
import React, { useState } from 'react';
import {
  ADD_QUIZ,
  ADD_SLIDE,
  ADD_VIDEO,
  QUIZ,
  QUIZ_QUESTION_LABEL,
  SLIDE,
  VIDEO,
  VIDEO_LINK_FORMAT,
} from '../../utils/constants';
import LessonAdminPage from './LessonAdminPage';

import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';

const LessonAdminContent = ({
  validData,
  setValidData,
  onAddPage,
  pages,
  setPages,
  onSetPageInfo,
  onRemovePage,
  setErrorMessage,
  onHandleChangeOrder,
  onHandleUploadVideo,
  videoId,
  lessonId,
  setAllowSubmit,
}) => {
  const [isVideoUrl] = useState(false);
  const setFuncIsVideoUrl = (value) => {
    setAllowSubmit(value);
  };

  const onAddQuiz = () => {
    onAddPage({
      type: QUIZ,
      placeholder: QUIZ_QUESTION_LABEL,
    });
  };

  return (
    <div className="p-3 pt-0">
      <DragDropContext onDragEnd={onHandleChangeOrder}>
        <Droppable droppableId="pagesDrop">
          {(droppableProvided) => (
            <div
              {...droppableProvided.droppableProps}
              ref={droppableProvided.innerRef}
            >
              {pages?.map((itemPage, index) => (
                <Draggable
                  key={itemPage.id}
                  draggableId={itemPage?.id?.toString()}
                  index={index}
                >
                  {(draggableProvider) => (
                    <div
                      {...draggableProvider.draggableProps}
                      ref={draggableProvider.innerRef}
                      key={index + 1}
                      {...draggableProvider.dragHandleProps}
                    >
                      <LessonAdminPage
                        key={index + 2}
                        lessonId={lessonId}
                        {...itemPage}
                        isVideoUrl={
                          (itemPage.type === VIDEO &&
                            !itemPage?.video?.muxUploadId &&
                            itemPage?.content) ||
                          isVideoUrl
                        }
                        contactAccessible={
                          'contactAccessible' in itemPage
                            ? itemPage.contactAccessible
                            : false
                        }
                        pages={pages}
                        validData={validData}
                        setValidData={setValidData}
                        setPages={setPages}
                        onSetPageInfo={onSetPageInfo}
                        onRemovePage={onRemovePage}
                        setErrorMessage={setErrorMessage}
                        onHandleUploadVideo={onHandleUploadVideo}
                        lessonVideoId={videoId}
                        index={index}
                        id={itemPage.id || itemPage.pageLocalId}
                        slide={itemPage}
                        setFuncIsVideoUrl={setFuncIsVideoUrl}
                        setAllowSubmit={setAllowSubmit}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
              {droppableProvided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      <div className="card bg-gray-200 rounded d-flex justify-content-center align-items-center min-h-120">
        <div className="text-center">
          <div className="d-flex justify-content-center gap-2 slide-button-wrapper">
            <Button
              color="primary"
              className="bw-large"
              onClick={() => onAddPage({ type: SLIDE, placeholder: 'Title' })}
            >
              <span
                className="material-icons-outlined mr-2"
                data-uw-styling-context="true"
              >
                description
              </span>
              {ADD_SLIDE}
            </Button>

            <Button color="primary" className="bw-large" onClick={onAddQuiz}>
              <span
                className="material-icons-outlined mr-2"
                data-uw-styling-context="true"
              >
                analytics
              </span>
              {ADD_QUIZ}
            </Button>

            <Button
              color="primary"
              className="bw-large"
              onClick={() =>
                onAddPage({ type: VIDEO, placeholder: VIDEO_LINK_FORMAT })
              }
            >
              <span
                className="material-icons-outlined mr-2"
                data-uw-styling-context="true"
              >
                smart_display
              </span>
              {ADD_VIDEO}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonAdminContent;
