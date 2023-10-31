import { useState } from 'react';
import Alert from '../Alert/Alert';
import AlertWrapper from '../Alert/AlertWrapper';
import SimpleModalCreation from '../modal/SimpleModalCreation';
import ScheduleCallForm from './ScheduleCallForm';

const ScheduleCall = ({ children, open, setOpenScheduleCall, data }) => {
  const [loading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [dateTime, setDateTime] = useState({
    date: '',
    time: '',
  });

  const [warningMessage, setWarningMessage] = useState('');

  const onClose = () => {
    setOpenScheduleCall(false);
  };

  const mouseEventClick = () => document.dispatchEvent(new MouseEvent('click'));

  return (
    <>
      {children}
      <SimpleModalCreation
        modalTitle={
          <h3 className="mb-0" style={{ textTransform: 'none' }}>
            Request a Call
          </h3>
        }
        open={open}
        onHandleCloseModal={onClose}
        errorMessage={errorMessage}
        setErrorMessage={setErrorMessage}
        isLoading={loading}
        onClick={mouseEventClick}
        customModal="modal-dialog-custom"
        bodyClassName="p-0 mb-0"
        headerClassName="font-weight-bolder"
      >
        <ScheduleCallForm
          data={data}
          dateTime={dateTime}
          setDateTime={setDateTime}
          setSuccessMessage={setSuccessMessage}
          setErrorMessage={setErrorMessage}
          hideModal={onClose}
        />
      </SimpleModalCreation>

      <AlertWrapper>
        <Alert message={successMessage} setMessage={setSuccessMessage} />
        <Alert
          color="danger"
          message={errorMessage}
          setMessage={setErrorMessage}
        />
        <Alert
          color="warning"
          message={warningMessage}
          setMessage={setWarningMessage}
        />
      </AlertWrapper>
    </>
  );
};

export default ScheduleCall;
