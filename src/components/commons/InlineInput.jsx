import { useForm } from 'react-hook-form';
import React, { useEffect, useRef } from 'react';
import { Form } from 'react-bootstrap';
import InputValidation from './InputValidation';
import MaterialIcon from './MaterialIcon';
import { Spinner } from 'reactstrap';
import IdfTooltip from '../idfComponents/idfTooltip';

const InlineInput = ({
  customKey = 'name',
  value,
  setInputValue,
  show,
  setShow,
  onCancel,
  onSave,
  onDelete,
  showControls = true,
  containerStyle = 'w-100 position-relative',
  showEdit = false,
  editButtonStyle,
  placeholder = 'Pipeline Name',
  loading = false,
}) => {
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: { name: '' },
  });
  const inputRef = useRef();
  useEffect(() => {
    if (show) {
      try {
        inputRef.current.focus();
      } catch (e) {}

      setValue(customKey, value);
    }
  }, [show]);

  const handleOnChange = (e) => {
    const { value } = e.target;
    setInputValue(value);
    setValue(customKey, value);
  };

  const onSubmit = async (data) => {
    await onSave();
    setShow(false);
  };

  const handleEnter = async (e) => {
    if (e.code === 'Enter') {
      e.preventDefault();
      handleSubmit(onSubmit)();
    }
  };

  return (
    <>
      {show ? (
        <Form className="w-100" onSubmit={handleSubmit(onSubmit)}>
          <div className={`p-0 bg-white rounded ${containerStyle}`}>
            <InputValidation
              name="name"
              type="input"
              autoFocus
              ref={inputRef}
              inputRef={inputRef}
              placeholder={placeholder}
              value={value}
              onKeyDown={(e) => handleEnter(e)}
              classNames="fs-7 mb-0 flex-grow-1 font-weight-medium"
              errorDisplay="position-absolute error-show-right"
              validationConfig={{
                required: true,
                inline: true,
                onChange: handleOnChange,
              }}
              errors={errors}
              register={register}
            />
            {showControls && (
              <div
                className="text-right position-absolute shadow-soft rounded"
                style={{ bottom: -36, right: 0 }}
              >
                <div className="d-flex align-items-center bg-white px-2 z-index-99 py-1">
                  <a
                    className="cursor-pointer icon-hover-bg"
                    onClick={() => {
                      setShow(false);
                      reset({ [customKey]: '' });
                      onCancel();
                    }}
                  >
                    <MaterialIcon icon="cancel" clazz="text-gray-400" filled />{' '}
                  </a>
                  {!loading ? (
                    <a
                      className="cursor-pointer icon-hover-bg"
                      onClick={handleSubmit(onSubmit)}
                    >
                      <MaterialIcon
                        icon="check_circle"
                        clazz="text-green text-success"
                        filled
                      />{' '}
                    </a>
                  ) : (
                    <Spinner className="spinner-grow-xs" />
                  )}
                </div>
              </div>
            )}
          </div>
        </Form>
      ) : (
        <>
          {showEdit ? (
            <div
              className={`d-inline-flex mx-3 my-2 align-items-center ${editButtonStyle}`}
            >
              <nav className="modal-report-tabs nav">
                <a className="mb-0 nav-item cursor-default nav-link mr-1">
                  {value}
                </a>
              </nav>
              {showControls && (
                <>
                  <a
                    className="icon-hover-bg cursor-pointer ml-1"
                    onClick={() => setShow(!show)}
                  >
                    <IdfTooltip text="Edit">
                      <MaterialIcon icon="edit" />{' '}
                    </IdfTooltip>
                  </a>
                  {onDelete && (
                    <a
                      className="icon-hover-bg cursor-pointer"
                      onClick={onDelete}
                    >
                      <IdfTooltip text="Delete">
                        <MaterialIcon icon="delete" />{' '}
                      </IdfTooltip>
                    </a>
                  )}
                </>
              )}
            </div>
          ) : (
            ''
          )}
        </>
      )}
    </>
  );
};

export default InlineInput;
