import React from 'react';
import {
    Card,
    CardContent,
    Typography,
    Grid,
    CircularProgress,
    Box
} from '@mui/material';

const EngagementCard = ({ role, data }) => (
    <Card>
        <CardContent>
            <Typography variant="h6" gutterBottom>
                {role.charAt(0).toUpperCase() + role.slice(1)} Engagement
            </Typography>
            <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                    <Typography variant="h4" color="primary">
                        {data.engagementRate}%
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                        Active Users: {data.activeUsers}/{data.totalUsers}
                    </Typography>
                </Box>
                <Box position="relative" display="inline-flex">
                    <CircularProgress
                        variant="determinate"
                        value={data.engagementRate}
                        size={60}
                    />
                    <Box
                        position="absolute"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        top={0}
                        left={0}
                        bottom={0}
                        right={0}
                    >
                        <Typography variant="caption" color="textSecondary">
                            {data.engagementRate}%
                        </Typography>
                    </Box>
                </Box>
            </Box>
        </CardContent>
    </Card>
);

const UserEngagement = ({ engagement }) => {
    return (
        <Grid container spacing={3}>
            {engagement.map((data) => (
                <Grid item xs={12} md={4} key={data.role}>
                    <EngagementCard role={data.role} data={data} />
                </Grid>
            ))}
        </Grid>
    );
};

export default UserEngagement; 