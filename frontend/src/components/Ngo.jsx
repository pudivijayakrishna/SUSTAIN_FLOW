import { useEffect, useState } from "react";
import { styled } from "@mui/material/styles";
import {
    Grid,
    Typography,
    Button,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Box,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Tooltip,
    Zoom,
    Card,
    CardMedia,
    CardContent
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import NotInterestedIcon from '@mui/icons-material/NotInterested';
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Notification from './Notification';
import axios from "axios";
import config from "../config.js";

function Ngo() {
    const [queue, setQueue] = useState([]);
    const [hoveredIndex, setHoveredIndex] = useState(-1);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [detailsModal, setDetailsModal] = useState(false);
    const [notification, setNotification] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    const theme = createTheme({
        typography: {
            fontFamily: "Quicksand",
            body1: {
                fontWeight: "600",
                fontSize: "medium",
            },
        },
    });

    const fetchRequests = async () => {
        try {
            const headers = {
                "Content-Type": "application/json",
                Authorization: `Bearer ${window.localStorage.getItem("token")}`
            };

            const response = await axios.get(
                `${config.BACKEND_API}/ngo/requests`,
                { headers }
            );

            setQueue(response.data.requests || []);
        } catch (error) {
            console.error('Error fetching requests:', error);
            setNotification({
                open: true,
                message: 'Error fetching requests',
                severity: 'error'
            });
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleOpenDetails = (request) => {
        setSelectedRequest(request);
        setDetailsModal(true);
    };

    const handleCloseDetails = () => {
        setDetailsModal(false);
        setSelectedRequest(null);
    };

    const handleAcceptRequest = async (request) => {
        try {
            const headers = {
                "Content-Type": "application/json",
                Authorization: `Bearer ${window.localStorage.getItem("token")}`
            };

            await axios.post(
                `${config.BACKEND_API}/ngo/accept-request`,
                {
                    sender: request.sender,
                    quantity: request.quantity
                },
                { headers }
            );

            await fetchRequests();
            handleCloseDetails();

            setNotification({
                open: true,
                message: 'Request accepted successfully',
                severity: 'success'
            });

        } catch (error) {
            console.error('Error accepting request:', error);
            setNotification({
                open: true,
                message: error.response?.data?.message || 'Error accepting request',
                severity: 'error'
            });
        }
    };

    const handleRejectRequest = async (request) => {
        try {
            const headers = {
                "Content-Type": "application/json",
                Authorization: `Bearer ${window.localStorage.getItem("token")}`
            };

            await axios.post(
                `${config.BACKEND_API}/ngo/reject-request`,
                {
                    sender: request.sender,
                    quantity: request.quantity
                },
                { headers }
            );

            await fetchRequests();
            handleCloseDetails();

            setNotification({
                open: true,
                message: 'Request rejected successfully',
                severity: 'success'
            });

        } catch (error) {
            console.error('Error rejecting request:', error);
            setNotification({
                open: true,
                message: error.response?.data?.error || 'Error rejecting request',
                severity: 'error'
            });
        }
    };

    const renderRequestDetails = (request) => (
        <>
            <Typography variant="subtitle1">
                <strong>Item Category:</strong> {request.itemCategory}
            </Typography>
            {request.itemCategory === 'others' && (
                <Typography variant="subtitle1">
                    <strong>Item Name:</strong> {request.itemName}
                </Typography>
            )}
            <Typography variant="subtitle1">
                <strong>Quantity:</strong> {request.quantity} kg
            </Typography>
            <Typography variant="subtitle1">
                <strong>Description:</strong>
            </Typography>
            <Typography variant="body1" sx={{ mt: 1, mb: 2 }}>
                {request.description}
            </Typography>
        </>
    );

    return (
        <>
            <div data-aos="fade-up">
                <ThemeProvider theme={theme}>
                    <Typography
                        style={{
                            margin: "auto",
                            marginTop: "4%",
                            marginBottom: "4%",
                            width: "90%",
                            fontWeight: "bold",
                        }}
                        variant="h4"
                    >
                        Donation Requests
                    </Typography>

                    {queue.length === 0 ? (
                        <Card sx={{ maxWidth: 345, margin: "auto" }}>
                            <CardMedia
                                sx={{ height: 350 }}
                                image="https://dm0qx8t0i9gc9.cloudfront.net/thumbnails/image/rDtN98Qoishumwih/empty-white-paper-sheet_zJwl80Lu_thumb.jpg"
                                title="empty"
                            />
                            <CardContent>
                                <Typography gutterBottom variant="h5" component="div">
                                    No Pending Requests
                                </Typography>
                            </CardContent>
                        </Card>
                    ) : (
                        <Box sx={{ flexGrow: 1 }} style={{ margin: "4%" }}>
                            <Grid container spacing={2}>
                                {queue.map((request, index) => (
                                    <Grid key={index} item xs={12} md={10}>
                                        <Accordion
                                            style={{
                                                backgroundColor: hoveredIndex === index ? "#119da4" : "ghostwhite",
                                                transform: hoveredIndex === index ? "scale(1.01)" : "scale(1)",
                                                transition: "all 0.15s ease",
                                            }}
                                            onMouseEnter={() => setHoveredIndex(index)}
                                            onMouseLeave={() => setHoveredIndex(-1)}
                                        >
                                            <AccordionSummary
                                                expandIcon={<ExpandMoreIcon />}
                                                onClick={() => handleOpenDetails(request)}
                                            >
                                                <Typography style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "space-between",
                                                    width: "100%"
                                                }}>
                                                    <Button className="mx-2 px-4">
                                                        {index + 1}
                                                    </Button>
                                                    <Button className="mx-2 px-4">
                                                        Donor: {request.senderName || request.sender}
                                                    </Button>
                                                    <Button className="mx-2 px-4">
                                                        {request.itemCategory}
                                                        {request.itemCategory === 'others' ? ` (${request.itemName})` : ''}
                                                    </Button>
                                                    <Button className="mx-2 px-4">
                                                        {request.quantity} kg
                                                    </Button>
                                                    <Tooltip TransitionComponent={Zoom} title="Accept">
                                                        <Button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleAcceptRequest(request);
                                                            }}
                                                            className="mx-2 px-4"
                                                            style={{
                                                                backgroundColor: "#83f28f",
                                                                color: "#00ab41",
                                                                borderRadius: "1em",
                                                            }}
                                                        >
                                                            <HowToRegIcon />
                                                        </Button>
                                                    </Tooltip>
                                                    <Tooltip TransitionComponent={Zoom} title="Reject">
                                                        <Button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleRejectRequest(request);
                                                            }}
                                                            className="mx-2 px-4"
                                                            style={{
                                                                backgroundColor: "#ffe5ec",
                                                                color: "red",
                                                                borderRadius: "1em",
                                                            }}
                                                        >
                                                            <NotInterestedIcon />
                                                        </Button>
                                                    </Tooltip>
                                                </Typography>
                                            </AccordionSummary>
                                        </Accordion>
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    )}

                    {/* Details Modal */}
                    <Dialog
                        open={detailsModal}
                        onClose={handleCloseDetails}
                        maxWidth="sm"
                        fullWidth
                    >
                        <DialogTitle>
                            Donation Request Details
                        </DialogTitle>
                        <DialogContent dividers>
                            {selectedRequest && renderRequestDetails(selectedRequest)}
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleCloseDetails}>
                                Close
                            </Button>
                            <Button 
                                onClick={() => handleAcceptRequest(selectedRequest)}
                                color="success" 
                                variant="contained"
                            >
                                Accept
                            </Button>
                            <Button 
                                onClick={() => handleRejectRequest(selectedRequest)}
                                color="error" 
                                variant="contained"
                            >
                                Reject
                            </Button>
                        </DialogActions>
                    </Dialog>
                </ThemeProvider>
            </div>
            <Notification 
                open={notification.open}
                message={notification.message}
                severity={notification.severity}
                handleClose={() => setNotification({ ...notification, open: false })}
            />
        </>
    );
}

export default Ngo;
