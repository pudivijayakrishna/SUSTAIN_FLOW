import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    Box,
    Grid,
    Typography,
    Tabs,
    Tab,
    Paper,
    Chip
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

const UserDetailsDialog = ({ 
    open, 
    onClose, 
    userDetails,
    tabValue,
    onTabChange
}) => {
    if (!userDetails) return null;

    const BasicInformationTab = () => (
        <Box sx={{ mt: 3 }}>
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                        Full Name
                    </Typography>
                    <Typography variant="body1">
                        {userDetails.name}
                    </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                        Username
                    </Typography>
                    <Typography variant="body1">
                        {userDetails.username}
                    </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                        Email
                    </Typography>
                    <Typography variant="body1">
                        {userDetails.email}
                    </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                        Role
                    </Typography>
                    <Chip
                        label={userDetails.role}
                        color={
                            userDetails.role === 'donor' ? 'info' :
                            userDetails.role === 'ngo' ? 'success' :
                            'warning'
                        }
                        size="small"
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                        Member Since
                    </Typography>
                    <Typography variant="body1">
                        {new Date(userDetails.createdAt).toLocaleDateString()}
                    </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                        Verification Status
                    </Typography>
                    <Chip
                        label={userDetails.verificationStatus}
                        color={
                            userDetails.verificationStatus === 'approved' ? 'success' :
                            userDetails.verificationStatus === 'rejected' ? 'error' :
                            'warning'
                        }
                        size="small"
                    />
                </Grid>
            </Grid>
        </Box>
    );

    const ContactDetailsTab = () => (
        <Box sx={{ mt: 3 }}>
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                        Contact Number
                    </Typography>
                    <Typography variant="body1">
                        {userDetails?.contact || 'Not provided'}
                    </Typography>
                </Grid>
                <Grid item xs={12}>
                    <Typography variant="subtitle2" color="textSecondary">
                        Address
                    </Typography>
                    <Typography variant="body1">
                        {userDetails?.address || 'Not provided'}
                    </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                        Location Coordinates
                    </Typography>
                    <Typography variant="body1">
                        {userDetails?.location?.address || 'Not provided'}
                    </Typography>
                </Grid>
            </Grid>
        </Box>
    );

    const AccountSettingsTab = () => (
        <Box sx={{ mt: 3 }}>
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                        Account Status
                    </Typography>
                    <Chip
                        label={userDetails.isBlocked ? 'Blocked' : 'Active'}
                        color={userDetails.isBlocked ? 'error' : 'success'}
                        size="small"
                    />
                </Grid>
                {userDetails.isBlocked && (
                    <>
                        <Grid item xs={12}>
                            <Typography variant="subtitle2" color="textSecondary">
                                Block Reason
                            </Typography>
                            <Typography variant="body1" color="error">
                                {userDetails.blockReason}
                            </Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="subtitle2" color="textSecondary">
                                Blocked At
                            </Typography>
                            <Typography variant="body1">
                                {userDetails.blockedAt ? new Date(userDetails.blockedAt).toLocaleString() : 'N/A'}
                            </Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="subtitle2" color="textSecondary">
                                Blocked By
                            </Typography>
                            <Typography variant="body1">
                                {userDetails.blockedBy || 'N/A'}
                            </Typography>
                        </Grid>
                    </>
                )}
                <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                        Last Updated
                    </Typography>
                    <Typography variant="body1">
                        {new Date(userDetails.updatedAt).toLocaleString()}
                    </Typography>
                </Grid>
                {userDetails.role !== 'donor' && (
                    <Grid item xs={12}>
                        <Typography variant="subtitle2" color="textSecondary">
                            Verification History
                        </Typography>
                        <Box sx={{ mt: 1 }}>
                            {userDetails.verificationComments?.map((comment, index) => (
                                <Paper key={index} sx={{ p: 2, mb: 1 }}>
                                    <Typography variant="body2" color="textSecondary">
                                        Status: <Chip 
                                            label={comment.status} 
                                            size="small"
                                            color={comment.status === 'approved' ? 'success' : 'error'}
                                        />
                                    </Typography>
                                    <Typography variant="body2">
                                        Comment: {comment.comment}
                                    </Typography>
                                    <Typography variant="caption" color="textSecondary">
                                        Date: {new Date(comment.date).toLocaleString()}
                                    </Typography>
                                </Paper>
                            ))}
                        </Box>
                    </Grid>
                )}
            </Grid>
        </Box>
    );

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
        >
            <DialogTitle>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    User Details
                    <IconButton onClick={onClose}>
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>
            <DialogContent>
                <Tabs
                    value={tabValue}
                    onChange={onTabChange}
                    sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
                >
                    <Tab label="BASIC INFORMATION" />
                    <Tab label="CONTACT DETAILS" />
                    <Tab label="ACCOUNT SETTINGS" />
                </Tabs>

                {tabValue === 0 && <BasicInformationTab />}
                {tabValue === 1 && <ContactDetailsTab />}
                {tabValue === 2 && <AccountSettingsTab />}
            </DialogContent>
        </Dialog>
    );
};

export default UserDetailsDialog;