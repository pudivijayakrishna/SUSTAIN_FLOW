import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import {
    Box,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Typography,
    TextField,
    Alert,
    CircularProgress
} from '@mui/material';
import axios from 'axios';
import config from '../config';

const QRScanner = ({ pickupId, onComplete }) => {
    const [scanning, setScanning] = useState(false);
    const [error, setError] = useState('');
    const [additionalPoints, setAdditionalPoints] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [scanned, setScanned] = useState(false);
    const [qrData, setQrData] = useState(null);
    const [scanner, setScanner] = useState(null);

    useEffect(() => {
        if (scanning && !scanner) {
            const qrScanner = new Html5QrcodeScanner('qr-reader', {
                qrbox: {
                    width: 250,
                    height: 250,
                },
                fps: 5,
            });

            qrScanner.render(onScanSuccess, onScanError);
            setScanner(qrScanner);
        }

        return () => {
            if (scanner) {
                scanner.clear();
            }
        };
    }, [scanning]);

    const onScanSuccess = (decodedText) => {
        if (!scanned) {
            setScanned(true);
            setQrData(decodedText);
            if (scanner) {
                scanner.clear();
            }
        }
    };

    const onScanError = (err) => {
        console.error(err);
    };

    const handleComplete = async () => {
        if (!qrData) {
            setError('Please scan QR code first');
            return;
        }

        setIsLoading(true);
        try {
            const response = await axios.post(
                `${config.BACKEND_API}/pickup/complete`,
                {
                    pickupId,
                    qrData,
                    additionalPoints: Number(additionalPoints)
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );

            setScanning(false);
            onComplete(response.data.pickup);

        } catch (error) {
            setError(error.response?.data?.error || 'Failed to process QR code');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={scanning} onClose={() => setScanning(false)} maxWidth="sm" fullWidth>
            <DialogTitle>Complete Pickup</DialogTitle>
            <DialogContent>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <Box sx={{ mb: 2 }}>
                    <TextField
                        label="Additional Points"
                        type="number"
                        value={additionalPoints}
                        onChange={(e) => setAdditionalPoints(e.target.value)}
                        fullWidth
                        margin="normal"
                    />
                </Box>

                {!scanned && (
                    <Box id="qr-reader" sx={{ width: '100%' }} />
                )}

                {scanned && (
                    <Alert severity="success" sx={{ mb: 2 }}>
                        QR Code scanned successfully! Click Complete to finish the pickup.
                    </Alert>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setScanning(false)}>Cancel</Button>
                {scanned && (
                    <Button
                        onClick={handleComplete}
                        variant="contained"
                        color="primary"
                        disabled={isLoading}
                    >
                        {isLoading ? <CircularProgress size={24} /> : 'Complete Pickup'}
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
};

export default QRScanner; 