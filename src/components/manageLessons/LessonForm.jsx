import React, { useState } from 'react';
import { FormGroup, Input, Label } from 'reactstrap';

import LessonAdminContent from './LessonAdminContent';

import {
  CATEGORY_REQUIRED,
  CHOOSE_IMAGE_FILE,
  CONTENT_LABEL,
  DURATION,
  LESSON_SETTINGS_LABEL,
  MAX_POINTS,
  MAX_WEIGHT,
  MAX_WEIGHT_ERROR_MESSAGE,
  PDF_FORMAT_ERROR,
  TAG_LABEL,
  TITLE_LABEL,
} from '../../utils/constants';
import IdfSelectCategory from '../idfComponents/idfDropdown/IdfSelectCategory';
import MaterialIcon from '../commons/MaterialIcon';
import Asterick from '../commons/Asterick';
import DragDropUploadFile from '../commons/DragDropUploadFile';
import ControllerValidation from '../commons/ControllerValidation';
import stringConstants from '../../utils/stringConstants.json';

const LessonForm = (props) => {
  const {
    validData,
    setValidData,
    lessonForm,
    dispatch,
    pdf,
    setPdf,
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
    errors,
    control,
    setValue,
    setAllowSubmit,
    getFieldState,
  } = props;

  const [isLoading] = useState(false);
  const [minimize, setMinimize] = useState(!!lessonId);

  const addTagToList = (newTag) => {
    if (!newTag || !newTag?.trim()) {
      return;
    }
    const newTags = lessonForm?.tags?.slice() || [];

    newTags.push(newTag);

    dispatch({
      type: 'set',
      input: TAG_LABEL,
      payload: '',
    });

    dispatch({
      type: 'set',
      input: 'tags',
      payload: newTags,
    });

    setValue('tagHidden', newTags);
    dispatch({
      type: 'set',
      input: 'tagHidden',
      payload: newTags,
    });
  };

  const onInputBlur = (e) => {
    const { value } = e.target;
    addTagToList(value);
  };

  const onInputChange = (e) => {
    const { name, value } = e.target;

    const payload =
      name !== TITLE_LABEL &&
      name !== CONTENT_LABEL &&
      name !== TAG_LABEL &&
      name !== 'passingScore'
        ? Number(value)
        : value;

    dispatch({
      type: 'set',
      input: name,
      payload,
    });
  };

  const onLoadPdf = async (event) => {
    const target = event.target.files[0];

    if (target?.type !== 'application/pdf') {
      setErrorMessage(PDF_FORMAT_ERROR);

      return setPdf(pdf || null);
    }

    if (target.size > MAX_WEIGHT) {
      setErrorMessage(MAX_WEIGHT_ERROR_MESSAGE);

      return setPdf(pdf || null);
    }

    setPdf(target);
  };

  const onAddTag = (e) => {
    if (e.code === 'Enter' || e.code === 'Tab' || e.code === 'Comma') {
      e.preventDefault();
      addTagToList(lessonForm.tag);
    }
  };

  const removeTag = (tag) => {
    const newTags = lessonForm.tags.filter((item) => item !== tag);

    dispatch({
      type: 'set',
      input: 'tags',
      payload: newTags,
    });

    setValue('tagHidden', newTags.length ? newTags : '');
    dispatch({
      type: 'set',
      input: 'tagHidden',
      payload: newTags.length ? newTags : '',
    });
  };

  const OptionalText = () => {
    return <span className="fs-8 font-weight-normal">(optional)</span>;
  };

  return (
    <>
      <div>
        <div className="w-100 pt-3">
          <LessonAdminContent
            validData={validData}
            setValidData={setValidData}
            lessonId={lessonId}
            onAddPage={onAddPage}
            pages={pages}
            setPages={setPages}
            onSetPageInfo={onSetPageInfo}
            onRemovePage={onRemovePage}
            setErrorMessage={setErrorMessage}
            onHandleChangeOrder={onHandleChangeOrder}
            onHandleUploadVideo={onHandleUploadVideo}
            videoId={videoId}
            setAllowSubmit={setAllowSubmit}
          />
        </div>
        <div className="px-3">
          <div className="card shadow-none rounded pb-0 mb-3">
            <div className="card-header px-3">
              <div
                className="d-flex align-items-center cursor-pointer"
                onClick={() => setMinimize(!minimize)}
              >
                <div>
                  <MaterialIcon
                    icon={minimize ? 'add' : 'remove'}
                    clazz="mr-1"
                  />
                  <span className="text-primary fw-bold">
                    {LESSON_SETTINGS_LABEL}
                  </span>
                </div>
              </div>
            </div>
            <div
              className={`card-body px-0 pb-0 ${
                minimize ? 'd-none' : 'd-block'
              }`}
            >
              <div>
                <div className="px-3">
                  <div className="row form-group">
                    <div className="col-md-12">
                      <Label htmlFor="category">
                        {
                          stringConstants.settings.resources.courses
                            .selectCategory
                        }{' '}
                        <Asterick />{' '}
                      </Label>
                      <ControllerValidation
                        name="category_id"
                        control={control}
                        errors={errors}
                        form={lessonForm}
                        renderer={({ field }) => (
                          <IdfSelectCategory
                            {...field}
                            fieldName={'category_id'}
                            getFieldState={getFieldState}
                            onChange={(cat) => {
                              setValue('category_id', cat.id);
                              dispatch({
                                type: 'set',
                                input: 'category_id',
                                payload: cat.id,
                              });
                            }}
                            selectedCat={lessonForm?.category}
                          />
                        )}
                        validationConfig={{
                          required: CATEGORY_REQUIRED,
                        }}
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <FormGroup>
                        <Label htmlFor={TAG_LABEL}>
                          Labels <Asterick />
                        </Label>
                        <Input
                          type="text"
                          placeholder="Labels"
                          name={TAG_LABEL}
                          id={TAG_LABEL}
                          value={lessonForm.tag || ''}
                          className={
                            errors.tagHidden && !lessonForm.tagHidden
                              ? 'border-danger'
                              : ''
                          }
                          onChange={onInputChange}
                          onBlur={onInputBlur}
                          onKeyDown={onAddTag}
                        />
                        <ControllerValidation
                          name="tagHidden"
                          errors={errors}
                          form={lessonForm}
                          control={control}
                          validationConfig={{
                            required: {
                              value: true,
                              message: 'At least one label is required.',
                            },
                          }}
                          renderer={({ field }) => (
                            <Input
                              type="hidden"
                              {...field}
                              placeholder="Tags"
                              name={TAG_LABEL}
                              id={TAG_LABEL}
                              value={lessonForm.tagHidden || ''}
                            />
                          )}
                        />
                        {lessonForm.tags?.length ? (
                          <div className="mt-2">
                            {lessonForm.tags?.map((tag) => (
                              <div
                                key={tag}
                                className="tag-item rounded align-items-center h-auto p-1 pl-2"
                              >
                                <span className="fw-normal fs-8 font-weight-semi-bold text-capitalize text-wrap">
                                  {tag}
                                </span>
                                <button
                                  type="button"
                                  className="button ml-0"
                                  onClick={() => removeTag(tag)}
                                >
                                  <MaterialIcon icon="close" />
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          ''
                        )}
                      </FormGroup>
                    </div>
                    <div className="col-md-6">
                      <FormGroup>
                        <Label htmlFor={DURATION}>
                          Duration <OptionalText />
                        </Label>
                        <Input
                          type="number"
                          name={DURATION}
                          id={DURATION}
                          placeholder="Duration"
                          value={lessonForm.duration || ''}
                          onChange={onInputChange}
                        />
                      </FormGroup>
                    </div>
                  </div>
                  <FormGroup>
                    <Label htmlFor={MAX_POINTS}>Upload File</Label>
                    <DragDropUploadFile
                      file={pdf}
                      setFile={setPdf}
                      name="lessonFormFile"
                      onLoadFile={onLoadPdf}
                      allowedFormat=".pdf"
                      chooseFileText={CHOOSE_IMAGE_FILE}
                      isLoading={isLoading}
                    />
                  </FormGroup>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LessonForm;
