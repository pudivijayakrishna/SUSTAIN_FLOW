import React, { useState, useEffect } from 'react';
import {
    Box,
    Grid,
    Paper,
    Typography,
    Chip,
    Button,
    IconButton,
    TextField,
    InputAdornment,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
    CircularProgress
} from '@mui/material';
import {
    Search as SearchIcon,
    FilterList as FilterIcon,
    Delete as DeleteIcon,
    QrCode as QrCodeIcon,
    Download as DownloadIcon,
    Visibility as ViewIcon
} from '@mui/icons-material';
import { adminApi } from '../../services/adminApi';
import ExportPreview from './ExportPreview';
import PickupDetailsModal from './PickupDetailsModal';
import QRHistoryViewer from './QRHistoryViewer';

const AdminPickupList = () => {
    const [pickups, setPickups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        status: 'all',
        dateRange: [null, null],
        wasteType: 'all'
    });
    const [selectedPickup, setSelectedPickup] = useState(null);
    const [showQRHistory, setShowQRHistory] = useState(false);
    const [showExport, setShowExport] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [showDetails, setShowDetails] = useState(false);

    useEffect(() => {
        fetchPickups();
    }, []);

    const fetchPickups = async () => {
        try {
            setLoading(true);
            const response = await adminApi.getPickups();
            setPickups(response.pickups);
            setError(null);
        } catch (err) {
            setError('Failed to fetch pickups');
            console.error('Error fetching pickups:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (pickupId) => {
        try {
            await adminApi.deletePickup(pickupId);
            await fetchPickups();
            setDeleteConfirm(null);
        } catch (err) {
            setError('Failed to delete pickup');
            console.error('Error deleting pickup:', err);
        }
    };

    const filteredPickups = pickups.filter(pickup => {
        const matchesSearch = 
            pickup.donor.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pickup.receiver.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pickup.wasteType.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = filters.status === 'all' || pickup.status === filters.status;

        return matchesSearch && matchesStatus;
    });

    if (loading) return <CircularProgress />;
    if (error) return <Alert severity="error">{error}</Alert>;

    return (
        <Box>
            {/* Search and Filters */}
            <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <TextField
                    placeholder="Search pickups..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        )
                    }}
                    sx={{ flexGrow: 1 }}
                />
                
                <FormControl sx={{ minWidth: 120 }}>
                    <InputLabel>Status</InputLabel>
                    <Select
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        label="Status"
                    >
                        <MenuItem value="all">All</MenuItem>
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="scheduled">Scheduled</MenuItem>
                        <MenuItem value="completed">Completed</MenuItem>
                    </Select>
                </FormControl>

                <Button
                    startIcon={<DownloadIcon />}
                    onClick={() => setShowExport(true)}
                >
                    Export
                </Button>
            </Box>

            {/* Pickups Grid */}
            <Grid container spacing={3}>
                {filteredPickups.map((pickup) => (
                    <Grid item xs={12} md={6} lg={4} key={pickup._id}>
                        <Paper 
                            elevation={2}
                            sx={{ 
                                p: 2,
                                position: 'relative',
                                '&:hover': { boxShadow: 3 }
                            }}
                        >
                            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
                                <Chip
                                    label={pickup.status.toUpperCase()}
                                    color={
                                        pickup.status === 'completed' ? 'success' :
                                        pickup.status === 'scheduled' ? 'primary' :
                                        'default'
                                    }
                                    size="small"
                                />
                                <Typography variant="caption" color="text.secondary">
                                    {new Date(pickup.createdAt).toLocaleDateString()}
                                </Typography>
                            </Box>

                            <Typography variant="h6" gutterBottom>
                                {pickup.donor}
                            </Typography>
                            <Typography color="text.secondary" gutterBottom>
                                Agency: {pickup.receiver}
                            </Typography>

                            <Box sx={{ my: 1 }}>
                                <Typography>
                                    <strong>Waste Type:</strong> {pickup.wasteType}
                                </Typography>
                                <Typography>
                                    <strong>Quantity:</strong> {pickup.quantity} kg
                                </Typography>
                            </Box>

                            <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                                <Button
                                    size="small"
                                    startIcon={<ViewIcon />}
                                    onClick={() => {
                                        setSelectedPickup(pickup);
                                        setShowDetails(true);
                                    }}
                                >
                                    Details
                                </Button>
                                <Button
                                    size="small"
                                    startIcon={<QrCodeIcon />}
                                    onClick={() => {
                                        setSelectedPickup(pickup);
                                        setShowQRHistory(true);
                                    }}
                                >
                                    QR History
                                </Button>
                                <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => setDeleteConfirm(pickup)}
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </Box>
                        </Paper>
                    </Grid>
                ))}
            </Grid>

            {/* Modals */}
            <Dialog
                open={Boolean(deleteConfirm)}
                onClose={() => setDeleteConfirm(null)}
            >
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    Are you sure you want to delete this pickup?
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteConfirm(null)}>Cancel</Button>
                    <Button 
                        color="error"
                        onClick={() => handleDelete(deleteConfirm._id)}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            {selectedPickup && (
                <>
                    <PickupDetailsModal
                        open={showDetails}
                        onClose={() => {
                            setShowDetails(false);
                            setSelectedPickup(null);
                        }}
                        pickup={selectedPickup}
                    />
                    <QRHistoryViewer
                        open={showQRHistory}
                        onClose={() => {
                            setShowQRHistory(false);
                            setSelectedPickup(null);
                        }}
                        pickup={selectedPickup}
                    />
                </>
            )}

            <ExportPreview
                open={showExport}
                onClose={() => setShowExport(false)}
                data={pickups}
            />
        </Box>
    );
};

export default AdminPickupList; 