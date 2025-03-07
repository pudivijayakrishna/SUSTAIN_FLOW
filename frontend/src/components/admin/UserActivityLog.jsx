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
    Chip,
    FormControl,
    Select,
    MenuItem,
    TextField,
    Grid,
    IconButton,
    Tooltip
} from '@mui/material';
import {
    FilterList as FilterIcon,
    Sort as SortIcon,
    Info as InfoIcon
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';

const UserActivityLog = ({ logs }) => {
    const [filters, setFilters] = useState({
        action: 'all',
        sortOrder: 'newest'
    });
    const [searchTerm, setSearchTerm] = useState('');

    const getFilteredLogs = () => {
        return logs
            .filter(log => {
                if (filters.action !== 'all' && log.action !== filters.action) return false;
                if (searchTerm) {
                    const searchLower = searchTerm.toLowerCase();
                    return (
                        log.details.toLowerCase().includes(searchLower) ||
                        log.adminUsername.toLowerCase().includes(searchLower) ||
                        log.action.toLowerCase().includes(searchLower)
                    );
                }
                return true;
            })
            .sort((a, b) => {
                const dateA = new Date(a.timestamp);
                const dateB = new Date(b.timestamp);
                return filters.sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
            });
    };

    const getActionColor = (action) => {
        switch(action) {
            case 'block':
                return 'error';
            case 'unblock':
                return 'success';
            case 'verify_document':
                return 'success';
            case 'reject_document':
                return 'error';
            default:
                return 'default';
        }
    };

    return (
        <Box>
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={4}>
                    <TextField
                        fullWidth
                        label="Search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        size="small"
                    />
                </Grid>
                <Grid item xs={12} md={4}>
                    <FormControl fullWidth size="small">
                        <Select
                            value={filters.action}
                            onChange={(e) => setFilters(prev => ({ ...prev, action: e.target.value }))}
                            displayEmpty
                        >
                            <MenuItem value="all">All Actions</MenuItem>
                            <MenuItem value="block">Block</MenuItem>
                            <MenuItem value="unblock">Unblock</MenuItem>
                            <MenuItem value="verify_document">Verify Document</MenuItem>
                            <MenuItem value="reject_document">Reject Document</MenuItem>
                            <MenuItem value="update">Update</MenuItem>
                            <MenuItem value="delete">Delete</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                    <FormControl fullWidth size="small">
                        <Select
                            value={filters.sortOrder}
                            onChange={(e) => setFilters(prev => ({ ...prev, sortOrder: e.target.value }))}
                        >
                            <MenuItem value="newest">Newest First</MenuItem>
                            <MenuItem value="oldest">Oldest First</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
            </Grid>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Time</TableCell>
                            <TableCell>Admin</TableCell>
                            <TableCell>Action</TableCell>
                            <TableCell>Details</TableCell>
                            <TableCell>Reason</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {getFilteredLogs().map((log, index) => (
                            <TableRow key={index}>
                                <TableCell>
                                    {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                                </TableCell>
                                <TableCell>{log.adminUsername}</TableCell>
                                <TableCell>
                                    <Chip 
                                        label={log.action.replace('_', ' ')}
                                        color={getActionColor(log.action)}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>{log.details}</TableCell>
                                <TableCell>
                                    {log.reason ? (
                                        <Tooltip title={log.reason}>
                                            <IconButton size="small">
                                                <InfoIcon />
                                            </IconButton>
                                        </Tooltip>
                                    ) : '-'}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default UserActivityLog; 