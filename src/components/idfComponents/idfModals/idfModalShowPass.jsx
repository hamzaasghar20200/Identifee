import './idfModal.css';
import SimpleModal from '../../modal/SimpleModal';

const IdfModalShowPass = ({
  isOpen,
  data,
  buttonLabel,
  onHandleCloseModal,
}) => {
  return (
    <SimpleModal
      open={isOpen}
      modalTitle="Reset Password"
      buttonLabel={buttonLabel}
      buttonsDisabled={false}
      onHandleCloseModal={onHandleCloseModal}
    >
      <h3>
        {data?.email} {data?.new_password}
      </h3>
      <h6>Password Reset Successfully</h6>
    </SimpleModal>
  );
};

export default IdfModalShowPass;
