import { useEffect, useState } from "react";
import { styled } from "@mui/material/styles";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";

import React from "react";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Button from "@mui/material/Button";
import PaymentIcon from "@mui/icons-material/Payment";
import CancelIcon from "@mui/icons-material/Cancel";

import { useNavigate } from "react-router-dom";
import RemoveIcon from "@mui/icons-material/Remove";
import { Tune } from "@mui/icons-material";

import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import AOS from "aos";
import "aos/dist/aos.css";
import axios from "axios";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import NotInterestedIcon from "@mui/icons-material/NotInterested";
import Tooltip from "@mui/material/Tooltip";
import Zoom from "@mui/material/Zoom";

import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

import "../CSS/Agency.css";
import config from "../config.js";
import Notification from './Notification';

function Agency() {
  const [queue, setQueue] = useState([]);

  const [open1, setOpen1] = React.useState(false);
  const [open2, setOpen2] = React.useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(-1);

  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [detailsModal, setDetailsModal] = useState(false);

  const handleClickOpen1 = () => {
    setOpen1(true);
  };

  const handleClose1 = () => {
    setOpen1(false);
  };

  const handleClickOpen2 = () => {
    setOpen2(true);
  };

  const handleClose2 = () => {
    setOpen2(false);
  };

  const acceptRequest = async (request) => {
    try {
        const headers = {
            "Content-Type": "application/json",
            Authorization: `Bearer ${window.localStorage.getItem("token")}`
        };

        await axios.post(
            `${config.BACKEND_API}/agency/confirm-supplies`,
            {
                sender: request.sender,
                quantity: request.quantity,
                wasteType: request.wasteType,
                itemType: request.itemType,
                description: request.description
            },
            { headers }
        );

        await getQueue();
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
  const rejectRequest = async (request) => {
    try {
        const headers = {
            "Content-Type": "application/json",
            Authorization: `Bearer ${window.localStorage.getItem("token")}`
        };

        await axios.post(
            `${config.BACKEND_API}/agency/reject-supplies`,
            {
                id: request._id,
                sender: request.sender,
                reason: 'Request rejected by agency'
            },
            { headers }
        );

        await getQueue();
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

  const getQueue = async () => {
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${window.localStorage.getItem("token")}`,
    };

    try {
      const results = await axios.get(
        (config.BACKEND_API || "http://localhost:8000") + "/agency",
        {
          headers,
        }
      );
      //   console.log("results", results.data);
      setQueue(results.data.requests);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getQueue();
  }, []);

  const theme = createTheme({
    typography: {
      fontFamily: "Quicksand",
      body1: {
        fontWeight: "600",
        fontSize: "medium",
      },
    },
  });

  useEffect(() => {
    AOS.init({
      duration: 600,
      easing: "ease-in-out",
      once: true,
    });
  }, []);

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  // Add this function to handle request updates
  const handleRequestUpdate = (updatedRequest) => {
    // Remove the request from the queue immediately
    setQueue(prevQueue => prevQueue.filter(request => 
        request.sender !== updatedRequest.sender || 
        request.quantity !== updatedRequest.quantity
    ));
  };

  // Function to handle opening details modal
  const handleOpenDetails = (request) => {
    setSelectedRequest(request);
    setDetailsModal(true);
  };

  // Function to handle closing details modal
  const handleCloseDetails = () => {
    setDetailsModal(false);
    setSelectedRequest(null);
  };

  // Function to render request details based on type
  const renderRequestDetails = (request) => {
    if (request.type === 'ngo') {
      return (
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
    } else {
      return (
        <>
          <Typography variant="subtitle1">
            <strong>Waste Type:</strong> {request.wasteType}
          </Typography>
          <Typography variant="subtitle1">
            <strong>Item Type:</strong> {request.itemType}
          </Typography>
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
    }
  };

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
            Queues
          </Typography>
          {queue.length === 0 ? (
            <>
              <Card sx={{ maxWidth: 345, margin: "auto" }}>
                <CardMedia
                  sx={{ height: 350 }}
                  image="https://dm0qx8t0i9gc9.cloudfront.net/thumbnails/image/rDtN98Qoishumwih/empty-white-paper-sheet_zJwl80Lu_thumb.jpg"
                  title="green iguana"
                />
                <CardContent>
                  <Typography gutterBottom variant="h5" component="div">
                    EMPTY
                  </Typography>
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              <Box sx={{ flexGrow: 1 }} style={{ margin: "4%" }}>
                <Grid container spacing={2}>
                  {queue.map((row, index) => (
                    <Grid key={index} item xs={12} md={10}>
                      <Accordion
                        style={{
                          backgroundColor:
                            hoveredIndex === index ? "#119da4" : "ghostwhite",
                          transform:
                            hoveredIndex === index ? "scale(1.01)" : "scale(1)",
                          transition: "all 0.15s ease",
                        }}
                        onMouseEnter={() => setHoveredIndex(index)}
                        onMouseLeave={() => setHoveredIndex(-1)}
                      >
                        <AccordionSummary
                          expandIcon={<ExpandMoreIcon />}
                          onClick={() => handleOpenDetails(row)}
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
                              User: {row.senderName || row.sender}
                            </Button>
                            <Button className="mx-2 px-4">
                              {row.wasteType} - {row.itemType}
                            </Button>
                            <Button className="mx-2 px-4">
                              {row.quantity} kg
                            </Button>
                            <Tooltip TransitionComponent={Zoom} title="Accept">
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleClickOpen1();
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
                                  handleClickOpen2();
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
                    onClick={() => acceptRequest(selectedRequest)}
                    color="success" 
                    variant="contained"
                  >
                    Accept
                  </Button>
                  <Button 
                    onClick={() => rejectRequest(selectedRequest)}
                    color="error" 
                    variant="contained"
                  >
                    Reject
                  </Button>
                </DialogActions>
              </Dialog>
            </>
          )}
        </ThemeProvider>
      </div>
      <div className="mt-5">&nbsp;</div>
      <div className="mt-5">&nbsp;</div>
      <div className="mt-5">&nbsp;</div>
      <Notification 
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        handleClose={handleCloseNotification}
      />
    </>
  );
}

export default Agency;
