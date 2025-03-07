import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Alert,
    Box,
    Stepper,
    Step,
    StepLabel,
    TextField,
    FormControl,
    InputLabel,
    OutlinedInput,
    InputAdornment
} from '@mui/material';
import QRCodeScanner from './QRCodeScanner';
import axios from 'axios';
import config from '../config';

const steps = ['Request QR Code', 'Scan QR Code', 'Complete Pickup'];

const PickupCompletion = ({ open, onClose, pickup, onSuccess }) => {
    const [activeStep, setActiveStep] = useState(0);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [scannerOpen, setScannerOpen] = useState(false);
    const [additionalPoints, setAdditionalPoints] = useState('');
    const [notes, setNotes] = useState('');
    const [scannedQrData, setScannedQrData] = useState(null);

    useEffect(() => {
        if (pickup?.lastQrRequestTime) {
            setActiveStep(1);
        }
    }, [pickup]);

    // Return early if pickup is not available
    if (!pickup) {
        return null;
    }

    const handleRequestQR = async () => {
        try {
            setLoading(true);
            setError('');

            console.log('Requesting QR code for pickup:', pickup._id);

            const response = await axios.post(
                `${config.BACKEND_API}/api/pickup/request-qr/${pickup._id}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );

            if (response.data.success) {
                console.log('QR request successful:', response.data);
                if (response.data.pickup?.lastQrRequestTime) {
                    setActiveStep(1);
                    if (onSuccess) {
                        onSuccess(response.data.pickup);
                    }
                }
            } else {
                throw new Error(response.data.error || 'Failed to request QR code');
            }
        } catch (error) {
            console.error('Error requesting QR code:', error);
            setError(
                error.response?.data?.error || 
                error.response?.data?.details ||
                error.message || 
                'Failed to request QR code'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleScanComplete = (qrData) => {
        setScannedQrData(qrData);
        setScannerOpen(false);
    };

    const handleComplete = async () => {
        try {
            setLoading(true);
            setError('');

            const response = await axios.post(
                `${config.BACKEND_API}/api/pickup/complete-qr`,
                {
                    pickupId: pickup._id,
                    qrData: scannedQrData,
                    additionalPoints: Number(additionalPoints) || 0,
                    notes
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );

            if (response.data.success) {
                if (onSuccess) {
                    onSuccess(response.data.pickup);
                }
                onClose();
            }
        } catch (error) {
            console.error('Error completing pickup:', error);
            setError(
                error.response?.data?.error || 
                'Failed to complete pickup'
            );
        } finally {
            setLoading(false);
        }
    };

    const renderStepContent = () => {
        switch (activeStep) {
            case 0:
                return (
                    <Box sx={{ textAlign: 'center', py: 2 }}>
                        <Typography gutterBottom>
                            Request QR code from donor to complete pickup
                        </Typography>
                        <Button
                            variant="contained"
                            onClick={handleRequestQR}
                            disabled={loading}
                        >
                            {loading ? 'Requesting...' : 'Request QR Code'}
                        </Button>
                    </Box>
                );

            case 1:
                return (
                    <Box sx={{ textAlign: 'center', py: 2 }}>
                        <Typography gutterBottom>
                            Ready to scan donor's QR code
                        </Typography>
                        {!scannedQrData ? (
                            <Button
                                variant="contained"
                                onClick={() => setScannerOpen(true)}
                                color="primary"
                            >
                                START SCANNING
                            </Button>
                        ) : (
                            <>
                                <FormControl fullWidth sx={{ mb: 2 }}>
                                    <InputLabel>Additional Points</InputLabel>
                                    <OutlinedInput
                                        type="number"
                                        value={additionalPoints}
                                        onChange={(e) => setAdditionalPoints(e.target.value)}
                                        endAdornment={<InputAdornment position="end">points</InputAdornment>}
                                        label="Additional Points"
                                    />
                                </FormControl>
                                <TextField
                                    fullWidth
                                    label="Completion Notes"
                                    multiline
                                    rows={2}
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    sx={{ mb: 2 }}
                                />
                                <Button
                                    variant="contained"
                                    onClick={handleComplete}
                                    color="primary"
                                >
                                    Complete Pickup
                                </Button>
                            </>
                        )}
                    </Box>
                );

            default:
                return null;
        }
    };

    return (
        <>
            <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
                <DialogTitle>Complete Pickup</DialogTitle>
                <DialogContent>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle1" gutterBottom>
                            <strong>Donor:</strong> {pickup?.donor}
                        </Typography>
                        <Typography variant="subtitle1" gutterBottom>
                            <strong>Quantity:</strong> {pickup?.quantity} kg
                        </Typography>
                        <Typography variant="subtitle1" gutterBottom>
                            <strong>Scheduled Date:</strong> {pickup?.confirmedDate ? 
                                new Date(pickup.confirmedDate.date).toLocaleDateString() : 'Not confirmed'}
                        </Typography>
                    </Box>

                    <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
                        {steps.map((label) => (
                            <Step key={label}>
                                <StepLabel>{label}</StepLabel>
                            </Step>
                        ))}
                    </Stepper>

                    {renderStepContent()}
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Cancel</Button>
                </DialogActions>
            </Dialog>

            <QRCodeScanner
                open={scannerOpen}
                onClose={() => setScannerOpen(false)}
                pickupId={pickup._id}
                onComplete={handleScanComplete}
                setActiveStep={setActiveStep}
            />
        </>
    );
};

export default PickupCompletion;