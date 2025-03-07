import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Grid,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    IconButton
} from '@mui/material';
import axios from 'axios';
import config from '../config';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { startOfDay, endOfDay } from 'date-fns';
import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';
import InputAdornment from '@mui/material/InputAdornment';

const AgencyHistory = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [statusFilter, setStatusFilter] = useState('all');
    const [wasteTypeFilter, setWasteTypeFilter] = useState('all');
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [summary, setSummary] = useState({
        totalTransactions: 0,
        totalWasteCollected: 0,
        totalPointsAwarded: 0,
        highestPoints: 0,
        lowestPoints: Infinity
    });
    const [pointsRange, setPointsRange] = useState({ min: '', max: '' });
    const [quantityRange, setQuantityRange] = useState({ min: '', max: '' });
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    const calculateWasteTotals = (transactions) => {
        const acceptedTransactions = transactions.filter(t => t.status === 'accepted');
        return {
            foodWaste: acceptedTransactions
                .filter(t => t.wasteType === 'food')
                .reduce((sum, t) => sum + (t.quantity || 0), 0),
            eWaste: acceptedTransactions
                .filter(t => t.wasteType === 'e-waste')
                .reduce((sum, t) => sum + (t.quantity || 0), 0)
        };
    };

    const fetchHistory = async () => {
        try {
            const token = localStorage.getItem('token')?.replace(/"/g, '');
            const headers = {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            };

            console.log("Fetching agency history...");

            // Get all completed transactions (both accepted and rejected)
            const response = await axios.get(
                `${config.BACKEND_API}/agency/transactions/history`,
                { headers }
            );

            console.log("Raw API response:", response.data);

            if (response.data && response.data.transactions) {
                const allTransactions = response.data.transactions;
                console.log("All completed transactions:", allTransactions);

                const acceptedTransactions = allTransactions.filter(t => t.status === 'accepted');
                const wasteTotals = calculateWasteTotals(allTransactions);
                
                const summary = {
                    totalTransactions: acceptedTransactions.length,
                    totalWasteCollected: acceptedTransactions.reduce((sum, t) => sum + (t.quantity || 0), 0),
                    totalPointsAwarded: acceptedTransactions.reduce((sum, t) => sum + ((t.quantity || 0) * 10), 0),
                    foodWasteTotal: wasteTotals.foodWaste,
                    eWasteTotal: wasteTotals.eWaste
                };

                setHistory(allTransactions);
                setSummary(summary);
            }

        } catch (error) {
            console.error('Error fetching history:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const handleSearch = (query) => {
        setSearchQuery(query);
        setIsSearching(!!query);

        if (!query.trim()) {
            setSearchResults([]);
            return;
        }

        const searchTerms = query.toLowerCase().split(' ').filter(term => term);
        
        const results = history.filter(transaction => {
            const searchableFields = {
                sender: transaction.sender?.toLowerCase() || '',
                wasteType: transaction.wasteType?.toLowerCase() || '',
                itemType: transaction.itemType?.toLowerCase() || '',
                status: transaction.status?.toLowerCase() || '',
                quantity: transaction.quantity?.toString() || '',
                points: (transaction.quantity * 10)?.toString() || '',
                date: new Date(transaction.createdAt).toLocaleDateString(),
                time: new Date(transaction.createdAt).toLocaleTimeString()
            };

            // Score-based matching
            let score = 0;
            const maxScore = searchTerms.length;

            for (const term of searchTerms) {
                // Exact matches get highest score
                if (Object.values(searchableFields).some(field => field === term)) {
                    score += 1;
                    continue;
                }

                // Partial matches get partial score
                if (Object.values(searchableFields).some(field => field.includes(term))) {
                    score += 0.5;
                    continue;
                }

                // Fuzzy matches (allowing for typos) get lower score
                if (Object.values(searchableFields).some(field => {
                    const distance = levenshteinDistance(field, term);
                    return distance <= 2; // Allow up to 2 character differences
                })) {
                    score += 0.2;
                }
            }

            return score > 0;
        }).sort((a, b) => {
            // Sort by relevance (date if scores are equal)
            const scoreA = getSearchScore(a, searchTerms);
            const scoreB = getSearchScore(b, searchTerms);
            
            if (scoreA === scoreB) {
                return new Date(b.createdAt) - new Date(a.createdAt);
            }
            return scoreB - scoreA;
        });

        setSearchResults(results);
    };

    const levenshteinDistance = (str1, str2) => {
        const track = Array(str2.length + 1).fill(null).map(() =>
            Array(str1.length + 1).fill(null));

        for (let i = 0; i <= str1.length; i++) track[0][i] = i;
        for (let j = 0; j <= str2.length; j++) track[j][0] = j;

        for (let j = 1; j <= str2.length; j++) {
            for (let i = 1; i <= str1.length; i++) {
                const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
                track[j][i] = Math.min(
                    track[j][i - 1] + 1,
                    track[j - 1][i] + 1,
                    track[j - 1][i - 1] + indicator
                );
            }
        }

        return track[str2.length][str1.length];
    };

    const getSearchScore = (transaction, searchTerms) => {
        const searchableFields = {
            sender: transaction.sender?.toLowerCase() || '',
            wasteType: transaction.wasteType?.toLowerCase() || '',
            itemType: transaction.itemType?.toLowerCase() || '',
            status: transaction.status?.toLowerCase() || '',
            quantity: transaction.quantity?.toString() || '',
            points: (transaction.quantity * 10)?.toString() || '',
            date: new Date(transaction.createdAt).toLocaleDateString(),
            time: new Date(transaction.createdAt).toLocaleTimeString()
        };

        let score = 0;
        for (const term of searchTerms) {
            if (Object.values(searchableFields).some(field => field === term)) score += 1;
            else if (Object.values(searchableFields).some(field => field.includes(term))) score += 0.5;
            else if (Object.values(searchableFields).some(field => levenshteinDistance(field, term) <= 2)) score += 0.2;
        }
        return score;
    };

    const getFilteredHistory = () => {
        const dataToFilter = searchQuery ? searchResults : history;
        return dataToFilter.filter(transaction => {
            // Status filter
            if (statusFilter !== 'all' && transaction.status !== statusFilter) return false;
            
            // Waste type filter
            if (wasteTypeFilter !== 'all' && transaction.wasteType !== wasteTypeFilter) return false;
            
            // Date range filter
            if (startDate) {
                const transactionDate = new Date(transaction.createdAt);
                if (transactionDate < startOfDay(startDate)) return false;
            }
            if (endDate) {
                const transactionDate = new Date(transaction.createdAt);
                if (transactionDate > endOfDay(endDate)) return false;
            }

            // Points range filter
            const points = transaction.quantity * 10;
            if (pointsRange.min && points < Number(pointsRange.min)) return false;
            if (pointsRange.max && points > Number(pointsRange.max)) return false;

            // Quantity range filter
            if (quantityRange.min && transaction.quantity < Number(quantityRange.min)) return false;
            if (quantityRange.max && transaction.quantity > Number(quantityRange.max)) return false;
            
            return true;
        });
    };

    const handleClearDates = () => {
        setStartDate(null);
        setEndDate(null);
    };

    if (loading) return <Typography>Loading...</Typography>;
    if (error) return <Typography color="error">Error: {error}</Typography>;

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
                Transaction History
            </Typography>

            {/* Summary Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={3}>
                    <Card sx={{ bgcolor: 'success.light' }}>
                        <CardContent>
                            <Typography color="white" gutterBottom>Total Waste Collected</Typography>
                            <Typography variant="h4" color="white">{summary.totalWasteCollected} kg</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Card sx={{ bgcolor: 'primary.light' }}>
                        <CardContent>
                            <Typography color="white" gutterBottom>Total Points Awarded</Typography>
                            <Typography variant="h4" color="white">{summary.totalPointsAwarded}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Card sx={{ bgcolor: 'warning.light' }}>
                        <CardContent>
                            <Typography color="white" gutterBottom>Food Waste Collected</Typography>
                            <Typography variant="h4" color="white">{summary.foodWasteTotal} kg</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Card sx={{ bgcolor: 'error.light' }}>
                        <CardContent>
                            <Typography color="white" gutterBottom>E-Waste Collected</Typography>
                            <Typography variant="h4" color="white">{summary.eWasteTotal} kg</Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Filters Section */}
            <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                <TextField
                    fullWidth
                    sx={{ maxWidth: 400 }}
                    placeholder="Search by donor, waste type, status, quantity..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }}
                />

                {/* Status Filter */}
                <FormControl sx={{ minWidth: 200 }}>
                    <InputLabel>Status</InputLabel>
                    <Select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        label="Status"
                    >
                        <MenuItem value="all">All Completed</MenuItem>
                        <MenuItem value="accepted">Accepted Only</MenuItem>
                        <MenuItem value="rejected">Rejected Only</MenuItem>
                    </Select>
                </FormControl>

                {/* Waste Type Filter */}
                <FormControl sx={{ minWidth: 200 }}>
                    <InputLabel>Waste Type</InputLabel>
                    <Select
                        value={wasteTypeFilter}
                        onChange={(e) => setWasteTypeFilter(e.target.value)}
                        label="Waste Type"
                    >
                        <MenuItem value="all">All Types</MenuItem>
                        <MenuItem value="food">Food Waste</MenuItem>
                        <MenuItem value="e-waste">E-Waste</MenuItem>
                    </Select>
                </FormControl>

                {/* Date Range Filters with Clear Button */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                            label="Start Date"
                            value={startDate}
                            onChange={setStartDate}
                            slotProps={{ textField: { sx: { width: 200 } } }}
                        />
                        <DatePicker
                            label="End Date"
                            value={endDate}
                            onChange={setEndDate}
                            slotProps={{ textField: { sx: { width: 200 } } }}
                        />
                    </LocalizationProvider>
                    {(startDate || endDate) && (
                        <IconButton 
                            onClick={handleClearDates}
                            size="small"
                            sx={{ 
                                bgcolor: 'grey.200',
                                '&:hover': { bgcolor: 'grey.300' }
                            }}
                        >
                            <ClearIcon />
                        </IconButton>
                    )}
                </Box>

                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <TextField
                        label="Min Points"
                        type="number"
                        value={pointsRange.min}
                        onChange={(e) => setPointsRange(prev => ({ ...prev, min: e.target.value }))}
                        sx={{ width: 120 }}
                    />
                    <TextField
                        label="Max Points"
                        type="number"
                        value={pointsRange.max}
                        onChange={(e) => setPointsRange(prev => ({ ...prev, max: e.target.value }))}
                        sx={{ width: 120 }}
                    />
                    <TextField
                        label="Min Quantity"
                        type="number"
                        value={quantityRange.min}
                        onChange={(e) => setQuantityRange(prev => ({ ...prev, min: e.target.value }))}
                        sx={{ width: 120 }}
                    />
                    <TextField
                        label="Max Quantity"
                        type="number"
                        value={quantityRange.max}
                        onChange={(e) => setQuantityRange(prev => ({ ...prev, max: e.target.value }))}
                        sx={{ width: 120 }}
                    />
                </Box>
            </Box>

            {/* Transaction Table */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Date & Time</TableCell>
                            <TableCell>Donor Name</TableCell>
                            <TableCell>Waste Type</TableCell>
                            <TableCell>Waste Collected (kg)</TableCell>
                            <TableCell>Points Awarded</TableCell>
                            <TableCell>Status</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {getFilteredHistory().length > 0 ? (
                            getFilteredHistory().map((transaction, index) => (
                                <TableRow key={index}>
                                    <TableCell>
                                        {new Date(transaction.createdAt).toLocaleString()}
                                    </TableCell>
                                    <TableCell>{transaction.sender}</TableCell>
                                    <TableCell>{transaction.wasteType}</TableCell>
                                    <TableCell>{transaction.quantity} kg</TableCell>
                                    <TableCell>
                                        {transaction.status === 'accepted' ? (
                                            <Typography color="success.main">
                                                +{transaction.quantity * 10}
                                            </Typography>
                                        ) : (
                                            <Typography color="text.secondary">
                                                N/A
                                            </Typography>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={transaction.status}
                                            color={transaction.status === 'accepted' ? 'success' : 'error'}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
                                    <Typography variant="body1">No transactions found</Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default AgencyHistory; 