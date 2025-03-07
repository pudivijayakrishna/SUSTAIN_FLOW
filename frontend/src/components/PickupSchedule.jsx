import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    Alert,
    CircularProgress,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Grid
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import axios from 'axios';
import config from '../config';
import { useAuth } from '../context/auth';

const timeSlots = [
    '10:00 AM', '11:00 AM', '12:00 PM',
    '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'
];

const PickupSchedule = ({ open, onClose, pickup, onSuccess }) => {
    const [dates, setDates] = useState([{ date: null, timeSlot: '' }]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { role } = useAuth(); // Get role from auth context

    const handleAddDate = () => {
        if (dates.length < 3) {
            setDates([...dates, { date: null, timeSlot: '' }]);
        }
    };

    const handleRemoveDate = (index) => {
        const newDates = dates.filter((_, i) => i !== index);
        setDates(newDates);
    };

    const handleDateChange = (index, newDate) => {
        const newDates = [...dates];
        newDates[index].date = newDate;
        setDates(newDates);
    };

    const handleTimeSlotChange = (index, timeSlot) => {
        const newDates = [...dates];
        newDates[index].timeSlot = timeSlot;
        setDates(newDates);
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);
            setError('');

            // Validate dates
            const validDates = dates.filter(d => d.date && d.timeSlot);
            if (validDates.length === 0) {
                setError('Please select at least one date and time slot');
                return;
            }

            // Determine the correct endpoint based on role
            const baseEndpoint = role === 'ngo' ? 'ngo' : 'agency';

            const response = await axios.post(
                `${config.BACKEND_API}/${baseEndpoint}/pickup/${pickup._id}/propose-dates`,
                {
                    dates: validDates.map(d => ({
                        date: d.date,
                        timeSlot: d.timeSlot
                    }))
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
                handleClose();
            }
        } catch (error) {
            console.error('Error in scheduling pickup:', error);
            setError(error.response?.data?.error || 'Failed to schedule pickup');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setDates([{ date: null, timeSlot: '' }]);
        setError('');
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>Schedule Pickup</DialogTitle>
            <DialogContent>
                {error && (
                    <Box mt={2}>
                        <Alert severity="error">{error}</Alert>
                    </Box>
                )}
                <Box mt={2}>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        {dates.map((dateObj, index) => (
                            <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
                                <Grid item xs={12} sm={6}>
                                    <DatePicker
                                        label={`Date ${index + 1}`}
                                        value={dateObj.date}
                                        onChange={(newDate) => handleDateChange(index, newDate)}
                                        renderInput={(params) => <TextField {...params} fullWidth />}
                                        minDate={new Date()}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth>
                                        <InputLabel>Time Slot</InputLabel>
                                        <Select
                                            value={dateObj.timeSlot}
                                            onChange={(e) => handleTimeSlotChange(index, e.target.value)}
                                            label="Time Slot"
                                        >
                                            {timeSlots.map((slot) => (
                                                <MenuItem key={slot} value={slot}>
                                                    {slot}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                {index > 0 && (
                                    <Grid item xs={12}>
                                        <Button
                                            onClick={() => handleRemoveDate(index)}
                                            color="error"
                                            variant="outlined"
                                            size="small"
                                        >
                                            REMOVE DATE
                                        </Button>
                                    </Grid>
                                )}
                            </Grid>
                        ))}
                    </LocalizationProvider>
                    {dates.length < 3 && (
                        <Button onClick={handleAddDate} variant="outlined" sx={{ mt: 2 }}>
                            Add Another Date
                        </Button>
                    )}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={loading}
                    startIcon={loading && <CircularProgress size={20} />}
                >
                    Schedule
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default PickupSchedule;