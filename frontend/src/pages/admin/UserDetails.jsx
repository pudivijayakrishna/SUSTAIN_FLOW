import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Grid,
    Typography,
    Chip,
    Button,
    Divider,
    Card,
    CardContent,
    Avatar,
    List,
    ListItem,
    ListItemText,
    Tab,
    Tabs
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { adminApi } from '../../services/adminApi';
import UserActivityLog from '../../components/admin/UserActivityLog';
import AdminLayout from '../../components/admin/AdminLayout';
import { format } from 'date-fns';

const UserDetails = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [userDetails, setUserDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(0);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchUserDetails();
    }, [userId]);

    const fetchUserDetails = async () => {
        try {
            setLoading(true);
            const response = await adminApi.getUserDetails(userId);
            if (response.success) {
                setUserDetails(response.user);
            } else {
                throw new Error(response.error || 'Failed to fetch user details');
            }
        } catch (error) {
            console.error('Error fetching user details:', error);
            setError(error.message || 'Failed to fetch user details');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!userDetails) {
        return <div>User not found</div>;
    }

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    return (
        <AdminLayout>
            <Box sx={{ p: 3 }}>
                {/* Header */}
                <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h4">User Details</Typography>
                    <Button variant="outlined" onClick={() => navigate('/admin/users')}>
                        Back to Users
                    </Button>
                </Box>

                {/* User Profile Card */}
                <Card sx={{ mb: 3 }}>
                    <CardContent>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={2}>
                                <Avatar
                                    src={userDetails.user.profileImage}
                                    sx={{ width: 100, height: 100 }}
                                />
                            </Grid>
                            <Grid item xs={12} md={10}>
                                <Typography variant="h5">{userDetails.user.username}</Typography>
                                <Typography color="textSecondary">{userDetails.user.email}</Typography>
                                <Box sx={{ mt: 1 }}>
                                    <Chip 
                                        label={userDetails.user.role} 
                                        color="primary" 
                                        sx={{ mr: 1 }} 
                                    />
                                    <Chip 
                                        label={userDetails.user.isActive ? 'Active' : 'Inactive'} 
                                        color={userDetails.user.isActive ? 'success' : 'error'} 
                                    />
                                </Box>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>

                {/* Tabs */}
                <Box sx={{ width: '100%' }}>
                    <Tabs value={activeTab} onChange={handleTabChange}>
                        <Tab label="Overview" />
                        <Tab label="Transactions" />
                        <Tab label="Activity Logs" />
                        <Tab label="Statistics" />
                    </Tabs>

                    {/* Overview Tab */}
                    {activeTab === 0 && (
                        <Box sx={{ mt: 2 }}>
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                    <Paper sx={{ p: 2 }}>
                                        <Typography variant="h6" gutterBottom>Basic Information</Typography>
                                        <List>
                                            <ListItem>
                                                <ListItemText 
                                                    primary="Member Since" 
                                                    secondary={format(new Date(userDetails.user.createdAt), 'PPP')} 
                                                />
                                            </ListItem>
                                            <ListItem>
                                                <ListItemText 
                                                    primary="Location" 
                                                    secondary={userDetails.user.location || 'Not specified'} 
                                                />
                                            </ListItem>
                                            <ListItem>
                                                <ListItemText 
                                                    primary="Phone" 
                                                    secondary={userDetails.user.phoneNumber || 'Not provided'} 
                                                />
                                            </ListItem>
                                        </List>
                                    </Paper>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Paper sx={{ p: 2 }}>
                                        <Typography variant="h6" gutterBottom>Account Statistics</Typography>
                                        <List>
                                            <ListItem>
                                                <ListItemText 
                                                    primary="Total Points" 
                                                    secondary={userDetails.stats.totalPoints} 
                                                />
                                            </ListItem>
                                            <ListItem>
                                                <ListItemText 
                                                    primary="Completion Rate" 
                                                    secondary={`${Math.round(userDetails.stats.completionRate)}%`} 
                                                />
                                            </ListItem>
                                            <ListItem>
                                                <ListItemText 
                                                    primary="Account Age" 
                                                    secondary={`${userDetails.stats.accountAge.months} months`} 
                                                />
                                            </ListItem>
                                        </List>
                                    </Paper>
                                </Grid>
                            </Grid>
                        </Box>
                    )}

                    {/* Transactions Tab */}
                    {activeTab === 1 && (
                        <Box sx={{ mt: 2 }}>
                            <Paper>
                                {/* Add TransactionHistory component here */}
                            </Paper>
                        </Box>
                    )}

                    {/* Activity Logs Tab */}
                    {activeTab === 2 && (
                        <Box sx={{ mt: 2 }}>
                            <UserActivityLog logs={userDetails.activityLogs} />
                        </Box>
                    )}

                    {/* Statistics Tab */}
                    {activeTab === 3 && (
                        <Box sx={{ mt: 2 }}>
                            {/* Add Statistics component here */}
                        </Box>
                    )}
                </Box>
            </Box>
        </AdminLayout>
    );
};

export default UserDetails; 