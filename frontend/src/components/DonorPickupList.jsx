import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Typography,
    Chip,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Grid,
    CircularProgress,
    Alert,
    Button
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import QRCodeGenerator from './QRCodeGenerator';
import axios from 'axios';
import config from '../config';

const DonorPickupList = ({ status }) => {
    const [pickups, setPickups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedPickup, setSelectedPickup] = useState(null);
    const [qrGeneratorOpen, setQrGeneratorOpen] = useState(false);

    const fetchPickups = useCallback(async () => {
        try {
            const response = await axios.get(
                `${config.BACKEND_API}/donor/pickups`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            // Filter pickups based on status prop
            const filteredPickups = response.data.pickups.filter(
                pickup => status.includes(pickup.status)
            );
            setPickups(filteredPickups);
        } catch (error) {
            console.error('Error fetching pickups:', error);
            setError('Failed to fetch pickups');
        } finally {
            setLoading(false);
        }
    }, [status]);

    useEffect(() => {
        fetchPickups();
    }, [fetchPickups]);

    const getStatusChip = (status) => {
        const statusConfig = {
            pending: { color: 'default', label: 'Pending' },
            dates_proposed: { color: 'info', label: 'Dates Proposed' },
            scheduled: { color: 'primary', label: 'Scheduled' },
            qr_requested: { color: 'warning', label: 'QR Requested' },
            qr_accepted: { color: 'info', label: 'QR Ready' },
            completed: { color: 'success', label: 'Completed' },
            cancelled: { color: 'error', label: 'Cancelled' }
        };

        const config = statusConfig[status] || statusConfig.pending;
        return <Chip label={config.label} color={config.color} size="small" />;
    };

    const formatReceiverLabel = (pickup) => {
        const role = pickup.receiver_role || pickup.type;
        const username = pickup.receiver;

        switch (role) {
            case 'ngo':
                return `NGO: ${username}`;
            case 'compostAgency':
                return `Agency: ${username}`;
            default:
                return `Receiver: ${username}`;
        }
    };

    const handleConfirmDate = async (pickupId, date, timeSlot) => {
        try {
            const response = await axios.post(
                `${config.BACKEND_API}/donor/pickup/${pickupId}/confirm-date`,
                {
                    date,
                    timeSlot
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            if (response.data.success) {
                // Refresh the pickups list
                fetchPickups();
            }
        } catch (error) {
            console.error('Error confirming date:', error);
            setError('Failed to confirm pickup date');
        }
    };

    const acceptQrRequest = async (pickupId) => {
        try {
            setError(null);
            const response = await axios.post(
                `${config.BACKEND_API}/donor/pickup/${pickupId}/accept-qr`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );

            if (response.data.success) {
                await fetchPickups(); // Refresh the list
            }
        } catch (error) {
            console.error('Error accepting QR request:', error);
            setError(error.response?.data?.error || 'Failed to accept QR request');
        }
    };

    if (loading) return <CircularProgress />;
    if (error) return <Alert severity="error">{error}</Alert>;

    return (
        <Box sx={{ width: '100%' }}>
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}
            {pickups.length === 0 ? (
                <Typography variant="body1" sx={{ textAlign: 'center', mt: 2 }}>
                    No pickups found
                </Typography>
            ) : (
                pickups.map((pickup) => (
                    <Accordion 
                        key={pickup._id}
                        sx={{
                            mb: 1,
                            bgcolor: pickup.status === 'completed' ? 'success.50' : 'inherit'
                        }}
                    >
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Grid container spacing={2} alignItems="center">
                                <Grid item xs={3}>
                                    <Typography>{formatReceiverLabel(pickup)}</Typography>
                                </Grid>
                                <Grid item xs={3}>
                                    {getStatusChip(pickup.status)}
                                </Grid>
                                <Grid item xs={3}>
                                    <Typography>
                                        {pickup.confirmedDate ? 
                                            new Date(pickup.confirmedDate.date).toLocaleString() : 
                                            'Date not confirmed'
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
                                    <Typography><strong>Waste Type:</strong> {pickup.wasteType}</Typography>
                                    <Typography><strong>Item Type:</strong> {pickup.itemType}</Typography>
                                    {pickup.status === 'dates_proposed' && pickup.proposedDates && (
                                        <Box sx={{ mt: 2 }}>
                                            <Typography><strong>Proposed Dates:</strong></Typography>
                                            {pickup.proposedDates.map((date, index) => (
                                                <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2, my: 1 }}>
                                                    <Typography>
                                                        {new Date(date.date).toLocaleDateString()} at {date.timeSlot}
                                                    </Typography>
                                                    <Button 
                                                        variant="contained" 
                                                        size="small"
                                                        onClick={() => handleConfirmDate(pickup._id, date.date, date.timeSlot)}
                                                    >
                                                        Confirm This Date
                                                    </Button>
                                                </Box>
                                            ))}
                                        </Box>
                                    )}
                                    {pickup.status === 'qr_requested' && (
                                        <Box sx={{ mt: 2 }}>
                                            <Typography>
                                                <strong>QR Code Request:</strong> {pickup.qrRequestDetails.requestedBy} has requested a QR code
                                            </Typography>
                                            <Button 
                                                variant="contained" 
                                                color="primary"
                                                onClick={() => acceptQrRequest(pickup._id)}
                                                sx={{ mt: 1 }}
                                            >
                                                Accept QR Request
                                            </Button>
                                        </Box>
                                    )}
                                    {pickup.status === 'qr_accepted' && (
                                        <Box sx={{ mt: 2 }}>
                                            <Button 
                                                variant="contained" 
                                                color="primary"
                                                onClick={() => {
                                                    setSelectedPickup(pickup);
                                                    setQrGeneratorOpen(true);
                                                }}
                                            >
                                                Generate QR Code
                                            </Button>
                                        </Box>
                                    )}
                                    {pickup.status === 'scheduled' && (
                                        <Box sx={{ mt: 2 }}>
                                            <Button 
                                                variant="contained" 
                                                color="primary"
                                                onClick={() => {
                                                    setSelectedPickup(pickup);
                                                    setQrGeneratorOpen(true);
                                                }}
                                            >
                                                Generate QR Code
                                            </Button>
                                        </Box>
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
                                            {pickup.additionalPoints > 0 && (
                                                <Typography sx={{ mt: 1, color: 'primary.main' }}>
                                                    <strong>Points Earned:</strong> {pickup.additionalPoints}
                                                </Typography>
                                            )}
                                        </>
                                    )}
                                </Grid>

                                {/* New Receiver Details Section - Show when dates are proposed */}
                                {(pickup.status === 'dates_proposed' || pickup.status === 'scheduled') && pickup.receiverDetails && (
                                    <Grid item xs={12}>
                                        <Box sx={{ 
                                            bgcolor: 'background.paper',
                                            p: 2,
                                            borderRadius: 1,
                                            border: '1px solid #e0e0e0',
                                            mb: 2
                                        }}>
                                            <Typography variant="subtitle2" gutterBottom>
                                                {pickup.type === 'ngo' ? 'NGO' : 'Agency'} Contact Details
                                            </Typography>
                                            <Typography><strong>Name:</strong> {pickup.receiverDetails.name}</Typography>
                                            <Typography><strong>Address:</strong> {pickup.receiverDetails.address}</Typography>
                                            <Typography><strong>Contact:</strong> {pickup.receiverDetails.contact}</Typography>
                                            {pickup.receiverDetails.location?.coordinates && (
                                                <Typography>
                                                    <strong>Coordinates:</strong> {pickup.receiverDetails.location.coordinates.lat}, {pickup.receiverDetails.location.coordinates.lon}
                                                </Typography>
                                            )}
                                        </Box>
                                    </Grid>
                                )}
                            </Grid>
                        </AccordionDetails>
                    </Accordion>
                ))
            )}

            <QRCodeGenerator
                open={qrGeneratorOpen}
                onClose={() => setQrGeneratorOpen(false)}
                pickupId={selectedPickup?._id}
            />
        </Box>
    );
};

export default DonorPickupList;