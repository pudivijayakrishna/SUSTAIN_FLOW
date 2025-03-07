import React, { useState, useEffect } from 'react';
import { Box, Tab, Tabs, Typography } from '@mui/material';
import AgencyPickupList from '../components/AgencyPickupList';
import RewardList from '../components/RewardList';

function TabPanel(props) {
    const { children, value, index, ...other } = props;
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

function Agency_Rewards() {
    const [value, setValue] = useState(0);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    return (
        <Box sx={{ width: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={value} onChange={handleChange}>
                    {/* <Tab label="REWARDS" /> */}
                    <Tab label="PICKUPS" />
                </Tabs>
            </Box>
            {/* <TabPanel value={value} index={0}>
                <RewardList />
            </TabPanel> */}
            <TabPanel value={value} index={0}>
                <AgencyPickupList />
            </TabPanel>
        </Box>
    );
}

export default Agency_Rewards;
