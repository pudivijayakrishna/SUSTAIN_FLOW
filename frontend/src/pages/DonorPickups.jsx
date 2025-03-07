import React from 'react';
import { Container, Typography, Box, Tabs, Tab } from '@mui/material';
import DonorPickupList from '../components/DonorPickupList';

const DonorPickups = () => {
    const [tabValue, setTabValue] = React.useState(0);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom>
                My Pickups
            </Typography>

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs 
                    value={tabValue} 
                    onChange={handleTabChange}
                    aria-label="pickup tabs"
                >
                    <Tab label="Active Pickups" />
                    <Tab label="Completed Pickups" />
                </Tabs>
            </Box>

            <DonorPickupList 
                status={tabValue === 0 ? ['pending', 'dates_proposed', 'scheduled'] : ['completed']}
            />
        </Container>
    );
};

export default DonorPickups; 