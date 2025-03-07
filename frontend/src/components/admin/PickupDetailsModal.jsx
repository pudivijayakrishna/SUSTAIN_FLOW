import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    Grid,
    Chip,
    Divider,
    IconButton,
    Tooltip,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    useTheme
} from '@mui/material';
import {
    Close as CloseIcon,
    AccessTime as AccessTimeIcon,
    Person as PersonIcon,
    LocationOn as LocationIcon,
    Info as InfoIcon,
    QrCode as QrCodeIcon,
    Delete as DeleteIcon
} from '@mui/icons-material';
import QRHistoryViewer from './QRHistoryViewer';

const PickupDetailsModal = ({ open, onClose, pickup, onDelete }) => {
    const theme = useTheme();
    const [showQRHistory, setShowQRHistory] = useState(false);

    const formatDateTime = (date) => {
        return date ? new Date(date).toLocaleString() : 'Not set';
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed':
                return 'success';
            case 'scheduled':
                return 'primary';
            case 'dates_proposed':
                return 'info';
            case 'cancelled':
                return 'error';
            default:
                return 'default';
        }
    };

    return (
        <>
            <Dialog 
                open={open} 
                onClose={onClose}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    pb: 1
                }}>
                    <Typography variant="h6">Pickup Details</Typography>
                    <IconButton onClick={onClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <DialogContent>
                    {/* Header Section */}
                    <Box sx={{ mb: 3 }}>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} sm={6}>
                                <Typography variant="h5">
                                    {pickup.donor}
                                </Typography>
                                <Typography color="text.secondary">
                                    Agency: {pickup.receiver}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6} sx={{ textAlign: 'right' }}>
                                <Chip
                                    label={pickup.status.replace('_', ' ').toUpperCase()}
                                    color={getStatusColor(pickup.status)}
                                    sx={{ mb: 1 }}
                                />
                                <Typography variant="body2" color="text.secondary">
                                    Created: {formatDateTime(pickup.createdAt)}
                                </Typography>
                            </Grid>
                        </Grid>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    {/* Details Grid */}
                    <Grid container spacing={3}>
                        {/* Pickup Information */}
                        <Grid item xs={12} md={6}>
                            <Paper sx={{ p: 2 }}>
                                <Typography variant="subtitle1" gutterBottom>
                                    <InfoIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                                    Pickup Information
                                </Typography>
                                <Box sx={{ mt: 2 }}>
                                    <Typography><strong>Waste Type:</strong> {pickup.wasteType}</Typography>
                                    <Typography><strong>Item Type:</strong> {pickup.itemType}</Typography>
                                    <Typography><strong>Quantity:</strong> {pickup.quantity} kg</Typography>
                                    {pickup.additionalNotes && (
                                        <Typography sx={{ mt: 1 }}>
                                            <strong>Notes:</strong> {pickup.additionalNotes}
                                        </Typography>
                                    )}
                                </Box>
                            </Paper>
                        </Grid>

                        {/* Schedule Information */}
                        <Grid item xs={12} md={6}>
                            <Paper sx={{ p: 2 }}>
                                <Typography variant="subtitle1" gutterBottom>
                                    <AccessTimeIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                                    Schedule Information
                                </Typography>
                                <Box sx={{ mt: 2 }}>
                                    {pickup.confirmedDate ? (
                                        <>
                                            <Typography>
                                                <strong>Confirmed Date:</strong> {formatDateTime(pickup.confirmedDate.date)}
                                            </Typography>
                                            <Typography>
                                                <strong>Time Slot:</strong> {pickup.confirmedDate.timeSlot}
                                            </Typography>
                                        </>
                                    ) : (
                                        <Typography color="text.secondary">
                                            No date confirmed yet
                                        </Typography>
                                    )}
                                </Box>
                            </Paper>
                        </Grid>

                        {/* QR Code History */}
                        {pickup.qrCodes?.length > 0 && (
                            <Grid item xs={12}>
                                <Paper sx={{ p: 2 }}>
                                    <Box sx={{ 
                                        display: 'flex', 
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        mb: 2
                                    }}>
                                        <Typography variant="subtitle1">
                                            <QrCodeIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                                            QR Code Summary
                                        </Typography>
                                        <Button
                                            size="small"
                                            onClick={() => setShowQRHistory(true)}
                                        >
                                            View Full History
                                        </Button>
                                    </Box>
                                    <TableContainer>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Generated</TableCell>
                                                    <TableCell>Status</TableCell>
                                                    <TableCell>Scanned By</TableCell>
                                                    <TableCell>Scanned At</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {pickup.qrCodes.map((qr) => (
                                                    <TableRow key={qr._id}>
                                                        <TableCell>{formatDateTime(qr.generatedAt)}</TableCell>
                                                        <TableCell>
                                                            <Chip
                                                                label={qr.status}
                                                                size="small"
                                                                color={
                                                                    qr.status === 'used' ? 'success' :
                                                                    qr.status === 'active' ? 'primary' :
                                                                    'error'
                                                                }
                                                            />
                                                        </TableCell>
                                                        <TableCell>{qr.scannedBy || '-'}</TableCell>
                                                        <TableCell>{qr.scannedAt ? formatDateTime(qr.scannedAt) : '-'}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Paper>
                            </Grid>
                        )}
                    </Grid>
                </DialogContent>

                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button 
                        startIcon={<DeleteIcon />}
                        color="error"
                        onClick={() => onDelete(pickup._id)}
                    >
                        Delete Pickup
                    </Button>
                    <Button onClick={onClose}>Close</Button>
                </DialogActions>
            </Dialog>

            {pickup && (
                <QRHistoryViewer
                    open={showQRHistory}
                    onClose={() => setShowQRHistory(false)}
                    pickup={pickup}
                />
            )}
        </>
    );
};

export default PickupDetailsModal; 