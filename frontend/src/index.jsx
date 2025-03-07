import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ConfirmProvider } from 'material-ui-confirm';
import { SnackbarProvider } from 'notistack';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import App from './App';
import './index.css';

console.log("Starting app initialization...");

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    const rootElement = document.getElementById('root');
    
    if (!rootElement) {
        console.error('Root element not found!');
        return;
    }

    const root = ReactDOM.createRoot(rootElement);

    root.render(
        <React.StrictMode>
            <BrowserRouter>
                <SnackbarProvider 
                    maxSnack={3} 
                    anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                >
                    <ConfirmProvider
                        defaultOptions={{
                            confirmationButtonProps: { autoFocus: true },
                            cancellationButtonProps: { color: 'inherit' },
                            dialogProps: { maxWidth: 'xs' }
                        }}
                    >
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <App />
                        </LocalizationProvider>
                    </ConfirmProvider>
                </SnackbarProvider>
            </BrowserRouter>
        </React.StrictMode>
    );

    console.log("App rendered successfully");
}); 