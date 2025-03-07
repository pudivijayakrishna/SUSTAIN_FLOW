import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Box,
    Chip,
    Typography
} from '@mui/material';
import { format } from 'date-fns';

const PointsHistoryTable = ({ history }) => {
    if (!history || Object.keys(history).length === 0) {
        return (
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Date & Time</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell>Base Points</TableCell>
                            <TableCell>Additional Points</TableCell>
                            <TableCell>Total Points</TableCell>
                            <TableCell>Agency/NGO</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow>
                            <TableCell colSpan={6} align="center">
                                No history available
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
        );
    }

    return (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Date & Time</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Base Points</TableCell>
                        <TableCell>Additional Points</TableCell>
                        <TableCell>Total Points</TableCell>
                        <TableCell>Agency/NGO</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {Object.entries(history).map(([date, transactions]) => (
                        <React.Fragment key={date}>
                            <TableRow>
                                <TableCell colSpan={6} sx={{ bgcolor: 'grey.100' }}>
                                    <Typography variant="subtitle2">
                                        {format(new Date(date), 'PPP')}
                                    </Typography>
                                </TableCell>
                            </TableRow>
                            {transactions.map((transaction, index) => (
                                <TableRow key={`${date}-${index}`}>
                                    <TableCell>
                                        {format(new Date(transaction.createdAt), 'pp')}
                                    </TableCell>
                                    <TableCell>
                                        <Box
                                            sx={{
                                                display: 'inline-block',
                                                px: 2,
                                                py: 0.5,
                                                borderRadius: 1,
                                                backgroundColor: transaction.type === 'earn' 
                                                    ? 'rgba(46, 204, 113, 0.1)' 
                                                    : 'rgba(231, 76, 60, 0.1)',
                                                color: transaction.type === 'earn' 
                                                    ? '#27ae60' 
                                                    : '#c0392b'
                                            }}
                                        >
                                            {transaction.type === 'earn' ? 'Earned' : 'Redeemed'}
                                        </Box>
                                    </TableCell>
                                    <TableCell 
                                        sx={{
                                            fontWeight: 'bold',
                                            color: transaction.type === 'earn' 
                                                ? '#27ae60' 
                                                : '#c0392b'
                                        }}
                                    >
                                        {transaction.type === 'earn' ? '+' : '-'}
                                        {transaction.basePoints || transaction.reward?.point || 0}
                                    </TableCell>
                                    <TableCell 
                                        sx={{
                                            fontWeight: 'bold',
                                            color: '#27ae60'
                                        }}
                                    >
                                        {transaction.additionalPoints > 0 ? 
                                            `+${transaction.additionalPoints}` : 
                                            '-'}
                                    </TableCell>
                                    <TableCell 
                                        sx={{
                                            fontWeight: 'bold',
                                            color: transaction.type === 'earn' 
                                                ? '#27ae60' 
                                                : '#c0392b'
                                        }}
                                    >
                                        {transaction.type === 'earn' ? '+' : '-'}
                                        {transaction.totalPoints}
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={transaction.agencyName}
                                            size="small"
                                            variant="outlined"
                                            color={transaction.agencyRole === 'ngo' ? 'secondary' : 'primary'}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </React.Fragment>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default PointsHistoryTable;