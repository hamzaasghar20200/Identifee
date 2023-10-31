import React, { useEffect, useState } from 'react';
import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Spinner,
} from 'reactstrap';
import FormItem from '../profile/FormItem';

const InputModel = ({
  modalTitle,
  open,
  handleSubmit,
  buttonsDisabled,
  user,
  onHandleCloseModal,
  isLoading,
  customModal,
  buttonLabel,
  allowCloseOutside = true,
  close,
  ...rest
}) => {
  const [email, setEmail] = useState('');
  const handleSubmitModal = async (e) => {
    handleSubmit(email);
  };
  useEffect(() => {
    if (user) {
      setEmail(user?.email);
    }
  }, [user]);
  return (
    <Modal
      fade={false}
      isOpen={open}
      {...rest}
      className={customModal}
      toggle={allowCloseOutside ? onHandleCloseModal : null}
    >
      <ModalHeader
        close={close}
        tag="h3"
        className={modalTitle ? 'p-3' : 'p-0'}
        toggle={onHandleCloseModal}
      >
        {modalTitle}
      </ModalHeader>
      <ModalBody className={`${modalTitle ? 'border-top' : ''} mb-0 p-3`}>
        <FormItem
          title={'Email'}
          sizeLabel={2}
          sizeInput={10}
          labelFor="firstNameLabel"
        >
          <div className="input-group input-group-sm-down-break w-100">
            <input
              type="text"
              className="form-control w-100"
              name="first_name"
              id="firstNameLabel"
              placeholder={'Enter Email'}
              aria-label={'Enter Email'}
              value={email || ''}
              data-uw-styling-context="true"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </FormItem>
      </ModalBody>

      <ModalFooter className="px-3">
        <>
          <button
            className="btn btn-sm btn-white"
            onClick={onHandleCloseModal}
            disabled={isLoading}
          >
            Cancel
          </button>
          {handleSubmit && (
            <button
              type="button"
              className="btn btn-sm btn-primary"
              onClick={handleSubmitModal}
              disabled={isLoading || buttonsDisabled}
            >
              {isLoading ? (
                <Spinner className="spinner-grow-xs" />
              ) : (
                <span>{buttonLabel}</span>
              )}
            </button>
          )}
        </>
      </ModalFooter>
    </Modal>
  );
};

export default InputModel;
