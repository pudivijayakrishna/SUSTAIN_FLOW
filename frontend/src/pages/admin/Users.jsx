import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
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
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Grid,
    IconButton,
    Chip,
    Tabs,
    Tab,
    Typography,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    Alert,
    Tooltip,
    DialogContentText,
    CircularProgress,
    List,
    ListItem,
    ListItemText,
    TableSortLabel
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import {
    Search as SearchIcon,
    Visibility as ViewIcon,
    FilterList as FilterIcon,
    Block as BlockIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    LockOpen as UnblockIcon,
    Close as CloseIcon,
    Clear as ClearIcon
} from '@mui/icons-material';
import { adminApi } from '../../services/adminApi';
import { useConfirm } from 'material-ui-confirm';
import { useSnackbar } from 'notistack';
import UserDetailsDialog from '../../components/admin/UserDetailsDialog';
import UserEditDialog from '../../components/admin/UserEditDialog';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [selectedUser, setSelectedUser] = useState(null);
    const [tabValue, setTabValue] = useState(0);
    const [filters, setFilters] = useState({
        search: '',
        role: 'all',
        status: 'all',
        startDate: null,
        endDate: null
    });
    const [userDetails, setUserDetails] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [formErrors, setFormErrors] = useState({});
    const [error, setError] = useState(null);
    const confirm = useConfirm();
    const { enqueueSnackbar } = useSnackbar();
    const [transactionFilters, setTransactionFilters] = useState({
        search: '',
        donor: '',
        category: 'all',
        wasteType: 'all',
        status: 'all',
        startDate: null,
        endDate: null,
        minPoints: '',
        maxPoints: '',
        minQuantity: '',
        maxQuantity: '',
        sortBy: 'date',
        sortOrder: 'desc'
    });
    const [sortConfig, setSortConfig] = useState({
        key: 'date',
        direction: 'desc'
    });
    const [activeFilters, setActiveFilters] = useState([]);
    const [editDialogOpen, setEditDialogOpen] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, [filters]);

    const fetchUsers = async () => {
        try {
            const response = await adminApi.getUsers(filters);
            setUsers(response.users || []);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching users:', error);
            setError('Failed to fetch users');
            setLoading(false);
        }
    };

    const handleViewUser = async (userId) => {
        try {
            const response = await adminApi.getUserDetails(userId);
            if (response.success) {
                setUserDetails(response.user);
                setOpenDialog(true);
            }
        } catch (error) {
            console.error('Error fetching user details:', error);
            enqueueSnackbar('Error fetching user details', { variant: 'error' });
        }
    };

    const searchInTransaction = (transaction, searchTerm) => {
        const searchFields = {
            donor: transaction.sender,
            receiver: transaction.receiver,
            wasteType: transaction.wasteType,
            itemType: transaction.itemType,
            itemCategory: transaction.itemCategory,
            description: transaction.description,
            points: String(transaction.points),
            quantity: String(transaction.quantity)
        };

        const searchWords = searchTerm.toLowerCase().split(/\s+/).filter(word => word.length > 0);
        return searchWords.every(word =>
            Object.values(searchFields).some(value => 
                value?.toLowerCase().includes(word)
            )
        );
    };

    const getFilteredTransactions = (transactions) => {
        if (!transactions) return [];
        
        return transactions
            .filter(transaction => {
                if (transactionFilters.search) {
                    if (!searchInTransaction(transaction, transactionFilters.search)) {
                        return false;
                    }
                }

                if (transactionFilters.type !== 'all') {
                    if (transaction.type !== transactionFilters.type) {
                        return false;
                    }
                }

                if (transactionFilters.status !== 'all') {
                    if (transaction.status !== transactionFilters.status) {
                        return false;
                    }
                }

                const points = Number(transaction.points) || 0;
                if (transactionFilters.minPoints && points < Number(transactionFilters.minPoints)) {
                    return false;
                }
                if (transactionFilters.maxPoints && points > Number(transactionFilters.maxPoints)) {
                    return false;
                }

                if (transactionFilters.startDate || transactionFilters.endDate) {
                    const transactionDate = new Date(transaction.date || transaction.createdAt);
                    if (transactionFilters.startDate && transactionDate < transactionFilters.startDate) {
                        return false;
                    }
                    if (transactionFilters.endDate) {
                        const endDate = new Date(transactionFilters.endDate);
                        endDate.setHours(23, 59, 59, 999);
                        if (transactionDate > endDate) {
                            return false;
                        }
                    }
                }

                return true;
            })
            .sort((a, b) => {
                const pointsA = Number(a.points) || 0;
                const pointsB = Number(b.points) || 0;
                const dateA = new Date(a.date || a.createdAt).getTime();
                const dateB = new Date(b.date || b.createdAt).getTime();

                if (transactionFilters.sortBy === 'points') {
                    return transactionFilters.sortOrder === 'desc' 
                        ? pointsB - pointsA 
                        : pointsA - pointsB;
                }
                return transactionFilters.sortOrder === 'desc'
                    ? dateB - dateA
                    : dateA - dateB;
            });
    };

    const clearFilters = () => {
        setTransactionFilters({
            search: '',
            type: 'all',
            status: 'all',
            startDate: null,
            endDate: null,
            minPoints: '',
            maxPoints: '',
            sortBy: 'date',
            sortOrder: 'desc'
        });
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setTabValue(0);  // Reset tab when closing
    };

    const renderVerificationStatus = (user) => {
        if (user.role === 'donor') {
            return (
                <Chip 
                    label="Verified"
                    color="success"
                    size="small"
                />
            );
        }
        
        return (
            <Chip 
                label={user.verificationStatus}
                color={
                    user.verificationStatus === 'approved' ? 'success' :
                    user.verificationStatus === 'rejected' ? 'error' :
                    'warning'
                }
                size="small"
            />
        );
    };

    const validateUserForm = (values) => {
        const errors = {};

        if (!values.email) {
            errors.email = 'Email is required';
        } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)) {
            errors.email = 'Invalid email address';
        }

        if (!values.username) {
            errors.username = 'Username is required';
        }

        if (!values.role) {
            errors.role = 'Role is required';
        }

        if (values.role !== 'donor' && !values.verificationDocument) {
            errors.verificationDocument = 'Verification document is required for NGOs and Agencies';
        }

        return errors;
    };

    const handleSubmit = async (values) => {
        const errors = validateUserForm(values);
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        try {
            if (values.role === 'donor') {
                values.isVerified = true;
                values.verificationStatus = 'approved';
            }

            await adminApi.createUser(values);
            // ... rest of the code
        } catch (error) {
            console.error('Error submitting form:', error);
            setError('Failed to create user');
        }
    };

    const handleBlockUser = async (user) => {
        try {
            if (user.isBlocked) {
                // For unblocking
                await confirm({
                    title: 'Unblock User',
                    content: (
                        <Box>
                            <Typography gutterBottom>
                                Are you sure you want to unblock {user.username}?
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                Current block reason: {user.blockReason}
                            </Typography>
                        </Box>
                    ),
                    confirmationText: 'Unblock',
                    cancellationText: 'Cancel',
                    confirmationButtonProps: { color: 'success' }
                });

                const result = await adminApi.toggleUserBlock(user._id, {
                    blocked: false,
                    reason: null
                });

                if (result.success) {
                    enqueueSnackbar('User unblocked successfully', { variant: 'success' });
                    await fetchUsers();
                }
            } else {
                // For blocking
                let blockReason = '';

                const BlockDialogContent = ({ onReasonChange }) => (
                    <Box>
                        <DialogContentText gutterBottom>
                            Are you sure you want to block {user.username}?
                        </DialogContentText>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Block Reason"
                            fullWidth
                            multiline
                            rows={3}
                            required
                            onChange={(e) => onReasonChange(e.target.value)}
                            inputProps={{ 
                                minLength: 10,
                                'aria-label': 'Block reason'
                            }}
                            placeholder="Please provide a reason for blocking (minimum 10 characters)"
                        />
                    </Box>
                );

                await confirm({
                    title: 'Block User',
                    content: <BlockDialogContent onReasonChange={(value) => blockReason = value} />,
                    confirmationText: 'Block',
                    cancellationText: 'Cancel',
                    confirmationButtonProps: { color: 'error' },
                    allowClose: true,
                    onConfirm: async () => {
                        if (!blockReason || blockReason.length < 10) {
                            enqueueSnackbar('Block reason must be at least 10 characters long', { 
                                variant: 'error' 
                            });
                            return Promise.reject();
                        }

                        const result = await adminApi.toggleUserBlock(user._id, {
                            blocked: true,
                            reason: blockReason
                        });

                        if (result.success) {
                            enqueueSnackbar('User blocked successfully', { variant: 'success' });
                            await fetchUsers();
                        } else {
                            throw new Error(result.error || 'Failed to block user');
                        }
                    }
                });
            }
        } catch (error) {
            // Only show error if it's not a cancellation
            if (error?.message !== 'Canceled') {
                console.error('Error toggling user block status:', error);
                enqueueSnackbar(
                    'Error updating user status', 
                    { variant: 'error' }
                );
            }
        }
    };

    const handleDeleteUser = async (user) => {
        try {
            // Show confirmation dialog
            await confirm({
                title: 'Delete User',
                description: (
                    <>
                        <Typography color="error" gutterBottom>
                            Warning: This action cannot be undone!
                        </Typography>
                        <Typography>
                            Are you sure you want to delete user "{user.username}"?
                        </Typography>
                        {user.isBlocked && (
                            <Typography variant="body2" color="textSecondary">
                                Note: This user is currently blocked.
                            </Typography>
                        )}
                    </>
                ),
                confirmationText: 'Delete',
                cancellationText: 'Cancel',
                dialogProps: {
                    maxWidth: 'xs'
                },
                confirmationButtonProps: {
                    color: 'error',
                    variant: 'contained'
                }
            });

            // If user confirms, proceed with deletion
            const response = await adminApi.deleteUser(user._id);
            
            if (response.success) {
                enqueueSnackbar('User deleted successfully', { 
                    variant: 'success' 
                });
                await fetchUsers(); // Refresh the user list
            } else {
                throw new Error(response.error || 'Failed to delete user');
            }
        } catch (error) {
            // Only show error if it's not a cancellation
            if (error?.message !== 'Canceled') {
                console.error('Error deleting user:', error);
                enqueueSnackbar(
                    error?.response?.data?.error || 'Error deleting user', 
                    { variant: 'error' }
                );
            }
        }
    };

    const handleEditClick = (user) => {
        setSelectedUser(user);
        setEditDialogOpen(true);
    };

    const handleEditSubmit = async (formData) => {
        try {
            const response = await adminApi.updateUser(selectedUser._id, formData);
            
            if (response.success) {
                enqueueSnackbar('User updated successfully', { 
                    variant: 'success',
                    anchorOrigin: {
                        vertical: 'top',
                        horizontal: 'right',
                    }
                });
                
                await fetchUsers();
                setEditDialogOpen(false);
                setSelectedUser(null);
            }
        } catch (error) {
            console.error('Error updating user:', error);
            enqueueSnackbar(error.message || 'Failed to update user', { 
                variant: 'error',
                anchorOrigin: {
                    vertical: 'top',
                    horizontal: 'right',
                }
            });
        }
    };

    const renderActionButtons = (user) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="View Details">
                <IconButton 
                    size="small" 
                    onClick={() => handleViewUser(user._id)}
                    color="primary"
                >
                    <ViewIcon />
                </IconButton>
            </Tooltip>
            <Tooltip title="Edit User">
                <IconButton 
                    size="small" 
                    onClick={() => handleEditClick(user)}
                    color="primary"
                >
                    <EditIcon />
                </IconButton>
            </Tooltip>
            <Tooltip title={user.isBlocked ? "Unblock User" : "Block User"}>
                <IconButton 
                    size="small" 
                    onClick={() => handleBlockUser(user)}
                    color={user.isBlocked ? "success" : "error"}
                    aria-label={user.isBlocked ? `Unblock ${user.username}` : `Block ${user.username}`}
                >
                    {user.isBlocked ? <UnblockIcon /> : <BlockIcon />}
                </IconButton>
            </Tooltip>
            <Tooltip title="Delete User">
                <IconButton 
                    size="small" 
                    onClick={() => handleDeleteUser(user)}
                    color="error"
                    aria-label={`Delete ${user.username}`}
                >
                    <DeleteIcon />
                </IconButton>
            </Tooltip>
        </Box>
    );

    const handleSort = (key) => {
        setSortConfig(prevConfig => ({
            key,
            direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const getSortedTransactions = (transactions) => {
        if (!transactions) return [];

        return [...transactions].sort((a, b) => {
            const direction = sortConfig.direction === 'asc' ? 1 : -1;

            switch (sortConfig.key) {
                case 'date':
                    return direction * (new Date(a.date) - new Date(b.date));
                case 'donor':
                    return direction * a.sender.localeCompare(b.sender);
                case 'category':
                    return direction * (a.itemCategory || '').localeCompare(b.itemCategory || '');
                case 'wasteType':
                    return direction * (a.wasteType || '').localeCompare(b.wasteType || '');
                case 'quantity':
                    return direction * (Number(a.quantity) - Number(b.quantity));
                case 'points':
                    return direction * (Number(a.points) - Number(b.points));
                default:
                    return 0;
            }
        });
    };

    const PointsSummary = () => {
        const availablePoints = userDetails.availablePoints || [];
        
        return (
            <Box sx={{ mt: 2, mb: 2 }}>
                <Typography variant="h6" gutterBottom>Points Summary</Typography>
                <Grid container spacing={2}>
                    {availablePoints.map((point) => (
                        <Grid item xs={12} sm={6} md={4} key={point.agency}>
                            <Paper sx={{ p: 2 }}>
                                <Typography variant="subtitle2" color="textSecondary">
                                    {point.agency}
                                </Typography>
                                <Typography variant="h6">
                                    {point.points} Points
                                </Typography>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            </Box>
        );
    };

    const handleInstantSearch = (e) => {
        const value = e.target.value;
        setTransactionFilters(prev => ({
            ...prev,
            search: value
        }));
    };

    const handleSortChange = (value) => {
        setTransactionFilters(prev => ({
            ...prev,
            sortBy: value
        }));
    };

    const handleOrderChange = (value) => {
        setTransactionFilters(prev => ({
            ...prev,
            sortOrder: value
        }));
    };

    const handlePointsChange = (type, value) => {
        setTransactionFilters(prev => ({
            ...prev,
            [type === 'min' ? 'minPoints' : 'maxPoints']: value
        }));
    };

    const handleRemoveFilter = (key) => {
        setTransactionFilters(prev => ({
            ...prev,
            [key]: ''
        }));
    };

    const handleClearAll = () => {
        setTransactionFilters({
            search: '',
            sortBy: 'date',
            sortOrder: 'desc',
            minPoints: '',
            maxPoints: ''
        });
        setActiveFilters([]);
    };

    const handleClearSearch = () => {
        setTransactionFilters(prev => ({
            ...prev,
            search: ''
        }));
    };

    useEffect(() => {
        const newActiveFilters = [];
        if (transactionFilters.search) {
            newActiveFilters.push({
                key: 'search',
                label: 'Search',
                value: transactionFilters.search
            });
        }
        if (transactionFilters.minPoints) {
            newActiveFilters.push({
                key: 'minPoints',
                label: 'Min Points',
                value: transactionFilters.minPoints
            });
        }
        if (transactionFilters.maxPoints) {
            newActiveFilters.push({
                key: 'maxPoints',
                label: 'Max Points',
                value: transactionFilters.maxPoints
            });
        }
        setActiveFilters(newActiveFilters);
    }, [transactionFilters]);

    return (
        <AdminLayout>
            <Box sx={{ p: 3 }}>
                <Typography variant="h4" gutterBottom>
                    User Management
                </Typography>

                {/* Filters */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} md={3}>
                        <TextField
                            fullWidth
                            label="Search"
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                        />
                    </Grid>
                    <Grid item xs={12} md={2}>
                        <FormControl fullWidth>
                            <InputLabel>Role</InputLabel>
                            <Select
                                value={filters.role}
                                onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                            >
                                <MenuItem value="all">All</MenuItem>
                                <MenuItem value="donor">Donor</MenuItem>
                                <MenuItem value="ngo">NGO</MenuItem>
                                <MenuItem value="compostAgency">Agency</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    {/* Add more filters */}
                </Grid>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {loading ? (
                    <Box display="flex" justifyContent="center" p={3}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <>
                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Username</TableCell>
                                        <TableCell>Email</TableCell>
                                        <TableCell>Role</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {users && users.length > 0 ? (
                                        users
                                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                            .map((user) => (
                                                <TableRow 
                                                    key={user._id}
                                                    sx={{
                                                        backgroundColor: user.isBlocked ? 'rgba(0, 0, 0, 0.1)' : 'inherit',
                                                        opacity: user.isBlocked ? 0.7 : 1,
                                                        '&:hover': {
                                                            backgroundColor: user.isBlocked ? 'rgba(0, 0, 0, 0.15)' : 'rgba(0, 0, 0, 0.04)'
                                                        }
                                                    }}
                                                >
                                                    <TableCell>{user.username}</TableCell>
                                                    <TableCell>{user.email}</TableCell>
                                                    <TableCell>
                                                        <Chip 
                                                            label={user.role} 
                                                            color="primary"
                                                            sx={{ opacity: user.isBlocked ? 0.6 : 1 }}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Tooltip 
                                                            title={user.isBlocked ? `Blocked: ${user.blockReason}` : 'Active'}
                                                            arrow
                                                            placement="top"
                                                        >
                                                            <Chip 
                                                                label={user.isBlocked ? 'Blocked' : 'Active'} 
                                                                color={user.isBlocked ? 'error' : 'success'}
                                                                variant={user.isBlocked ? 'outlined' : 'filled'}
                                                            />
                                                        </Tooltip>
                                                    </TableCell>
                                                    <TableCell>
                                                        {renderActionButtons(user)}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5} align="center">
                                                No users found
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        <TablePagination
                            component="div"
                            count={users.length}
                            page={page}
                            onPageChange={(e, newPage) => setPage(newPage)}
                            rowsPerPage={rowsPerPage}
                            onRowsPerPageChange={(e) => {
                                setRowsPerPage(parseInt(e.target.value, 10));
                                setPage(0);
                            }}
                        />
                    </>
                )}

                <UserDetailsDialog
                    open={openDialog}
                    onClose={handleCloseDialog}
                    userDetails={userDetails}
                    tabValue={tabValue}
                    onTabChange={(e, newValue) => setTabValue(newValue)}
                    transactionFilters={transactionFilters}
                    onFilterChange={(filters) => setTransactionFilters(filters)}
                    onClearFilters={handleClearAll}
                />

                <UserEditDialog
                    open={editDialogOpen}
                    onClose={() => {
                        setEditDialogOpen(false);
                        setSelectedUser(null);
                    }}
                    user={selectedUser}
                    onSubmit={handleEditSubmit}
                />
            </Box>
        </AdminLayout>
    );
};

export default Users; 