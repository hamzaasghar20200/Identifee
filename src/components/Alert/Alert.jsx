import React, { useEffect } from 'react';
import { Alert as AlertB, Slide } from '@mui/material';

const COLORS = {
  danger: 'error',
  success: 'success',
  info: 'info',
  warning: 'warning',
};

const Alert = ({ message, setMessage, color, icon, time }) => {
  useEffect(() => {
    if (message && ((time && time !== -1) || !time)) {
      // Close alert
      setTimeout(() => {
        setMessage('');
      }, time || 4000);
    }
  }, [message]);

  return (
    <Slide direction="down" in={!!message} mountOnEnter unmountOnExit>
      <AlertB
        variant="filled"
        severity={COLORS[color]}
        onClose={() => setMessage('')}
      >
        {message}
      </AlertB>
    </Slide>
  );
};

export default Alert;
