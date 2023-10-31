import MaterialIcon from './MaterialIcon';
import { Alert } from 'reactstrap';
import React, { useEffect } from 'react';

const COLORS = {
  danger: 'bg-danger text-white',
  success: 'bg-success text-white',
  info: 'bg-info text-white',
  warning: 'bg-yellow text-black',
};

const COLORS_CLOSE = {
  danger: 'text-white',
  success: 'text-white',
  info: 'text-white',
  warning: 'text-black',
};

const InlineAlert = ({ msg, setMsg, variant, autoClose }) => {
  useEffect(() => {
    if (autoClose && msg) {
      setTimeout(() => {
        setMsg('');
      }, 4000);
    }
  }, [msg]);
  return (
    <>
      {msg ? (
        <Alert
          closeLabel="Close"
          className={`font-weight-medium ${COLORS[variant]} p-0 alert-dismissible justify-content-start`}
          dismissible
          onClose={() => setMsg('')}
        >
          <div className="d-flex">
            <p className="mb-0 p-3 flex-grow-1">{msg}</p>
            <a
              href=""
              className={`m-1 ${COLORS_CLOSE[variant]}`}
              onClick={(e) => {
                e.preventDefault();
                setMsg('');
              }}
              data-dismiss="alert"
              aria-hidden="true"
            >
              <MaterialIcon clazz={'font-size-xl'} icon="close" />
            </a>
          </div>
        </Alert>
      ) : (
        ''
      )}
    </>
  );
};

export default InlineAlert;
