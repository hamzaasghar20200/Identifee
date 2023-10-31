import {
  PUBLISH_LESSON,
  TITLE_LABEL,
  CONTENT_LABEL,
  TAG_LABEL,
} from '../../utils/constants';
import InputValidation from '../commons/InputValidation';
import ButtonIcon from '../commons/ButtonIcon';
import React, { useEffect, useState } from 'react';
import MaterialIcon from '../commons/MaterialIcon';
const LessonAdminHeader = ({
  validData,
  loading,
  loadingPublish,
  onHandlePublish,
  lessonForm,
  dispatch,
  goBack,
  register,
  errors,
  lessonId,
  content,
  allowSubmit,
}) => {
  const [isDisabled, setIsDisabled] = useState();
  const onInputChange = (e) => {
    const { name, value } = e.target;

    const payload = ![TITLE_LABEL, CONTENT_LABEL, TAG_LABEL].includes(name)
      ? Number(value)
      : value;

    dispatch({
      type: 'set',
      input: name,
      payload,
    });
  };
  useEffect(() => {
    if (allowSubmit && lessonForm.title !== '') {
      setIsDisabled(false);
    } else {
      setIsDisabled(true);
    }
  }, [allowSubmit, lessonForm.title]);

  useEffect(() => {
    const exists = validData.some((item) => item.val === true);
    if (exists) setIsDisabled(true);
    else {
      setIsDisabled(false);
    }
  }, [validData]);
  return (
    <div className="card-header px-3">
      <div className="d-flex flex-grow-1 align-items-baseline mr-2">
        {goBack && (
          <button
            className="btn btn-white mr-2"
            data-uw-styling-context="true"
            onClick={() => {
              goBack(false);
            }}
          >
            <MaterialIcon icon="close" clazz="text-black" />
          </button>
        )}
        <InputValidation
          name={TITLE_LABEL}
          value={lessonForm.title || ''}
          register={register}
          type="input"
          placeholder="Lesson Name"
          errorDisplay="position-absolute error-show-right"
          errors={errors}
          validationConfig={{
            required: true,
            inline: true,
            onChange: onInputChange,
          }}
        />
      </div>
      <div>
        <ButtonIcon
          loading={loading}
          type="submit"
          label={'Save Draft'}
          color="white"
          classnames="mr-2"
          disabled={isDisabled}
        />
        <ButtonIcon
          loading={loadingPublish}
          type="button"
          label={PUBLISH_LESSON}
          color="primary"
          classnames="btn-secondary"
          onclick={onHandlePublish}
          disabled={isDisabled}
        />
      </div>
    </div>
  );
};

export default LessonAdminHeader;
