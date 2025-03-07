import React, { useEffect, useState, useCallback } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Alert,
    CircularProgress,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel
} from '@mui/material';
import { Html5Qrcode } from 'html5-qrcode';
import axios from 'axios';
import config from '../config';
import { useAuth } from '../context/auth';

const QRCodeScanner = ({ open, onClose, pickupId, onComplete, setActiveStep }) => {
    const [scanner, setScanner] = useState(null);
    const [scanned, setScanned] = useState(false);
    const [qrData, setQrData] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [additionalPoints, setAdditionalPoints] = useState('');
    const [notes, setNotes] = useState('');
    const [cameras, setCameras] = useState([]);
    const [selectedCamera, setSelectedCamera] = useState('');
    const { role } = useAuth();

    const initializeScanner = useCallback(async () => {
        try {
            const devices = await Html5Qrcode.getCameras();
            setCameras(devices);
            if (devices && devices.length > 0) {
                setSelectedCamera(devices[0].id);
            }
        } catch (err) {
            console.error('Error getting cameras:', err);
            setError('No cameras found or permission denied');
        }
    }, []);

    const startScanning = async () => {
        try {
            if (!selectedCamera) return;

            const html5QrCode = new Html5Qrcode("qr-reader");
            setScanner(html5QrCode);

            await html5QrCode.start(
                selectedCamera,
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 }
                },
                (decodedText) => {
                    setScanned(true);
                    setQrData(decodedText);
                    html5QrCode.stop();
                },
                (error) => {
                    // Ignore errors during scanning
                }
            );
        } catch (err) {
            console.error('Error starting scanner:', err);
            setError('Failed to start scanner');
        }
    };

    const stopScanner = async () => {
        if (scanner) {
            try {
                const isScanning = await scanner.isScanning;
                if (isScanning) {
                    await scanner.stop();
                }
            } catch (err) {
                console.error('Error stopping scanner:', err);
            }
            setScanner(null);
        }
    };

    useEffect(() => {
        if (open) {
            initializeScanner();
        }

        return () => {
            stopScanner();
        };
    }, [open, initializeScanner]);

    useEffect(() => {
        if (selectedCamera && open && !scanner) {
            startScanning();
        }
    }, [selectedCamera, open]);

    const handleCameraChange = async (event) => {
        const newCameraId = event.target.value;
        setSelectedCamera(newCameraId);
        await stopScanner();
    };

    const handleComplete = async () => {
        try {
            setLoading(true);
            setError('');

            // Use the correct endpoint based on role
            const baseEndpoint = role === 'ngo' ? 'ngo' : 'agency';

            const response = await axios.post(
                `${config.BACKEND_API}/${baseEndpoint}/pickup/${pickupId}/complete`,
                {
                    qrData,
                    additionalPoints: Number(additionalPoints) || 0,
                    notes
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );

            if (onComplete) {
                onComplete(response.data.pickup);
            }
            handleClose(); // Close the QR scanner dialog
            setActiveStep(2); // Move to step 3 (Complete Pickup)
        } catch (error) {
            console.error('Error completing pickup:', error);
            const errorMessage = error.response?.data?.error || 'Failed to complete pickup';
            setError(errorMessage);
            
            // If QR code expired, reset scanner
            if (error.response?.data?.expired) {
                setScanned(false);
                setQrData(null);
                await stopScanner();
                startScanning();
            }
        } finally {
            setLoading(false);
        }
    };

    const handleClose = async () => {
        await stopScanner();
        setScanned(false);
        setQrData(null);
        setError('');
        setAdditionalPoints('');
        setNotes('');
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>Scan QR Code</DialogTitle>
            <DialogContent>
                {error && (
                    <Box mb={2}>
                        <Alert severity="error">{error}</Alert>
                    </Box>
                )}

                {cameras.length > 1 && (
                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Camera</InputLabel>
                        <Select
                            value={selectedCamera}
                            onChange={handleCameraChange}
                            label="Camera"
                        >
                            {cameras.map((camera) => (
                                <MenuItem key={camera.id} value={camera.id}>
                                    {camera.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                )}

                <Box
                    id="qr-reader"
                    sx={{
                        width: '100%',
                        maxWidth: '500px',
                        margin: '0 auto',
                        '& video': { width: '100%' }
                    }}
                />

                {scanned && (
                    <Box mt={2}>
                        <Alert severity="success">QR Code scanned successfully!</Alert>
                        
                        <Box mt={2}>
                            <TextField
                                label="Additional Points"
                                type="number"
                                fullWidth
                                value={additionalPoints}
                                onChange={(e) => setAdditionalPoints(e.target.value)}
                                sx={{ mb: 2 }}
                            />
                            
                            <TextField
                                label="Notes"
                                multiline
                                rows={3}
                                fullWidth
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                        </Box>
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>CANCEL</Button>
                {scanned && (
                    <Button
                        onClick={handleComplete}
                        variant="contained"
                        disabled={loading}
                        startIcon={loading && <CircularProgress size={20} />}
                    >
                        COMPLETE PICKUP
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
};

export default QRCodeScanner;