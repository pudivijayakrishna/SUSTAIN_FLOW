import React from 'react';
import {
    Card,
    CardContent,
    Typography,
    Grid,
    LinearProgress,
    Box
} from '@mui/material';

const MetricCard = ({ title, value, subtitle, progress }) => (
    <Card>
        <CardContent>
            <Typography variant="h6" gutterBottom>
                {title}
            </Typography>
            <Typography variant="h4" color="primary">
                {value}
            </Typography>
            {subtitle && (
                <Typography variant="body2" color="textSecondary">
                    {subtitle}
                </Typography>
            )}
            {progress && (
                <Box sx={{ mt: 2 }}>
                    <LinearProgress variant="determinate" value={progress} />
                </Box>
            )}
        </CardContent>
    </Card>
);

const PerformanceMetrics = ({ metrics }) => {
    return (
        <Grid container spacing={3}>
            <Grid item xs={12} md={6} lg={3}>
                <MetricCard
                    title="Total Donations"
                    value={`${metrics.totalQuantity}kg`}
                    subtitle="Total waste collected"
                />
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
                <MetricCard
                    title="Average Donation"
                    value={`${metrics.averageQuantity}kg`}
                    subtitle="Per transaction"
                />
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
                <MetricCard
                    title="Total Points"
                    value={metrics.totalPoints}
                    subtitle="Points awarded"
                />
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
                <MetricCard
                    title="Transactions"
                    value={metrics.transactionCount}
                    subtitle="Total transactions"
                />
            </Grid>
        </Grid>
    );
};

export default PerformanceMetrics; 