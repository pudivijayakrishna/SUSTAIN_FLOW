import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Typography,
    Chip,
    Button,
    Grid,
    CircularProgress,
    Alert
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import QrCodeIcon from '@mui/icons-material/QrCode';
import ScheduleIcon from '@mui/icons-material/Schedule';
import axios from 'axios';
import config from '../config';
import PickupCompletion from './PickupCompletion';
import PickupSchedule from './PickupSchedule';

const NgoPickupList = () => {
    const [pickups, setPickups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedPickup, setSelectedPickup] = useState(null);
    const [completionOpen, setCompletionOpen] = useState(false);
    const [scheduleOpen, setScheduleOpen] = useState(false);
    const [requestQrError, setRequestQrError] = useState(null);

    const fetchPickups = useCallback(async () => {
        try {
            const response = await axios.get(
                `${config.BACKEND_API}/ngo/pickups`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );

            if (response.data.success) {
                setPickups(response.data.pickups);
            } else {
                setError('Failed to fetch pickups');
            }
        } catch (error) {
            console.error('Error fetching pickups:', error);
            setError(error.response?.data?.error || 'Failed to fetch pickups');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPickups();
    }, [fetchPickups]);

    const handleCompletionSuccess = () => {
        fetchPickups();
        setCompletionOpen(false);
    };

    const handleScheduleSuccess = () => {
        fetchPickups();
        setScheduleOpen(false);
    };

    const getStatusChip = (status) => {
        const statusConfig = {
            pending: { color: 'default', label: 'Pending' },
            dates_proposed: { color: 'info', label: 'Dates Proposed' },
            scheduled: { color: 'primary', label: 'Scheduled' },
            qr_requested: { color: 'warning', label: 'QR Requested' },
            qr_accepted: { color: 'info', label: 'QR Accepted' },
            completed: { color: 'success', label: 'Completed' },
            cancelled: { color: 'error', label: 'Cancelled' }
        };

        const config = statusConfig[status] || statusConfig.pending;
        return <Chip label={config.label} color={config.color} size="small" />;
    };

    const renderPickupActions = (pickup) => {
        if (pickup.status === 'completed') {
            return (
                <Button
                    variant="contained"
                    color="success"
                    disabled
                    startIcon={<QrCodeIcon />}
                >
                    Pickup Completed
                </Button>
            );
        }

        if (pickup.status === 'scheduled') {
            return (
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => {
                        setSelectedPickup(pickup);
                        setCompletionOpen(true);
                    }}
                    startIcon={<QrCodeIcon />}
                >
                    Complete Pickup
                </Button>
            );
        }

        if (pickup.status === 'qr_requested') {
            return (
                <Button
                    variant="contained"
                    color="warning"
                    disabled
                >
                    Waiting for Donor
                </Button>
            );
        }

        if (pickup.status === 'qr_accepted') {
            return (
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => {
                        setSelectedPickup(pickup);
                        setCompletionOpen(true);
                    }}
                    startIcon={<QrCodeIcon />}
                >
                    Complete Pickup
                </Button>
            );
        }

        if (pickup.status === 'pending') {
            return (
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => {
                        setSelectedPickup(pickup);
                        setScheduleOpen(true);
                    }}
                    startIcon={<ScheduleIcon />}
                >
                    Schedule Pickup
                </Button>
            );
        }

        return null;
    };

    if (loading) return <CircularProgress />;
    if (error) return <Alert severity="error">{error}</Alert>;

    return (
        <Box sx={{ width: '100%', mt: 2 }}>
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}
            {requestQrError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {requestQrError}
                </Alert>
            )}
            {pickups.map((pickup) => (
                <Accordion
                    key={pickup._id}
                    sx={{
                        bgcolor: pickup.status === 'completed' ? 'success.50' : 'inherit'
                    }}
                >
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        sx={{
                            opacity: pickup.status === 'completed' ? 0.7 : 1
                        }}
                    >
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={3}>
                                <Typography>Donor: {pickup.donor}</Typography>
                            </Grid>
                            <Grid item xs={3}>
                                {getStatusChip(pickup.status)}
                            </Grid>
                            <Grid item xs={3}>
                                <Typography>
                                    {pickup.confirmedDate ?
                                        new Date(pickup.confirmedDate.date).toLocaleDateString() :
                                        'Not confirmed'
                                    }
                                </Typography>
                            </Grid>
                            <Grid item xs={3}>
                                <Typography>{pickup.quantity} kg</Typography>
                            </Grid>
                        </Grid>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <Typography><strong>Item Category:</strong> {pickup.itemCategory}</Typography>
                                {pickup.itemCategory === 'others' && (
                                    <Typography><strong>Item Name:</strong> {pickup.itemName}</Typography>
                                )}
                                {pickup.status === 'completed' && (
                                    <>
                                        <Typography sx={{ mt: 1, color: 'success.main' }}>
                                            <strong>Completed on:</strong> {new Date(pickup.completedAt).toLocaleString()}
                                        </Typography>
                                        {pickup.completionNotes && (
                                            <Typography sx={{ mt: 1 }}>
                                                <strong>Notes:</strong> {pickup.completionNotes}
                                            </Typography>
                                        )}
                                    </>
                                )}
                            </Grid>

                            {/* New Donor Details Section */}
                            {pickup.donorDetails && (
                                <Grid item xs={12}>
                                    <Box sx={{ 
                                        bgcolor: 'background.paper',
                                        p: 2,
                                        borderRadius: 1,
                                        border: '1px solid #e0e0e0'
                                    }}>
                                        <Typography variant="subtitle2" gutterBottom>
                                            Donor Contact Details
                                        </Typography>
                                        <Typography><strong>Name:</strong> {pickup.donorDetails.name}</Typography>
                                        <Typography><strong>Address:</strong> {pickup.donorDetails.address}</Typography>
                                        <Typography><strong>Contact:</strong> {pickup.donorDetails.contact}</Typography>
                                        {pickup.donorDetails.location?.coordinates && (
                                            <Typography>
                                                <strong>Coordinates:</strong> {pickup.donorDetails.location.coordinates.lat}, {pickup.donorDetails.location.coordinates.lon}
                                            </Typography>
                                        )}
                                    </Box>
                                </Grid>
                            )}

                            <Grid item xs={12}>
                                {renderPickupActions(pickup)}
                            </Grid>
                        </Grid>
                    </AccordionDetails>
                </Accordion>
            ))}

            <PickupCompletion
                open={completionOpen}
                onClose={() => setCompletionOpen(false)}
                pickup={selectedPickup}
                onSuccess={handleCompletionSuccess}
            />

            <PickupSchedule
                open={scheduleOpen}
                onClose={() => setScheduleOpen(false)}
                pickup={selectedPickup}
                onSuccess={handleScheduleSuccess}
            />

            {pickups.length === 0 && (
                <Typography variant="body1" sx={{ textAlign: 'center', mt: 2 }}>
                    No pickups found
                </Typography>
            )}
        </Box>
    );
};

export default NgoPickupList;