import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    Tooltip
} from '@mui/material';
import {
    Close as CloseIcon,
    Person as DonorIcon,
    Apartment as NGOIcon,
    RecyclingRounded as CompostIcon
} from '@mui/icons-material';

const UserModal = ({ open, onClose, userStats }) => {
    const UserCard = ({ title, count, icon: Icon, color }) => (
        <Card sx={{ height: '100%' }}>
            <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                        <Typography color="textSecondary" gutterBottom>
                            {title}
                        </Typography>
                        <Typography variant="h4">
                            {count}
                        </Typography>
                    </Box>
                    <Icon sx={{ fontSize: 40, color }} />
                </Box>
            </CardContent>
        </Card>
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
                    User Breakdown
                    <IconButton onClick={onClose}>
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>
            <DialogContent>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                        <Tooltip title="Total number of donors">
                            <div>
                                <UserCard
                                    title="Donors"
                                    count={userStats?.donors || 0}
                                    icon={DonorIcon}
                                    color="#1976d2"
                                />
                            </div>
                        </Tooltip>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Tooltip title="Total number of NGOs">
                            <div>
                                <UserCard
                                    title="NGOs"
                                    count={userStats?.ngos || 0}
                                    icon={NGOIcon}
                                    color="#2e7d32"
                                />
                            </div>
                        </Tooltip>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Tooltip title="Total number of Compost Agencies">
                            <div>
                                <UserCard
                                    title="Compost Agencies"
                                    count={userStats?.compostAgencies || 0}
                                    icon={CompostIcon}
                                    color="#ed6c02"
                                />
                            </div>
                        </Tooltip>
                    </Grid>
                </Grid>
            </DialogContent>
        </Dialog>
    );
};

export default UserModal; 