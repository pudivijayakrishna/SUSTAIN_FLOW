import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Tab,
    Tabs,
    Card,
    CardContent,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    CircularProgress,
    Alert,
    Grid
} from '@mui/material';
import { adminApi } from '../services/adminApi';

const Verifications = () => {
    const [activeTab, setActiveTab] = useState(0);
    const [pendingVerifications, setPendingVerifications] = useState([]);
    const [rejectedVerifications, setRejectedVerifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [comments, setComments] = useState('');
    const [verificationStatus, setVerificationStatus] = useState('');

    useEffect(() => {
        fetchVerifications();
    }, []);

    const fetchVerifications = async () => {
        setLoading(true);
        setError(null);
        try {
            const [pendingRes, rejectedRes] = await Promise.all([
                adminApi.getPendingVerifications(),
                adminApi.getRejectedVerifications()
            ]);
            
            if (pendingRes.success) {
                setPendingVerifications(pendingRes.verifications);
            }
            if (rejectedRes.success) {
                setRejectedVerifications(rejectedRes.verifications);
            }
        } catch (err) {
            console.error('Error fetching verifications:', err);
            setError('Failed to fetch verification requests');
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const handleVerificationAction = async (user, status) => {
        setSelectedUser(user);
        setVerificationStatus(status);
        setDialogOpen(true);
    };

    const handleSubmitVerification = async () => {
        try {
            await adminApi.verifyDocument(selectedUser._id, {
                status: verificationStatus,
                comments: comments
            });
            setDialogOpen(false);
            setComments('');
            setSelectedUser(null);
            fetchVerifications();
        } catch (err) {
            console.error('Error submitting verification:', err);
            setError('Failed to submit verification decision');
        }
    };

    const renderVerificationCard = (user) => (
        <Card key={user._id} sx={{ mb: 2 }}>
            <CardContent>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                        <Typography variant="h6">{user.name}</Typography>
                        <Typography color="textSecondary">Username: {user.username}</Typography>
                        <Typography color="textSecondary">Email: {user.email}</Typography>
                        <Typography color="textSecondary">Role: {user.role}</Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Box sx={{ mt: 2 }}>
                            {user.verificationDocument && (
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    onClick={() => window.open(user.verificationDocument.decryptedData)}
                                    sx={{ mr: 1 }}
                                >
                                    View Document
                                </Button>
                            )}
                            {activeTab === 0 && (
                                <>
                                    <Button
                                        variant="contained"
                                        color="success"
                                        onClick={() => handleVerificationAction(user, 'approved')}
                                        sx={{ mr: 1 }}
                                    >
                                        Approve
                                    </Button>
                                    <Button
                                        variant="contained"
                                        color="error"
                                        onClick={() => handleVerificationAction(user, 'rejected')}
                                    >
                                        Reject
                                    </Button>
                                </>
                            )}
                        </Box>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Document Verifications
            </Typography>

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={activeTab} onChange={handleTabChange}>
                    <Tab 
                        label={
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <span style={{ marginRight: '8px' }}>NEW REQUESTS</span>
                                {pendingVerifications.length > 0 && (
                                    <Box
                                        sx={{
                                            bgcolor: 'primary.main',
                                            color: 'white',
                                            borderRadius: '50%',
                                            width: 20,
                                            height: 20,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '0.75rem'
                                        }}
                                    >
                                        {pendingVerifications.length}
                                    </Box>
                                )}
                            </Box>
                        }
                    />
                    <Tab 
                        label={`REJECTED REQUESTS (${rejectedVerifications.length})`}
                    />
                </Tabs>
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
            ) : (
                <Box>
                    {activeTab === 0 ? (
                        pendingVerifications.length > 0 ? (
                            pendingVerifications.map(user => renderVerificationCard(user))
                        ) : (
                            <Alert severity="info">No pending verifications</Alert>
                        )
                    ) : (
                        rejectedVerifications.length > 0 ? (
                            rejectedVerifications.map(user => renderVerificationCard(user))
                        ) : (
                            <Alert severity="info">No rejected verifications</Alert>
                        )
                    )}
                </Box>
            )}

            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
                <DialogTitle>
                    {verificationStatus === 'approved' ? 'Approve' : 'Reject'} Verification
                </DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Comments"
                        fullWidth
                        multiline
                        rows={4}
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button 
                        onClick={handleSubmitVerification}
                        color={verificationStatus === 'approved' ? 'success' : 'error'}
                        variant="contained"
                    >
                        Submit
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Verifications; 