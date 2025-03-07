import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Chip,
    IconButton,
    Tooltip,
    CircularProgress,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Grid,
    Divider
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import QrCodeIcon from '@mui/icons-material/QrCode';
import axios from 'axios';
import config from '../../config';

const AdminPickups = () => {
    const [pickups, setPickups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [selectedPickup, setSelectedPickup] = useState(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [qrHistoryOpen, setQrHistoryOpen] = useState(false);

    useEffect(() => {
        fetchPickups();
    }, []);

    const fetchPickups = async () => {
        try {
            const response = await axios.get(
                `${config.BACKEND_API}/admin/pickups`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            setPickups(response.data.pickups);
            setLoading(false);
        } catch (error) {
            setError('Failed to fetch pickups');
            setLoading(false);
        }
    };

    const handleDeletePickup = async (pickupId) => {
        try {
            await axios.delete(
                `${config.BACKEND_API}/admin/pickups/${pickupId}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            await fetchPickups();
        } catch (error) {
            setError('Failed to delete pickup');
        }
    };

    const handleDeleteQR = async (pickupId, qrCodeId) => {
        try {
            await axios.delete(
                `${config.BACKEND_API}/admin/pickups/${pickupId}/qr-codes/${qrCodeId}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            // Refresh pickup details
            const response = await axios.get(
                `${config.BACKEND_API}/admin/pickups/${pickupId}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            setSelectedPickup(response.data.pickup);
        } catch (error) {
            setError('Failed to delete QR code');
        }
    };

    const getStatusChip = (status) => {
        const statusConfig = {
            pending: { color: 'default', label: 'Pending' },
            dates_proposed: { color: 'info', label: 'Dates Proposed' },
            scheduled: { color: 'primary', label: 'Scheduled' },
            completed: { color: 'success', label: 'Completed' },
            cancelled: { color: 'error', label: 'Cancelled' }
        };

        const config = statusConfig[status] || statusConfig.pending;
        return <Chip label={config.label} color={config.color} size="small" />;
    };

    const renderQRHistory = () => (
        <Dialog open={qrHistoryOpen} onClose={() => setQrHistoryOpen(false)} maxWidth="md" fullWidth>
            <DialogTitle>QR Code History</DialogTitle>
            <DialogContent>
                {selectedPickup?.qrCodes?.length > 0 ? (
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Generated At</TableCell>
                                <TableCell>Expires At</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Scanned By</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {selectedPickup.qrCodes.map((qr) => (
                                <TableRow key={qr._id}>
                                    <TableCell>
                                        {new Date(qr.generatedAt).toLocaleString()}
                                    </TableCell>
                                    <TableCell>
                                        {new Date(qr.expiresAt).toLocaleString()}
                                    </TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={qr.status} 
                                            color={qr.status === 'used' ? 'success' : 'default'}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        {qr.scannedBy || 'Not scanned'}
                                    </TableCell>
                                    <TableCell>
                                        <IconButton
                                            onClick={() => handleDeleteQR(selectedPickup._id, qr._id)}
                                            color="error"
                                            size="small"
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                    <Typography color="text.secondary">No QR codes generated yet</Typography>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setQrHistoryOpen(false)}>Close</Button>
            </DialogActions>
        </Dialog>
    );

    if (loading) return <CircularProgress />;
    if (error) return <Alert severity="error">{error}</Alert>;

    return (
        <Box>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Donor</TableCell>
                            <TableCell>Receiver</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Date</TableCell>
                            <TableCell>Quantity</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {pickups
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((pickup) => (
                                <TableRow key={pickup._id}>
                                    <TableCell>{pickup._id.slice(-6)}</TableCell>
                                    <TableCell>{pickup.donor}</TableCell>
                                    <TableCell>{pickup.receiver}</TableCell>
                                    <TableCell>{getStatusChip(pickup.status)}</TableCell>
                                    <TableCell>
                                        {pickup.confirmedDate ? 
                                            `${new Date(pickup.confirmedDate.date).toLocaleDateString()} at ${pickup.confirmedDate.timeSlot}` :
                                            'Not confirmed'
                                        }
                                    </TableCell>
                                    <TableCell>{pickup.quantity} kg</TableCell>
                                    <TableCell>
                                        <Tooltip title="View Details">
                                            <IconButton 
                                                onClick={() => {
                                                    setSelectedPickup(pickup);
                                                    setDetailsOpen(true);
                                                }}
                                            >
                                                <VisibilityIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="QR History">
                                            <IconButton 
                                                onClick={() => {
                                                    setSelectedPickup(pickup);
                                                    setQrHistoryOpen(true);
                                                }}
                                            >
                                                <QrCodeIcon />
                                            </IconButton>
                                        </Tooltip>
                                        {pickup.status === 'completed' && (
                                            <Tooltip title="Delete">
                                                <IconButton 
                                                    onClick={() => handleDeletePickup(pickup._id)}
                                                    color="error"
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <TablePagination
                component="div"
                count={pickups.length}
                page={page}
                onPageChange={(e, newPage) => setPage(newPage)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => {
                    setRowsPerPage(parseInt(e.target.value, 10));
                    setPage(0);
                }}
            />

            {/* Details Dialog */}
            <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>Pickup Details</DialogTitle>
                <DialogContent>
                    {selectedPickup && (
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <Typography variant="h6">Basic Information</Typography>
                                <Divider sx={{ my: 1 }} />
                                <Grid container spacing={2}>
                                    <Grid item xs={6}>
                                        <Typography><strong>Donor:</strong> {selectedPickup.donor}</Typography>
                                        <Typography><strong>Receiver:</strong> {selectedPickup.receiver}</Typography>
                                        <Typography><strong>Status:</strong> {selectedPickup.status}</Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography><strong>Quantity:</strong> {selectedPickup.quantity} kg</Typography>
                                        <Typography><strong>Waste Type:</strong> {selectedPickup.wasteType}</Typography>
                                        <Typography><strong>Item Type:</strong> {selectedPickup.itemType}</Typography>
                                    </Grid>
                                </Grid>
                            </Grid>

                            <Grid item xs={12}>
                                <Typography variant="h6">Completion Details</Typography>
                                <Divider sx={{ my: 1 }} />
                                {selectedPickup.completedAt ? (
                                    <>
                                        <Typography><strong>Completed At:</strong> {new Date(selectedPickup.completedAt).toLocaleString()}</Typography>
                                        <Typography><strong>Completed By:</strong> {selectedPickup.completedBy}</Typography>
                                        <Typography><strong>Additional Points:</strong> {selectedPickup.additionalPoints}</Typography>
                                        {selectedPickup.completionNotes && (
                                            <Typography><strong>Notes:</strong> {selectedPickup.completionNotes}</Typography>
                                        )}
                                    </>
                                ) : (
                                    <Typography color="text.secondary">Not completed yet</Typography>
                                )}
                            </Grid>
                        </Grid>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDetailsOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* QR History Dialog */}
            {renderQRHistory()}
        </Box>
    );
};

export default AdminPickups; 