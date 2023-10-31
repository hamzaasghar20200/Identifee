import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Spinner,
} from 'reactstrap';
import { overflowing, removeBodyScroll } from '../../utils/Utils';

const SimpleModal = ({
  children,
  modalTitle,
  open,
  handleSubmit,
  buttonsDisabled,
  onHandleCloseModal,
  isLoading,
  customModal,
  buttonLabel,
  modalBodyClass,
  allowCloseOutside = true,
  close,
  ...rest
}) => {
  return (
    <Modal
      onOpened={() => {
        removeBodyScroll();
      }}
      onClosed={() => {
        overflowing();
      }}
      fade={false}
      isOpen={open}
      {...rest}
      className={customModal}
      toggle={allowCloseOutside ? onHandleCloseModal : null}
    >
      <ModalHeader tag="h3" className="p-3" toggle={onHandleCloseModal}>
        {modalTitle}
      </ModalHeader>
      <ModalBody
        className={`${
          modalTitle ? 'border-top' : ''
        } mb-0 p-3 ${modalBodyClass}`}
      >
        {children}
      </ModalBody>

      <ModalFooter className="px-3">
        <>
          <button
            className="btn btn-white btn-sm"
            onClick={onHandleCloseModal}
            disabled={isLoading}
          >
            Cancel
          </button>
          {handleSubmit && (
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleSubmit}
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

export default SimpleModal;
