import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import {
    Box,
    Typography,
    Tabs,
    Tab,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Alert,
    Grid,
    CircularProgress
} from '@mui/material';
import {
    Visibility as ViewIcon,
    Delete as DeleteIcon,
    Reply as ReplyIcon,
    Close as CloseIcon,
    PictureAsPdf as PdfIcon
} from '@mui/icons-material';
import { adminApi } from '../../services/adminApi';
import { exportPickupToPDF, exportAllPickupsToPDF } from '../../utils/exportUtils';
import axios from 'axios';
import config from '../../config';

const AdminPickupFeedback = () => {
    const [tabValue, setTabValue] = useState(0);
    const [pickups, setPickups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedPickup, setSelectedPickup] = useState(null);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [feedbacks, setFeedbacks] = useState([]);
    
    useEffect(() => {
        fetchData();
    }, [tabValue]);
    const fetchFeedbacks = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${config.BACKEND_API}/feedback/allfeedback`);
            setFeedbacks(await response.json());
        } catch (error) {
            setError('Failed to fetch feedbacks');
            console.error('Error fetching feedbacks:', error);
        } finally {
            setLoading(false);
        }
    };
    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            if (tabValue === 0) {
                // Fetch pickups for the first tab
                const response = await adminApi.getPickups();
                setPickups(response.pickups || []);
            } else if (tabValue === 1) {
                // Fetch feedbacks for the second tab
                const response = await fetchFeedbacks();
                console.log(response);
                
                
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            setError(error.message || 'Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };
    

    const renderUserCell = (user) => {
        if (!user) return '-';
        return (
            <Box>
                <Typography variant="body2">{user.username}</Typography>
                <Typography variant="caption" color="textSecondary">
                    {user.role}
                </Typography>
            </Box>
        );
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed':
                return 'success';
            case 'scheduled':
                return 'primary';
            case 'pending':
                return 'warning';
            case 'cancelled':
                return 'error';
            default:
                return 'default';
        }
    };

    const handleViewClick = (pickup) => {
        setSelectedPickup(pickup);
        setViewDialogOpen(true);
    };

    const renderViewDialog = () => (
        <Dialog 
            open={viewDialogOpen} 
            onClose={() => setViewDialogOpen(false)}
            maxWidth="md"
            fullWidth
        >
            <DialogTitle>
                Pickup Details
                <IconButton
                    onClick={() => setViewDialogOpen(false)}
                    sx={{ position: 'absolute', right: 8, top: 8 }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                {selectedPickup && (
                    <Box sx={{ p: 2 }}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" gutterBottom>Basic Information</Typography>
                                <Box sx={{ mb: 2 }}>
                                    <Typography><strong>Date:</strong> {new Date(selectedPickup.createdAt).toLocaleString()}</Typography>
                                    <Typography><strong>Status:</strong> {selectedPickup.status}</Typography>
                                    <Typography><strong>Quantity:</strong> {selectedPickup.quantity}kg</Typography>
                                    <Typography><strong>Waste Type:</strong> {selectedPickup.wasteType}</Typography>
                                    <Typography><strong>Item Type:</strong> {selectedPickup.itemType}</Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" gutterBottom>Participants</Typography>
                                <Box sx={{ mb: 2 }}>
                                    <Typography>
                                        <strong>Donor:</strong> {selectedPickup.donor?.username || selectedPickup.donor}
                                        {selectedPickup.donor?.role && (
                                            <Typography variant="caption" color="textSecondary" display="block">
                                                Role: {selectedPickup.donor.role}
                                            </Typography>
                                        )}
                                    </Typography>
                                    <Typography>
                                        <strong>Receiver:</strong> {selectedPickup.receiver?.username || selectedPickup.receiver}
                                        {selectedPickup.receiver?.role && (
                                            <Typography variant="caption" color="textSecondary" display="block">
                                                Role: {selectedPickup.receiver.role}
                                            </Typography>
                                        )}
                                    </Typography>
                                </Box>
                            </Grid>
                            {selectedPickup.completedAt && (
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" gutterBottom>Completion Details</Typography>
                                    <Box sx={{ mb: 2 }}>
                                        <Typography><strong>Completed At:</strong> {new Date(selectedPickup.completedAt).toLocaleString()}</Typography>
                                        {selectedPickup.additionalPoints > 0 && (
                                            <Typography><strong>Additional Points:</strong> {selectedPickup.additionalPoints}</Typography>
                                        )}
                                        {selectedPickup.completionNotes && (
                                            <Typography><strong>Notes:</strong> {selectedPickup.completionNotes}</Typography>
                                        )}
                                    </Box>
                                </Grid>
                            )}
                            {selectedPickup.qrCodes?.length > 0 && (
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" gutterBottom>QR Code History</Typography>
                                    <TableContainer component={Paper} variant="outlined">
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
                                                {selectedPickup.qrCodes.map((qr, index) => (
                                                    <TableRow key={index}>
                                                        <TableCell>{new Date(qr.generatedAt).toLocaleString()}</TableCell>
                                                        <TableCell>
                                                            <Chip 
                                                                label={qr.status}
                                                                size="small"
                                                                color={qr.status === 'used' ? 'success' : 'default'}
                                                            />
                                                        </TableCell>
                                                        <TableCell>{qr.scannedBy || '-'}</TableCell>
                                                        <TableCell>{qr.scannedAt ? new Date(qr.scannedAt).toLocaleString() : '-'}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Grid>
                            )}
                        </Grid>
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                <Button 
                    startIcon={<PdfIcon />}
                    onClick={() => exportPickupToPDF(selectedPickup)}
                    color="primary"
                >
                    Export PDF
                </Button>
                <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
            </DialogActions>
        </Dialog>
    );
    const renderFeedbackTable = () => (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Feedback</TableCell>
                        <TableCell>Date</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {feedbacks?.map((feedback) => (
                        <TableRow key={feedback._id}>
                            <TableCell>{feedback.name}</TableCell>
                            <TableCell>{feedback.email}</TableCell>
                            <TableCell>{feedback.feedback}</TableCell>
                            <TableCell>
                                {new Date(feedback.createdAt).toLocaleString()}
                            </TableCell>
                        </TableRow>
                    ))}
                    {feedbacks.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={4} align="center">
                                No feedback available
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
    const renderPickupsTable = () => (
        <>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                    startIcon={<PdfIcon />}
                    onClick={() => exportAllPickupsToPDF(pickups)}
                    variant="outlined"
                    color="primary"
                    disabled={pickups.length === 0}
                >
                    Export All to PDF
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Date</TableCell>
                            <TableCell>Donor</TableCell>
                            <TableCell>Receiver</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Details</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {pickups.map((pickup) => (
                            <TableRow key={pickup._id}>
                                <TableCell>
                                    {new Date(pickup.createdAt).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                    {renderUserCell(pickup.donor)}
                                </TableCell>
                                <TableCell>
                                    {renderUserCell(pickup.receiver)}
                                </TableCell>
                                <TableCell>
                                    <Chip 
                                        label={pickup.status}
                                        color={getStatusColor(pickup.status)}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2">
                                        {pickup.quantity}kg {pickup.wasteType}
                                    </Typography>
                                    {pickup.completedAt && (
                                        <Typography variant="caption" color="textSecondary">
                                            Completed: {new Date(pickup.completedAt).toLocaleDateString()}
                                        </Typography>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <IconButton size="small" onClick={() => handleViewClick(pickup)}>
                                        <ViewIcon color="primary" />
                                    </IconButton>
                                    <IconButton size="small">
                                        <DeleteIcon color="error" />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        {pickups.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
                                    No pickups found
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    );

    return (
        <AdminLayout>
            <Box sx={{ p: 3 }}>
                <Typography variant="h4" gutterBottom>
                    Pickup & Feedback Management
                </Typography>

                <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
                    <Tab label="PICKUPS" />
                    <Tab label="FEEDBACK" />
                </Tabs>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

{loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <>
                        {tabValue === 0 ? (
                            renderPickupsTable()
                        ) : (
                            renderFeedbackTable()
                        )}
                    </>
                )}
                {renderViewDialog()}
            </Box>
        </AdminLayout>
    );
};

export default AdminPickupFeedback; 