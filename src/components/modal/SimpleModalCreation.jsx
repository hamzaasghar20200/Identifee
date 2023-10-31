import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Spinner,
} from 'reactstrap';
import { overflowing, removeBodyScroll } from '../../utils/Utils';
import ButtonIcon from '../commons/ButtonIcon';

export default function SimpleModalCreation({
  children,
  modalTitle,
  open,
  handleSubmit,
  buttonsDisabled,
  onHandleCloseModal,
  errorMessage,
  setErrorMessage,
  isLoading,
  editFields,
  saveButton,
  deleteButton,
  deleteButtonLoading,
  successMessage,
  loading,
  setSuccessMessage,
  customModal,
  bodyClassName = 'mb-0 p-3',
  bankTeam = false,
  toggle,
  noFooter = false,
  saveButtonStyle = 'btn-primary',
  ...rest
}) {
  return (
    <Modal
      onOpened={() => {
        removeBodyScroll();
      }}
      onClosed={() => {
        overflowing();
      }}
      isOpen={open}
      fade={false}
      {...rest}
      className={customModal}
    >
      <ModalHeader
        tag="h3"
        toggle={onHandleCloseModal}
        className={modalTitle ? 'p-3 text-capitalize' : 'p-0'}
      >
        {modalTitle}
      </ModalHeader>
      <ModalBody
        className={`${bodyClassName} ${modalTitle ? 'border-top' : ''}`}
      >
        {children}
      </ModalBody>

      {(bankTeam === false || noFooter === false) && (
        <ModalFooter
          className={`px-3 ${
            deleteButton ? 'justify-content-between' : 'justify-content-end'
          }`}
        >
          {deleteButton && (
            <ButtonIcon
              icon={deleteButton.icon}
              label={deleteButton.label}
              loading={deleteButtonLoading}
              onclick={deleteButton.onClick}
              color="outline-danger"
              classnames={`btn-sm pull-left ${
                deleteButton.show ? '' : 'd-none'
              }`}
            />
          )}
          <div className="d-flex gap-1 justify-content-end align-items-center">
            {onHandleCloseModal && (
              <button
                className="btn btn-white btn-sm"
                data-dismiss="modal"
                onClick={onHandleCloseModal}
                disabled={isLoading}
              >
                Cancel
              </button>
            )}
            {handleSubmit && (
              <button
                type="button"
                className={`btn btn-sm ${saveButtonStyle}`}
                onClick={handleSubmit}
                disabled={isLoading || buttonsDisabled}
              >
                {isLoading ? (
                  <Spinner className="spinner-grow-xs" />
                ) : (
                  <span>{editFields ? 'Update' : saveButton || 'Save'}</span>
                )}
              </button>
            )}
          </div>
        </ModalFooter>
      )}
    </Modal>
  );
}
