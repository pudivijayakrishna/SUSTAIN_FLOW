import React, { useState } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import NgoPickupList from '../components/NgoPickupList';

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

function NgoRewards() {
    const [tabValue, setTabValue] = useState(0);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const theme = createTheme({
        typography: {
            fontFamily: "Quicksand",
            body1: {
                fontWeight: "600",
                fontSize: "medium",
            },
        },
    });

    return (
        <div data-aos="fade-up">
            <ThemeProvider theme={theme}>
                <Box sx={{ width: '100%' }}>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <Tabs value={tabValue} onChange={handleTabChange}>
                            <Tab label="PICKUPS" />
                        </Tabs>
                    </Box>
                    <TabPanel value={tabValue} index={0}>
                        <NgoPickupList />
                    </TabPanel>
                </Box>
            </ThemeProvider>
        </div>
    );
}

export default NgoRewards;
