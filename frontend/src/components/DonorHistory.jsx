import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Grid,
    Typography,
    useTheme,
    Tabs,
    Tab,
    CircularProgress
} from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import axios from 'axios';
import config from '../config';
import PointsHistoryTable from './PointsHistoryTable';
import DonationRequestsTable from './DonationRequestsTable';

const DonorHistory = () => {
    const [activeTab, setActiveTab] = useState(0);
    const [loading, setLoading] = useState(true);
    const [pointsHistory, setPointsHistory] = useState({});
    const [donationRequests, setDonationRequests] = useState([]);
    const [summary, setSummary] = useState({
        totalEarned: 0,
        totalRedeemed: 0,
        currentBalance: 0
    });
    const theme = useTheme();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const headers = {
                "Content-Type": "application/json",
                Authorization: `Bearer ${window.localStorage.getItem("token")}`
            };

            // Fetch both points history and donation requests in parallel
            const [historyResponse, donationsResponse] = await Promise.all([
                axios.get(`${config.BACKEND_API}/donor/history`, { headers }),
                axios.get(`${config.BACKEND_API}/donor/donation-requests`, { headers })
            ]);

            console.log('History Response:', historyResponse.data);
            console.log('Donations Response:', donationsResponse.data);

            if (historyResponse.data?.history) {
                setPointsHistory(historyResponse.data.history);
                setSummary(historyResponse.data.summary);
            }

            if (donationsResponse.data?.donations) {
                setDonationRequests(donationsResponse.data.donations || {});
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const SummaryCards = () => (
        <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={4}>
                <Card sx={{ bgcolor: 'success.light' }}>
                    <CardContent>
                        <Typography color="white" gutterBottom>Total Earned</Typography>
                        <Typography variant="h4" color="white">+{summary.totalEarned}</Typography>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={12} md={4}>
                <Card sx={{ bgcolor: 'error.light' }}>
                    <CardContent>
                        <Typography color="white" gutterBottom>Total Redeemed</Typography>
                        <Typography variant="h4" color="white">-{summary.totalRedeemed}</Typography>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={12} md={4}>
                <Card sx={{ bgcolor: 'primary.light' }}>
                    <CardContent>
                        <Typography color="white" gutterBottom>Current Balance</Typography>
                        <Typography variant="h4" color="white">{summary.currentBalance}</Typography>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3, maxWidth: '1200px', margin: '0 auto' }}>
            <Typography 
                variant="h4" 
                gutterBottom 
                sx={{ 
                    mb: 4,
                    color: theme.palette.primary.main,
                    fontWeight: 'bold',
                    textAlign: 'center'
                }}
            >
                Transaction History
            </Typography>

            <SummaryCards />

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs 
                    value={activeTab} 
                    onChange={handleTabChange}
                    variant="fullWidth"
                >
                    <Tab 
                        icon={<HistoryIcon />} 
                        label="Points History" 
                        iconPosition="start"
                    />
                    <Tab 
                        icon={<ReceiptLongIcon />} 
                        label="Donation Requests" 
                        iconPosition="start"
                    />
                </Tabs>
            </Box>

            {activeTab === 0 ? (
                <PointsHistoryTable history={pointsHistory} />
            ) : (
                <DonationRequestsTable donations={donationRequests} />
            )}
        </Box>
    );
};

export default DonorHistory;