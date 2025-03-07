import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Grid,
    Typography,
    CircularProgress,
    Alert,
    Card,
    CardContent,
    Box,
    Dialog,
    DialogTitle,
    DialogContent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TableSortLabel,
    Paper,
    IconButton,
    Chip,
    Tooltip,
    TablePagination,
    Box as MuiBox,
    Select,
    MenuItem,
    TextField,
    FormControl,
    InputLabel,
    Stack,
    Button,
    Collapse,
    Fade,
    styled,
    GlobalStyles,
    InputAdornment,
    OutlinedInput,
    Divider
} from '@mui/material';
import {
    PeopleAlt,
    DeleteSweep as WasteIcon,
    CardGiftcard as DonationIcon,
    Receipt as TransactionIcon,
    Close as CloseIcon,
    FilterList as FilterIcon,
    DateRange as DateIcon,
    Category as CategoryIcon,
    Sort as SortIcon,
    Scale as QuantityIcon,
    Info as InfoIcon,
    Search as SearchIcon,
    GetApp as GetAppIcon
} from '@mui/icons-material';
import { adminApi } from '../../services/adminApi';
import AdminLayout from '../../components/admin/AdminLayout';
import UserModal from '../../components/admin/UserModal';
import ExportPreview from '../../components/admin/ExportPreview';

import * as XLSX from 'xlsx';



// Use MUI's styled API instead
const globalStyles = {
  '*': {
    outline: 'none !important',
    '&:focus': {
      outline: 'none !important'
    },
    '&::selection': {
      background: 'transparent'
    }
  }
};

// Styled components for better table layout
const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
    maxHeight: '70vh',
    boxShadow: theme.shadows[5],
    '& .MuiTableHead-root': {
        position: 'sticky',
        top: 0,
        zIndex: 1,
        backgroundColor: theme.palette.background.paper
    },
    '& .MuiTableRow-root': {
        '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
            transition: 'background-color 0.2s ease'
        },
        '&:hover td': {
            backgroundColor: 'transparent'
        },
        '&:focus': {
            outline: 'none'
        },
        '& td': {
            borderBottom: `1px solid ${theme.palette.divider}`,
            '&:hover': {
                backgroundColor: 'transparent'
            }
        }
    },
    '& *:focus': {
        outline: 'none'
    }
}));

const StyledDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialog-paper': {
        maxWidth: '100%',
        maxHeight: '100%',
        margin: 16,
        width: '95vw',
        height: '90vh',
        background: '#ffffff',
        boxShadow: theme.shadows[5],
        border: 'none',
        '& *': {
            outline: 'none !important'
        }
    },
    '& .MuiBackdrop-root': {
        backgroundColor: 'rgba(0, 0, 0, 0.7)'
    }
}));

const FilterCard = styled(Card)(({ theme }) => ({
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
    boxShadow: theme.shadows[3],
    background: '#ffffff',
    border: 'none'
}));

const StyledButton = styled(Button)(({ theme }) => ({
    '&:focus': {
        outline: 'none',
        boxShadow: 'none'
    },
    '&.MuiButton-root': {
        '&:focus': {
            outline: 'none'
        }
    },
    '&.Mui-focusVisible': {
        outline: 'none',
        boxShadow: 'none'
    },
    '&::selection': {
        background: 'transparent'
    },
    '& *': {
        outline: 'none !important',
        '&:focus': {
            outline: 'none !important'
        },
        '&::selection': {
            background: 'transparent'
        }
    }
}));

const StyledCollapse = styled(Collapse)(({ theme }) => ({
    transition: 'none !important',
    '& .MuiCollapse-wrapper': {
        transition: 'none !important'
    },
    '& .MuiCollapse-wrapperInner': {
        transition: 'none !important'
    },
    '& *': {
        outline: 'none !important',
        transition: 'none !important'
    }
}));

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalType, setModalType] = useState(null);
    const [modalData, setModalData] = useState(null);
    const navigate = useNavigate();
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [pointsSort, setPointsSort] = useState('none');
    const [quantityFilter, setQuantityFilter] = useState('');
    const [filtersOpen, setFiltersOpen] = useState(true);
    const [showUserModal, setShowUserModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredTransactions, setFilteredTransactions] = useState([]);
    const [sortConfig, setSortConfig] = useState({
        key: null,
        direction: 'asc'
    });
    const [showExport, setShowExport] = useState(false)

    const exportToExcel = () => {
        const transactions = filteredTransactions; // Use the filtered transactions
        if (!transactions.length) {
            alert('No data to export');
            return;
        }
    
        // Map data for Excel
        const data = transactions.map(transaction => ({
            Sender: transaction.sender || '',
            Receiver: transaction.receiver || '',
            Type: transaction.type || '',
            Category: transaction.itemCategory || '',
            'Item Name': transaction.itemName || '',
            'Waste Type': transaction.wasteType || '',
            'Item Type': transaction.itemType || '',
            Quantity: transaction.quantity || '',
            Description: transaction.description || '',
            Points: transaction.points || '',
            Status: transaction.status || '',
            Date: new Date(transaction.createdAt).toLocaleDateString() || ''
        }));
    
        // Create a worksheet and workbook
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');
    
        // Export the workbook as an Excel file
        XLSX.writeFile(workbook, 'transactions.xlsx');
    };
    useEffect(() => {
        fetchDashboardData();
    }, []);

    useEffect(() => {
        applyFiltersAndSearch();
    }, [startDate, endDate, statusFilter, typeFilter, quantityFilter, pointsSort, searchQuery, modalData]);

    const fetchDashboardData = async () => {
        try {
            const response = await adminApi.getDashboardStats();
            setStats(response);
            if (response?.transactions) {
                setModalData({ transactions: response.transactions });
                setFilteredTransactions(response.transactions); // Show all transactions by default
            }
            setLoading(false);
        } catch (error) {
            setError('Failed to load dashboard data');
            setLoading(false);
        }
    };

    const applyFiltersAndSearch = () => {
        let transactions = modalData?.transactions || [];

        // Apply date range filter
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            end.setHours(23, 59, 59);
            transactions = transactions.filter(transaction => {
                const transactionDate = new Date(transaction.createdAt);
                return transactionDate >= start && transactionDate <= end;
            });
        }

        // Apply status filter
        if (statusFilter !== 'all') {
            transactions = transactions.filter(transaction => transaction.status === statusFilter);
        }

        // Apply type filter
        if (typeFilter !== 'all') {
            transactions = transactions.filter(transaction => transaction.type === typeFilter);
        }

        // Apply quantity filter
        if (quantityFilter) {
            transactions = transactions.filter(transaction => transaction.quantity >= parseInt(quantityFilter, 10));
        }

        // Apply sorting
        if (pointsSort === 'highest') {
            transactions = transactions.sort((a, b) => b.points - a.points);
        } else if (pointsSort === 'lowest') {
            transactions = transactions.sort((a, b) => a.points - b.points);
        }

        // Apply search
        if (searchQuery) {
            const searchTerms = searchQuery.toLowerCase().split(' ').filter(term => term);
            transactions = transactions.filter(transaction => {
                const searchableFields = [
                    transaction.sender,
                    transaction.receiver,
                    transaction.type,
                    transaction.itemCategory,
                    transaction.itemName,
                    transaction.wasteType,
                    transaction.itemType,
                    transaction.description,
                    transaction.status,
                    transaction.quantity?.toString(),
                    transaction.points?.toString(),
                    new Date(transaction.createdAt).toLocaleDateString()
                ];
                return searchTerms.every(term =>
                    searchableFields.some(field => field?.toLowerCase().includes(term))
                );
            });
        }

        setFilteredTransactions(transactions);
    };



    const clearFilters = () => {
        setStartDate('');
        setEndDate('');
        setStatusFilter('all');
        setTypeFilter('all');
        setPointsSort('none');
        setQuantityFilter('');
        setSearchQuery('');
        setFilteredTransactions(modalData?.transactions || []); // Reset to all transactions
    };

    const handleCardClick = async (type) => {
        try {
            let data;
            switch(type) {
                case 'waste':
                    data = await adminApi.getWasteDetails();
                    break;
                case 'donations':
                    data = await adminApi.getDonationDetails();
                    break;
                case 'transactions':
                    data = await adminApi.getTransactionDetails();
                    break;
                default:
                    return;
            }
            setModalType(type);
            setModalData(data);
            setModalOpen(true);
        } catch (error) {
            console.error('Error fetching modal data:', error);
            setError('Failed to load details');
        }
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const filterTransactions = (transactions) => {
        return transactions.filter(transaction => {
            // Date range filter
            if (startDate && endDate) {
                const transactionDate = new Date(transaction.createdAt);
                const start = new Date(startDate);
                const end = new Date(endDate);
                end.setHours(23, 59, 59); // Include the entire end date
                if (transactionDate < start || transactionDate > end) return false;
            }

            // Status filter
            if (statusFilter !== 'all' && transaction.status !== statusFilter) return false;

            // Type filter
            if (typeFilter !== 'all' && transaction.type !== typeFilter) return false;

            // Quantity filter
            if (quantityFilter && transaction.quantity < parseInt(quantityFilter)) return false;

            return true;
        }).sort((a, b) => {
            // Points sorting
            if (pointsSort === 'highest') return b.points - a.points;
            if (pointsSort === 'lowest') return a.points - b.points;
            return 0;
        });
    };

    const searchTransactions = (transactions, query) => {
        if (!query) return transactions;

        const searchTerms = query.toLowerCase().split(' ').filter(term => term);
        
        return transactions.filter(transaction => {
            const searchableFields = [
                transaction.sender,
                transaction.receiver,
                transaction.type,
                transaction.itemCategory,
                transaction.itemName,
                transaction.wasteType,
                transaction.itemType,
                transaction.description,
                transaction.status,
                transaction.quantity?.toString(),
                transaction.points?.toString(),
                new Date(transaction.createdAt).toLocaleDateString()
            ];

            // Check if all search terms match any field
            return searchTerms.every(term => 
                searchableFields.some(field => 
                    field?.toLowerCase().includes(term)
                )
            );
        });
    };

    
    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
        setFilteredTransactions(prev =>
            [...prev].sort((a, b) => {
                if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
                if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
                return 0;
            })
        );
    };

    const getSortedData = (data) => {
        if (!sortConfig.key) return data;

        return [...data].sort((a, b) => {
            if (a[sortConfig.key] < b[sortConfig.key]) {
                return sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (a[sortConfig.key] > b[sortConfig.key]) {
                return sortConfig.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });
    };

    const renderFilters = () => (
        <Box mb={2}>
            <StyledButton
                startIcon={<FilterIcon />}
                onClick={() => setFiltersOpen(!filtersOpen)}
                sx={{ mb: 1 }}
            >
                {filtersOpen ? 'Hide Filters' : 'Show Filters'}
            </StyledButton>
            <StyledCollapse in={filtersOpen}>
                <FilterCard>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <Stack spacing={2}>
                                <Box display="flex" alignItems="center" gap={1}>
                                    <DateIcon color="action" />
                                    <TextField
                                        label="Start Date"
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        InputLabelProps={{ shrink: true }}
                                        fullWidth
                                    />
                                </Box>
                                <Box display="flex" alignItems="center" gap={1}>
                                    <DateIcon color="action" />
                                    <TextField
                                        label="End Date"
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        InputLabelProps={{ shrink: true }}
                                        fullWidth
                                    />
                                </Box>
                            </Stack>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Stack spacing={2}>
                                <Box display="flex" alignItems="center" gap={1}>
                                    <CategoryIcon color="action" />
                                    <FormControl fullWidth>
                                        <InputLabel>Status</InputLabel>
                                        <Select
                                            value={statusFilter}
                                            onChange={(e) => setStatusFilter(e.target.value)}
                                            label="Status"
                                        >
                                            <MenuItem value="all">All</MenuItem>
                                            <MenuItem value="pending">Pending</MenuItem>
                                            <MenuItem value="accepted">Accepted</MenuItem>
                                            <MenuItem value="rejected">Rejected</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Box>
                                <Box display="flex" alignItems="center" gap={1}>
                                    <CategoryIcon color="action" />
                                    <FormControl fullWidth>
                                        <InputLabel>Type</InputLabel>
                                        <Select
                                            value={typeFilter}
                                            onChange={(e) => setTypeFilter(e.target.value)}
                                            label="Type"
                                        >
                                            <MenuItem value="all">All</MenuItem>
                                            <MenuItem value="ngo">NGO</MenuItem>
                                            <MenuItem value="compostAgency">Compost Agency</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Box>
                            </Stack>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Stack spacing={2}>
                                <Box display="flex" alignItems="center" gap={1}>
                                    <SortIcon color="action" />
                                    <FormControl fullWidth>
                                        <InputLabel>Points</InputLabel>
                                        <Select
                                            value={pointsSort}
                                            onChange={(e) => setPointsSort(e.target.value)}
                                            label="Points"
                                        >
                                            <MenuItem value="none">None</MenuItem>
                                            <MenuItem value="highest">Highest First</MenuItem>
                                            <MenuItem value="lowest">Lowest First</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Box>
                                <Box display="flex" alignItems="center" gap={1}>
                                    <QuantityIcon color="action" />
                                    <TextField
                                        label="Min Quantity"
                                        type="number"
                                        value={quantityFilter}
                                        onChange={(e) => setQuantityFilter(e.target.value)}
                                        fullWidth
                                    />
                                </Box>
                            </Stack>
                        </Grid>
                    </Grid>
                </FilterCard>
            </StyledCollapse>
        </Box>
    );

    const renderModalContent = () => {
        switch(modalType) {
            case 'waste':
                return (
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <Tooltip title="Total food waste collected from donors">
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6">Food Waste</Typography>
                                        <Typography variant="h4">{modalData?.foodWaste || 0} kg</Typography>
                                    </CardContent>
                                </Card>
                            </Tooltip>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Tooltip title="Total e-waste collected from donors">
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6">E-Waste</Typography>
                                        <Typography variant="h4">{modalData?.eWaste || 0} kg</Typography>
                                    </CardContent>
                                </Card>
                            </Tooltip>
                        </Grid>
                    </Grid>
                );

            case 'donations':
                return (
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6} lg={3}>
                            <Tooltip title="Total food items donated">
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6">Food</Typography>
                                        <Typography variant="h4">{modalData?.food || 0}</Typography>
                                    </CardContent>
                                </Card>
                            </Tooltip>
                        </Grid>
                        <Grid item xs={12} md={6} lg={3}>
                            <Tooltip title="Total books donated">
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6">Books</Typography>
                                        <Typography variant="h4">{modalData?.books || 0}</Typography>
                                    </CardContent>
                                </Card>
                            </Tooltip>
                        </Grid>
                        <Grid item xs={12} md={6} lg={3}>
                            <Tooltip title="Total clothes donated">
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6">Clothes</Typography>
                                        <Typography variant="h4">{modalData?.clothes || 0}</Typography>
                                    </CardContent>
                                </Card>
                            </Tooltip>
                        </Grid>
                        <Grid item xs={12} md={6} lg={3}>
                            <Tooltip title="Total other items donated">
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6">Others</Typography>
                                        <Typography variant="h4">{modalData?.others || 0}</Typography>
                                    </CardContent>
                                </Card>
                            </Tooltip>
                        </Grid>
                    </Grid>
                );

                case 'transactions':
                    return (
                        <Box>
                            <Box mb={2} display="flex" justifyContent="space-between" alignItems="center">
                                <StyledButton
                                    startIcon={<FilterIcon />}
                                    onClick={() => setFiltersOpen(!filtersOpen)}
                                >
                                    {filtersOpen ? 'Hide Filters' : 'Show Filters'}
                                </StyledButton>
                                <Stack direction="row" spacing={2}>
                                    <StyledButton
                                        color="secondary"
                                        variant="outlined"
                                        onClick={clearFilters}
                                    >
                                        Clear Filters
                                    </StyledButton>
                                    <StyledButton
                                        color="primary"
                                        variant="contained"
                                        startIcon={<GetAppIcon />}
                                        onClick={exportToExcel}
                                    >
                                        Export to Excel
                                    </StyledButton>
                                </Stack>
                            </Box>
                            <Collapse in={filtersOpen}>
                                <FilterCard>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} md={6}>
                                            <TextField
                                                label="Start Date"
                                                type="date"
                                                value={startDate}
                                                onChange={(e) => setStartDate(e.target.value)}
                                                fullWidth
                                                InputLabelProps={{ shrink: true }}
                                            />
                                            <TextField
                                                label="End Date"
                                                type="date"
                                                value={endDate}
                                                onChange={(e) => setEndDate(e.target.value)}
                                                fullWidth
                                                InputLabelProps={{ shrink: true }}
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <FormControl fullWidth>
                                                <InputLabel>Status</InputLabel>
                                                <Select
                                                    value={statusFilter}
                                                    onChange={(e) => setStatusFilter(e.target.value)}
                                                >
                                                    <MenuItem value="all">All</MenuItem>
                                                    <MenuItem value="pending">Pending</MenuItem>
                                                    <MenuItem value="accepted">Accepted</MenuItem>
                                                    <MenuItem value="rejected">Rejected</MenuItem>
                                                </Select>
                                            </FormControl>
                                            <FormControl fullWidth>
                                                <InputLabel>Type</InputLabel>
                                                <Select
                                                    value={typeFilter}
                                                    onChange={(e) => setTypeFilter(e.target.value)}
                                                >
                                                    <MenuItem value="all">All</MenuItem>
                                                    <MenuItem value="ngo">NGO</MenuItem>
                                                    <MenuItem value="compostAgency">Compost Agency</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                    </Grid>
                                </FilterCard>
                            </Collapse>
                            <StyledTableContainer>
                                <Table stickyHeader>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>
                                                <TableSortLabel
                                                    active={sortConfig.key === 'sender'}
                                                    direction={sortConfig.direction}
                                                    onClick={() => handleSort('sender')}
                                                >
                                                    Sender
                                                </TableSortLabel>
                                            </TableCell>
                                            <TableCell>Receiver</TableCell>
                                            <TableCell>Type</TableCell>
                                            <TableCell>Category</TableCell>
                                            <TableCell>Item Name</TableCell>
                                            <TableCell>Waste Type</TableCell>
                                            <TableCell>Item Type</TableCell>
                                            <TableCell>
                                                <TableSortLabel
                                                    active={sortConfig.key === 'quantity'}
                                                    direction={sortConfig.direction}
                                                    onClick={() => handleSort('quantity')}
                                                >
                                                    Quantity
                                                </TableSortLabel>
                                            </TableCell>
                                            <TableCell>Description</TableCell>
                                            <TableCell>
                                                <TableSortLabel
                                                    active={sortConfig.key === 'points'}
                                                    direction={sortConfig.direction}
                                                    onClick={() => handleSort('points')}
                                                >
                                                    Points
                                                </TableSortLabel>
                                            </TableCell>
                                            <TableCell>Status</TableCell>
                                            <TableCell>
                                                <TableSortLabel
                                                    active={sortConfig.key === 'createdAt'}
                                                    direction={sortConfig.direction}
                                                    onClick={() => handleSort('createdAt')}
                                                >
                                                    Date
                                                </TableSortLabel>
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {filteredTransactions.map((transaction, index) => (
                                            <TableRow key={index}>
                                                <TableCell>{transaction.sender}</TableCell>
                                                <TableCell>{transaction.receiver}</TableCell>
                                                <TableCell>{transaction.type}</TableCell>
                                                <TableCell>{transaction.itemCategory}</TableCell>
                                                <TableCell>{transaction.itemName}</TableCell>
                                                <TableCell>{transaction.wasteType}</TableCell>
                                                <TableCell>{transaction.itemType}</TableCell>
                                                <TableCell>{transaction.quantity}</TableCell>
                                                <TableCell>{transaction.description}</TableCell>
                                                <TableCell>{transaction.points}</TableCell>
                                                <TableCell>{transaction.status}</TableCell>
                                                <TableCell>{new Date(transaction.createdAt).toLocaleDateString()}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </StyledTableContainer>
                        </Box>
                    );
                                // const transactions = modalData?.transactions || [];
                // const filtered = getSortedData(searchTransactions(transactions, searchQuery));
                
                return (
                    <Box>
                    <Box mb={2} display="flex" justifyContent="space-between">
                        <StyledButton
                            startIcon={<FilterIcon />}
                            onClick={() => setFiltersOpen(!filtersOpen)}
                        >
                            {filtersOpen ? 'Hide Filters' : 'Show Filters'}
                        </StyledButton>
                        <StyledButton
                            color="secondary"
                            variant="outlined"
                            onClick={clearFilters}
                        >
                            Clear Filters
                        </StyledButton>
                    </Box>
                    <Collapse in={filtersOpen}>
                        <FilterCard>
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        label="Start Date"
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        fullWidth
                                        InputLabelProps={{ shrink: true }}
                                    />
                                    <TextField
                                        label="End Date"
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        fullWidth
                                        InputLabelProps={{ shrink: true }}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <FormControl fullWidth>
                                        <InputLabel>Status</InputLabel>
                                        <Select
                                            value={statusFilter}
                                            onChange={(e) => setStatusFilter(e.target.value)}
                                        >
                                            <MenuItem value="all">All</MenuItem>
                                            <MenuItem value="pending">Pending</MenuItem>
                                            <MenuItem value="accepted">Accepted</MenuItem>
                                            <MenuItem value="rejected">Rejected</MenuItem>
                                        </Select>
                                    </FormControl>
                                    <FormControl fullWidth>
                                        <InputLabel>Type</InputLabel>
                                        <Select
                                            value={typeFilter}
                                            onChange={(e) => setTypeFilter(e.target.value)}
                                        >
                                            <MenuItem value="all">All</MenuItem>
                                            <MenuItem value="ngo">NGO</MenuItem>
                                            <MenuItem value="compostAgency">Compost Agency</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                            </Grid>
                        </FilterCard>
                    </Collapse>

                    <StyledTableContainer>
                        <Table stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell>
                                        <TableSortLabel
                                            active={sortConfig.key === 'sender'}
                                            direction={sortConfig.direction}
                                            onClick={() => handleSort('sender')}
                                        >
                                            Sender
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell>Receiver</TableCell>
                                    <TableCell>Type</TableCell>
                                    <TableCell>Category</TableCell>
                                    <TableCell>Item Name</TableCell>
                                    <TableCell>Waste Type</TableCell>
                                    <TableCell>Item Type</TableCell>
                                    <TableCell>
                                        <TableSortLabel
                                            active={sortConfig.key === 'quantity'}
                                            direction={sortConfig.direction}
                                            onClick={() => handleSort('quantity')}
                                        >
                                            Quantity
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell>Description</TableCell>
                                    <TableCell>
                                        <TableSortLabel
                                            active={sortConfig.key === 'points'}
                                            direction={sortConfig.direction}
                                            onClick={() => handleSort('points')}
                                        >
                                            Points
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>
                                        <TableSortLabel
                                            active={sortConfig.key === 'createdAt'}
                                            direction={sortConfig.direction}
                                            onClick={() => handleSort('createdAt')}
                                        >
                                            Date
                                        </TableSortLabel>
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredTransactions
                                    .map((transaction, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{transaction.sender}</TableCell>
                                            <TableCell>{transaction.receiver}</TableCell>
                                            <TableCell>{transaction.type}</TableCell>
                                            <TableCell>{transaction.itemCategory}</TableCell>
                                            <TableCell>{transaction.itemName}</TableCell>
                                            <TableCell>{transaction.wasteType}</TableCell>
                                            <TableCell>{transaction.itemType}</TableCell>
                                            <TableCell>{transaction.quantity}</TableCell>
                                            <TableCell>{transaction.description}</TableCell>
                                            <TableCell>{transaction.points}</TableCell>
                                            <TableCell>{transaction.status}</TableCell>
                                            <TableCell>{new Date(transaction.createdAt).toLocaleDateString()}</TableCell>
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </Table>
                    </StyledTableContainer>
                </Box>
                );

            default:
                return null;
        }
    };

    const StatCard = ({ title, value, icon: Icon, color, onClick }) => (
        <Card 
            sx={{ 
                height: '100%', 
                cursor: onClick ? 'pointer' : 'default',
                '&:hover': onClick ? {
                    transform: 'scale(1.02)',
                    transition: 'transform 0.2s',
                    boxShadow: 3
                } : {}
            }}
            onClick={onClick}
        >
            <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                        <Typography color="textSecondary" gutterBottom>
                            {title}
                        </Typography>
                        <Typography variant="h4">
                            {value}
                        </Typography>
                    </Box>
                    <Icon sx={{ fontSize: 40, color }} />
                </Box>
            </CardContent>
        </Card>
    );

    const getTotalWaste = () => {
        const food = Number(stats?.stats?.waste?.food || 0);
        const eWaste = Number(stats?.stats?.waste?.eWaste || 0);
        return `${(food + eWaste).toFixed(1)}kg`;
    };

    const getTotalDonations = () => {
        if (!stats?.stats?.donations) return 0;
        return Object.values(stats.stats.donations).reduce((sum, val) => sum + Number(val || 0), 0);
    };

    if (loading) {
        return (
            <AdminLayout>
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                    <CircularProgress />
                </Box>
            </AdminLayout>
        );
    }

    if (error) {
        return (
            <AdminLayout>
                <Alert severity="error">{error}</Alert>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <GlobalStyles styles={globalStyles} />
            <Box sx={{ p: 3 }}>
                <Typography variant="h4" gutterBottom>
                    Dashboard Overview
                </Typography>

                <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="Total Users"
                            value={stats?.stats?.users?.total || 0}
                            icon={PeopleAlt}
                            color="#1976d2"
                            onClick={() => setShowUserModal(true)}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="Total Waste Collected"
                            value={getTotalWaste()}
                            icon={WasteIcon}
                            color="#2e7d32"
                            onClick={() => handleCardClick('waste')}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="Total Donations"
                            value={getTotalDonations()}
                            icon={DonationIcon}
                            color="#ed6c02"
                            onClick={() => handleCardClick('donations')}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="Total Transactions"
                            value={stats?.stats?.overview?.totalTransactions || 0}
                            icon={TransactionIcon}
                            color="#9c27b0"
                            onClick={() => handleCardClick('transactions')}
                        />
                    </Grid>
                </Grid>

                <Dialog
                    open={modalOpen}
                    onClose={() => setModalOpen(false)}
                    maxWidth={false}
                    TransitionProps={{
                        timeout: 0
                    }}
                >
                    <Box sx={{ 
                        width: '95vw', 
                        height: '90vh',
                        background: '#ffffff',
                        boxShadow: 'none',
                        border: 'none'
                    }}>
                        <DialogTitle>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                {modalType === 'waste' ? 'Waste Collection Details' :
                                 modalType === 'donations' ? 'Donation Details' :
                                 'Transaction Details'}
                                <IconButton onClick={() => setModalOpen(false)}>
                                    <CloseIcon />
                                </IconButton>
                            </Box>
                        </DialogTitle>
                        <DialogContent>
                            {renderModalContent()}
                        </DialogContent>
                    </Box>
                </Dialog>

                <UserModal
                    open={showUserModal}
                    onClose={() => setShowUserModal(false)}
                    userStats={stats?.stats?.users}
                />
            </Box>
        </AdminLayout>
    );
};

export default Dashboard; 