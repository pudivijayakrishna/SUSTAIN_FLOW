import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Grid,
    Typography,
    CircularProgress,
    Alert,
    Card,
    CardContent,
    Box
} from '@mui/material';
import {
    PeopleAlt as UsersIcon,
    Business as AgencyIcon,
    Volunteer as NGOIcon,
    Person as DonorIcon,
    Verified as VerifiedIcon,
    PendingActions as PendingIcon,
    Assessment as StatsIcon
} from '@mui/icons-material';
import { adminApi } from '../../services/adminApi';
import AdminLayout from './AdminLayout';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('adminToken');
                if (!token) {
                    navigate('/login');
                    return;
                }

                const response = await adminApi.getDashboardStats();
                console.log('Dashboard stats:', response);
                setStats(response);
            } catch (error) {
                console.error('Error fetching stats:', error);
                if (error.response?.status === 401) {
                    localStorage.removeItem('adminToken');
                    navigate('/login');
                } else {
                    setError('Failed to load dashboard data');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [navigate]);

    const StatCard = ({ title, value, icon: Icon, color }) => (
        <Card sx={{ height: '100%', boxShadow: 3 }}>
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
            <Box sx={{ p: 3 }}>
                <Typography variant="h4" gutterBottom>
                    Dashboard Overview
                </Typography>

                <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="Total Users"
                            value={stats?.totalUsers || 0}
                            icon={UsersIcon}
                            color="#1976d2"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="Total NGOs"
                            value={stats?.totalNGOs || 0}
                            icon={NGOIcon}
                            color="#2e7d32"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="Total Agencies"
                            value={stats?.totalAgencies || 0}
                            icon={AgencyIcon}
                            color="#ed6c02"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="Total Donors"
                            value={stats?.totalDonors || 0}
                            icon={DonorIcon}
                            color="#9c27b0"
                        />
                    </Grid>
                </Grid>

                <Box mt={4}>
                    <Typography variant="h5" gutterBottom>
                        Verification Status
                    </Typography>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={4}>
                            <Card sx={{ height: '100%', boxShadow: 3 }}>
                                <CardContent>
                                    <Box textAlign="center">
                                        <VerifiedIcon color="success" sx={{ fontSize: 40 }} />
                                        <Typography variant="h5">
                                            {stats?.users?.verified || 0}
                                        </Typography>
                                        <Typography color="textSecondary">
                                            Verified Users
                                        </Typography>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Card sx={{ height: '100%', boxShadow: 3 }}>
                                <CardContent>
                                    <Box textAlign="center">
                                        <PendingIcon color="warning" sx={{ fontSize: 40 }} />
                                        <Typography variant="h5">
                                            {stats?.users?.pending || 0}
                                        </Typography>
                                        <Typography color="textSecondary">
                                            Pending Verifications
                                        </Typography>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Card sx={{ height: '100%', boxShadow: 3 }}>
                                <CardContent>
                                    <Box textAlign="center">
                                        <StatsIcon color="info" sx={{ fontSize: 40 }} />
                                        <Typography variant="h5">
                                            {stats?.transactions?.total || 0}
                                        </Typography>
                                        <Typography color="textSecondary">
                                            Total Transactions
                                        </Typography>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </Box>
            </Box>
        </AdminLayout>
    );
};

export default AdminDashboard; 