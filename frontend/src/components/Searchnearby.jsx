import React, { useState, useEffect } from "react";
import {
    InputLabel,
    MenuItem,
    FormControl,
    Select,
    Box,
    Card,
    CardContent,
    Typography,
    CardActionArea,
    Dialog,
    Button
} from "@mui/material";
import axios from "axios";
import config from "../config.js";
import Notification from './Notification';
import DonationForm from './DonationForm';

function Searchnearby() {
    const [type, setType] = useState("");
    const [dataList, setDataList] = useState(null);
    const [notification, setNotification] = useState({
        open: false,
        message: '',
        severity: 'success'
    });
    const [selectedAgency, setSelectedAgency] = useState(null);
    const [showDonationForm, setShowDonationForm] = useState(false);
    const [loading, setLoading] = useState(false);

    // Check user location on component mount
    useEffect(() => {
        checkUserLocation();
    }, []);

    const checkUserLocation = async () => {
        try {
            const headers = {
                "Content-Type": "application/json",
                Authorization: `Bearer ${window.localStorage.getItem("token")}`,
            };

            const response = await axios.get(
                `${config.BACKEND_API}/auth/profile`,
                { headers }
            );

            const userLocation = response.data?.user?.location;
            if (!userLocation || !userLocation.position || !userLocation.position.lat || !userLocation.position.lon) {
                setNotification({
                    open: true,
                    message: 'Please update your location in profile to search nearby agencies/NGOs',
                    severity: 'warning'
                });
                return false;
            }
            return true;
        } catch (error) {
            console.error('Error checking user location:', error);
            setNotification({
                open: true,
                message: 'Error checking location. Please try again.',
                severity: 'error'
            });
            return false;
        }
    };

    const handleTypeChange = async (event) => {
        const selectedType = event.target.value;
        setType(selectedType);
        
        const hasLocation = await checkUserLocation();
        if (!hasLocation) {
            return;
        }

        try {
            setLoading(true);
            const headers = {
                "Content-Type": "application/json",
                Authorization: `Bearer ${window.localStorage.getItem("token")}`,
            };

            const typeMap = {
                'NGO': 'ngo',
                'Composting Agency': 'compostAgency'
            };
            const mappedType = typeMap[selectedType];
            
            if (!mappedType) {
                setNotification({
                    open: true,
                    message: 'Please select a valid type',
                    severity: 'warning'
                });
                return;
            }

            const response = await axios.get(
                `${config.BACKEND_API}/donor/nearby-agency/${mappedType}`,
                { headers }
            );

            const nearbyAgencies = response.data?.nearbyAgency || [];
            setDataList(nearbyAgencies);
            
            if (nearbyAgencies.length === 0) {
                setNotification({
                    open: true,
                    message: 'No nearby agencies/NGOs found',
                    severity: 'info'
                });
            }
        } catch (error) {
            console.error('Error fetching nearby locations:', error);
            setNotification({
                open: true,
                message: error.response?.data?.error || 'Error fetching nearby locations',
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (agency) => {
        setSelectedAgency(agency);
        setShowDonationForm(true);
    };

    const handleCloseDonationForm = () => {
        setShowDonationForm(false);
        setSelectedAgency(null);
    };

    const handleDonationSubmit = async (formData) => {
        try {
            const data = {
                username: selectedAgency.username,
                type: selectedAgency.role,
                recipientEmail: selectedAgency.email,
                ...formData
            };

            const headers = {
                "Content-Type": "application/json",
                Authorization: `Bearer ${window.localStorage.getItem("token")}`
            };

            const response = await axios.post(
                `${config.BACKEND_API}/donor/donate-supplies/`,
                data,
                { headers }
            );

            if (response.data.success) {
                setNotification({
                    open: true,
                    message: 'Donation request sent successfully!',
                    severity: 'success'
                });
                handleCloseDonationForm();
            } else {
                throw new Error(response.data.error || 'Failed to send donation request');
            }
        } catch (error) {
            console.error('Donation error:', error);
            setNotification({
                open: true,
                message: error.response?.data?.error || 'Failed to send donation request',
                severity: 'error'
            });
        }
    };

    return (
        <div style={{ margin: "2rem" }}>
            {showDonationForm && selectedAgency && (
                <Dialog
                    open={showDonationForm}
                    onClose={handleCloseDonationForm}
                    maxWidth="md"
                    fullWidth
                >
                    <DonationForm
                        type={selectedAgency.role}
                        onSubmit={handleDonationSubmit}
                        onClose={handleCloseDonationForm}
                    />
                </Dialog>
            )}

            <Typography gutterBottom variant="h6" component="div">
                Search Nearby Agencies/NGOs
            </Typography>

            <Box sx={{ minWidth: 120, mb: 3 }}>
                <FormControl fullWidth>
                    <InputLabel>Select Type</InputLabel>
                    <Select
                        value={type}
                        label="Select Type"
                        onChange={handleTypeChange}
                        disabled={loading}
                    >
                        <MenuItem value="">Choose One Type</MenuItem>
                        <MenuItem value="NGO">NGO</MenuItem>
                        <MenuItem value="Composting Agency">Composting Agency</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            <div>
                {loading && (
                    <Typography color="textSecondary">Loading nearby locations...</Typography>
                )}

                {!loading && dataList && dataList.length === 0 && (
                    <Typography>No nearby agencies or NGOs found within 10km.</Typography>
                )}

                {!loading && dataList && dataList.map((card) => (
                    <Card
                        sx={{ mb: 2 }}
                        key={card._id}
                        onClick={() => handleOpenModal(card)}
                    >
                        <CardActionArea>
                            <CardContent sx={{ position: 'relative' }}>
                                <Typography gutterBottom variant="h6" component="div">
                                    {card.username}
                                </Typography>
                                <Box sx={{ position: 'absolute', right: 16, top: 16, textAlign: 'right' }}>
                                    <Typography variant="h6">{card.distance} km away</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        ~{card.travelTime} min
                                    </Typography>
                                </Box>
                            </CardContent>
                        </CardActionArea>
                    </Card>
                ))}
            </div>

            <Notification 
                open={notification.open}
                message={notification.message}
                severity={notification.severity}
                handleClose={() => setNotification({ ...notification, open: false })}
            />
        </div>
    );
}

export default Searchnearby;