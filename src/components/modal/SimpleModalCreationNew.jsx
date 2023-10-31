import { Form } from 'react-bootstrap';
import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Spinner,
} from 'reactstrap';
import { overflowing, removeBodyScroll } from '../../utils/Utils';
import Loading from '../Loading';

export default function SimpleModalCreationNew({
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
  successMessage,
  loading,
  setSuccessMessage,
  customModal,
  bodyClassName,
  bankTeam = false,
  toggle,
  noFooter = false,
  saveButtonStyle = 'btn-primary',
  ...rest
}) {
  const loader = () => {
    if (loading) return <Loading />;
  };
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
      {loading ? (
        loader()
      ) : (
        <Form onSubmit={handleSubmit}>
          <ModalBody
            className={`${bodyClassName} ${
              modalTitle ? 'border-top' : ''
            } mb-0 p-3`}
          >
            {children}
          </ModalBody>

          {(bankTeam === false || noFooter === false) && (
            <ModalFooter className="px-3">
              {onHandleCloseModal && (
                <button
                  type="button"
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
                  type="sbbmit"
                  className={`btn btn-sm ${saveButtonStyle}`}
                  disabled={isLoading || buttonsDisabled}
                >
                  {isLoading ? (
                    <Spinner className="spinner-grow-xs" />
                  ) : (
                    <span>{editFields ? 'Update' : saveButton || 'Save'}</span>
                  )}
                </button>
              )}
            </ModalFooter>
          )}
        </Form>
      )}
    </Modal>
  );
}
