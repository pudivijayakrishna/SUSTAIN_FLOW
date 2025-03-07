import React from 'react';
import { Snackbar, Alert } from '@mui/material';

const Notification = ({ message, severity, open, handleClose }) => {
  return (
    <Snackbar 
      open={open} 
      autoHideDuration={6000} 
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Alert 
        onClose={handleClose} 
        severity={severity} 
        sx={{ 
          width: '100%',
          fontWeight: 'bold',
          '& .MuiAlert-message': {
            fontSize: '1rem'
          }
        }}
        elevation={6}
        variant="filled"
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default Notification;
