import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Radio,
    RadioGroup,
    FormControlLabel,
    FormControl,
    Alert,
    Box
} from '@mui/material';
import axios from 'axios';
import config from '../config';

const PickupDateConfirmation = ({ open, onClose, pickup, onSuccess }) => {
    const [selectedDateId, setSelectedDateId] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleConfirm = async () => {
        if (!selectedDateId) {
            setError('Please select a date');
            return;
        }

        try {
            setLoading(true);
            setError('');

            const response = await axios.post(
                `${config.BACKEND_API}/pickup/confirm-date`,
                {
                    pickupId: pickup._id,
                    dateId: selectedDateId
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );

            if (onSuccess) {
                onSuccess(response.data.pickup);
            }
            onClose();
        } catch (error) {
            console.error('Error confirming date:', error);
            setError(error.response?.data?.error || 'Failed to confirm date');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Confirm Pickup Date</DialogTitle>
            <DialogContent>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom>
                        <strong>Agency:</strong> {pickup?.receiver}
                    </Typography>
                    <Typography variant="subtitle1" gutterBottom>
                        <strong>Quantity:</strong> {pickup?.quantity} kg
                    </Typography>
                    <Typography variant="subtitle1" gutterBottom>
                        <strong>Waste Type:</strong> {pickup?.wasteType}
                    </Typography>
                </Box>

                <Typography variant="h6" gutterBottom>
                    Select Preferred Date:
                </Typography>

                <FormControl component="fieldset">
                    <RadioGroup
                        value={selectedDateId}
                        onChange={(e) => setSelectedDateId(e.target.value)}
                    >
                        {pickup?.proposedDates?.map((date) => (
                            <FormControlLabel
                                key={date._id}
                                value={date._id}
                                control={<Radio />}
                                label={
                                    `${new Date(date.date).toLocaleDateString()} at ${date.timeSlot}`
                                }
                            />
                        ))}
                    </RadioGroup>
                </FormControl>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button 
                    onClick={handleConfirm}
                    variant="contained"
                    disabled={loading || !selectedDateId}
                >
                    {loading ? 'Confirming...' : 'Confirm Date'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default PickupDateConfirmation; 