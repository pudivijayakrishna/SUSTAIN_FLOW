import React, { useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    Box,
    Tooltip,
    IconButton,
    Chip,
    ToggleButtonGroup,
    ToggleButton,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    Stack
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import InfoIcon from '@mui/icons-material/Info';
import SortIcon from '@mui/icons-material/Sort';
import { format } from 'date-fns';

const DonationRequestsTable = ({ donations }) => {
    const [agencyType, setAgencyType] = useState('all');
    const [status, setStatus] = useState('all');
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [sortField, setSortField] = useState('date');
    const [sortOrder, setSortOrder] = useState('desc');
    const [wasteType, setWasteType] = useState('all');
    const [itemCategory, setItemCategory] = useState('all');

    // Convert grouped donations to flat array
    const flattenedDonations = React.useMemo(() => {
        if (!donations) return [];
        return Object.values(donations).flat();
    }, [donations]);

    // Filter functions
    const filterDonations = (donations) => {
        return donations.filter(donation => {
            // Agency type filter
            if (agencyType !== 'all' && donation.receiverRole !== agencyType) return false;

            // Status filter
            if (status !== 'all' && donation.status !== status) return false;

            // Date range filter
            if (startDate && new Date(donation.createdAt) < startDate) return false;
            if (endDate && new Date(donation.createdAt) > endDate) return false;

            // Waste type filter (for compostAgency)
            if (donation.receiverRole === 'compostAgency' && 
                wasteType !== 'all' && 
                donation.wasteType !== wasteType) return false;

            // Item category filter (for NGO)
            if (donation.receiverRole === 'ngo' && 
                itemCategory !== 'all' && 
                donation.itemCategory !== itemCategory) return false;

            return true;
        });
    };

    // Sort function
    const sortDonations = (donations) => {
        return [...donations].sort((a, b) => {
            switch (sortField) {
                case 'date':
                    return sortOrder === 'desc' 
                        ? new Date(b.createdAt) - new Date(a.createdAt)
                        : new Date(a.createdAt) - new Date(b.createdAt);
                case 'quantity':
                    return sortOrder === 'desc' 
                        ? b.quantity - a.quantity
                        : a.quantity - b.quantity;
                case 'name':
                    return sortOrder === 'desc'
                        ? b.receiverName.localeCompare(a.receiverName)
                        : a.receiverName.localeCompare(b.receiverName);
                default:
                    return 0;
            }
        });
    };

    const handleSort = (field) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('desc');
        }
    };

    const renderSortIcon = (field) => (
        <IconButton
            size="small"
            onClick={() => handleSort(field)}
            sx={{ ml: 1, opacity: sortField === field ? 1 : 0.5 }}
        >
            <SortIcon 
                sx={{ 
                    transform: sortField === field && sortOrder === 'asc' 
                        ? 'rotate(180deg)' 
                        : 'none'
                }}
            />
        </IconButton>
    );

    // Render table headers based on agency type
    const renderTableHeaders = () => {
        const commonHeaders = [
            { id: 'date', label: 'Date & Time' },
            { id: 'name', label: 'Name' },
            { id: 'quantity', label: 'Quantity (kg)' }
        ];

        const ngoHeaders = [
            ...commonHeaders,
            { id: 'itemCategory', label: 'Item Category' },
            { id: 'itemName', label: 'Item Name' },
            { id: 'description', label: 'Description' },
            { id: 'status', label: 'Status' }
        ];

        const compostHeaders = [
            ...commonHeaders,
            { id: 'wasteType', label: 'Waste Type' },
            { id: 'itemType', label: 'Item Type' },
            { id: 'description', label: 'Description' },
            { id: 'status', label: 'Status' }
        ];

        return agencyType === 'ngo' ? ngoHeaders : compostHeaders;
    };

    // Filter controls component
    const FilterControls = () => (
        <Stack spacing={2} direction="row" sx={{ mb: 3 }}>
            <ToggleButtonGroup
                value={agencyType}
                exclusive
                onChange={(e, value) => value && setAgencyType(value)}
                size="small"
            >
                <ToggleButton value="all">All</ToggleButton>
                <ToggleButton value="compostAgency">Compost Agency</ToggleButton>
                <ToggleButton value="ngo">NGO</ToggleButton>
            </ToggleButtonGroup>

            <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Status</InputLabel>
                <Select
                    value={status}
                    label="Status"
                    onChange={(e) => setStatus(e.target.value)}
                >
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="accepted">Accepted</MenuItem>
                    <MenuItem value="rejected">Rejected</MenuItem>
                </Select>
            </FormControl>

            {agencyType === 'compostAgency' && (
                <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Waste Type</InputLabel>
                    <Select
                        value={wasteType}
                        label="Waste Type"
                        onChange={(e) => setWasteType(e.target.value)}
                    >
                        <MenuItem value="all">All</MenuItem>
                        <MenuItem value="food">Food</MenuItem>
                        <MenuItem value="e-waste">E-Waste</MenuItem>
                    </Select>
                </FormControl>
            )}

            {agencyType === 'ngo' && (
                <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Item Category</InputLabel>
                    <Select
                        value={itemCategory}
                        label="Item Category"
                        onChange={(e) => setItemCategory(e.target.value)}
                    >
                        <MenuItem value="all">All</MenuItem>
                        <MenuItem value="books">Books</MenuItem>
                        <MenuItem value="clothes">Clothes</MenuItem>
                        <MenuItem value="surplus food">Surplus Food</MenuItem>
                        <MenuItem value="others">Others</MenuItem>
                    </Select>
                </FormControl>
            )}

            <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                    label="Start Date"
                    value={startDate}
                    onChange={setStartDate}
                    slotProps={{ textField: { size: 'small' } }}
                />
                <DatePicker
                    label="End Date"
                    value={endDate}
                    onChange={setEndDate}
                    slotProps={{ textField: { size: 'small' } }}
                />
            </LocalizationProvider>
        </Stack>
    );

    // Process and render the data
    const processedDonations = sortDonations(filterDonations(flattenedDonations));

    return (
        <Box>
            <FilterControls />
            
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            {renderTableHeaders().map(header => (
                                <TableCell key={header.id}>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        {header.label}
                                        {['date', 'name', 'quantity'].includes(header.id) && 
                                            renderSortIcon(header.id)}
                                    </Box>
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {processedDonations.map((donation, index) => (
                            <TableRow key={index}>
                                <TableCell>
                                    {format(new Date(donation.createdAt), 'PPp')}
                                </TableCell>
                                <TableCell>{donation.receiverName}</TableCell>
                                <TableCell>{donation.quantity}</TableCell>
                                {donation.receiverRole === 'ngo' ? (
                                    <>
                                        <TableCell>{donation.itemCategory}</TableCell>
                                        <TableCell>
                                            {donation.itemCategory === 'others' ? 
                                                donation.itemName : '-'}
                                        </TableCell>
                                    </>
                                ) : (
                                    <>
                                        <TableCell>{donation.wasteType}</TableCell>
                                        <TableCell>{donation.itemType}</TableCell>
                                    </>
                                )}
                                <TableCell>
                                    <Tooltip title={donation.description}>
                                        <IconButton size="small">
                                            <InfoIcon />
                                        </IconButton>
                                    </Tooltip>
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={donation.status}
                                        color={
                                            donation.status === 'accepted' ? 'success' :
                                            donation.status === 'rejected' ? 'error' :
                                            'warning'
                                        }
                                        size="small"
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default DonationRequestsTable; 