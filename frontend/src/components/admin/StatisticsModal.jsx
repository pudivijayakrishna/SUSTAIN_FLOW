import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    Grid,
    Card,
    CardContent,
    Typography,
    Box,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const StatisticsModal = ({ 
    open, 
    onClose, 
    title, 
    data, 
    type,
    chartData 
}) => {
    const renderContent = () => {
        switch (type) {
            case 'waste':
                return (
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6">Food Waste</Typography>
                                    <Typography variant="h4">{data?.foodWaste || 0} kg</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6">E-Waste</Typography>
                                    <Typography variant="h4">{data?.eWaste || 0} kg</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        {chartData && (
                            <Grid item xs={12}>
                                <Line 
                                    data={chartData}
                                    options={{
                                        responsive: true,
                                        plugins: {
                                            legend: {
                                                position: 'top',
                                            },
                                            title: {
                                                display: true,
                                                text: 'Weekly Waste Collection'
                                            }
                                        }
                                    }}
                                />
                            </Grid>
                        )}
                    </Grid>
                );

            case 'donations':
                return (
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6} lg={3}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6">Food</Typography>
                                    <Typography variant="h4">{data?.food || 0}</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={6} lg={3}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6">Books</Typography>
                                    <Typography variant="h4">{data?.books || 0}</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={6} lg={3}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6">Clothes</Typography>
                                    <Typography variant="h4">{data?.clothes || 0}</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={6} lg={3}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6">Others</Typography>
                                    <Typography variant="h4">{data?.others || 0}</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        {chartData && (
                            <Grid item xs={12}>
                                <Line 
                                    data={chartData}
                                    options={{
                                        responsive: true,
                                        plugins: {
                                            legend: {
                                                position: 'top',
                                            },
                                            title: {
                                                display: true,
                                                text: 'Weekly Donation Statistics'
                                            }
                                        }
                                    }}
                                />
                            </Grid>
                        )}
                    </Grid>
                );

            case 'transactions':
                return (
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Username</TableCell>
                                    <TableCell>Role</TableCell>
                                    <TableCell>Points</TableCell>
                                    <TableCell>Type</TableCell>
                                    <TableCell>Date</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {data?.transactions?.map((transaction, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{transaction.username}</TableCell>
                                        <TableCell>{transaction.role}</TableCell>
                                        <TableCell>{transaction.points}</TableCell>
                                        <TableCell>{transaction.type}</TableCell>
                                        <TableCell>
                                            {new Date(transaction.date).toLocaleDateString()}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                );

            default:
                return null;
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
        >
            <DialogTitle>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    {title}
                    <IconButton onClick={onClose}>
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>
            <DialogContent>
                {renderContent()}
            </DialogContent>
        </Dialog>
    );
};

export default StatisticsModal; 