import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Alert,
    CircularProgress,
    Typography
} from '@mui/material';
import QRCode from 'qrcode.react';
import axios from 'axios';
import config from '../config';

const QRCodeGenerator = ({ open, onClose, pickupId }) => {
    const [qrCode, setQrCode] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const generateQR = async () => {
        try {
            setLoading(true);
            setError('');

            const response = await axios.get(
                `${config.BACKEND_API}/donor/pickup/${pickupId}/generate-qr`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );

            if (response.data.success) {
                setQrCode(response.data.qrCode);
            } else {
                throw new Error(response.data.error || 'Failed to generate QR code');
            }
        } catch (error) {
            console.error('Error generating QR code:', error);
            setError(error.response?.data?.error || error.message || 'Failed to generate QR code');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setQrCode(null);
        setError('');
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>Generate QR Code</DialogTitle>
            <DialogContent>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <Box sx={{ textAlign: 'center', py: 2 }}>
                    {!qrCode && !loading && (
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={generateQR}
                        >
                            Generate QR Code
                        </Button>
                    )}

                    {loading && <CircularProgress />}

                    {qrCode && (
                        <>
                            <Box sx={{ mb: 2 }}>
                                <QRCode value={JSON.stringify(qrCode)} size={256} />
                            </Box>
                            <Typography variant="subtitle1" sx={{ mt: 2 }}>
                                Show this QR code to the agency representative
                            </Typography>
                        </>
                    )}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
};

export default QRCodeGenerator; 