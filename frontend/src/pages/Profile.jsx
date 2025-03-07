import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import LogoutIcon from "@mui/icons-material/Logout";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import {
  Grid,
  Typography,
  TextField,
  Button,
  Box,
} from "@mui/material";
import AOS from "aos";
import "aos/dist/aos.css";
import axios from "axios";

import { useAuth } from "../context/auth";
import config from "../config.js";
import "../styles/SearchBox.css";
import LocationSearch from '../components/LocationSearch';
import Notification from '../components/Notification';

const Profile = () => {
  const imageURL =
    "https://media.istockphoto.com/id/1300845620/vector/user-icon-flat-isolated-on-white-background-user-symbol-vector-illustration.jpg?s=612x612&w=0&k=20&c=yBeyba0hUkh14_jgv1OKqIH0CCSWU_4ckRkAoy2p73o=";

  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [type, setType] = useState("");
  const [address, setAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [location, setLocation] = useState("");
  const [justVerify, setJustVerify] = useState(false);

  const [isValidPhone, setIsValidPhone] = useState(false);
  const navigate = useNavigate();
  const { setIsLoggedIn, setRole, LogOut, userData, setUserData } = useAuth();

  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const validatePhoneNumber = (input) => {
    if (input) {
      const value = input.replace(/\D/g, "");
      const isValid = /^\d{10}$/.test(value);
      setIsValidPhone(isValid);
    } else {
      setIsValidPhone(false);
    }
  };

  const theme = createTheme({
    typography: {
      fontFamily: "Quicksand",
      body1: {
        fontWeight: "600",
      },
    },
  });

  const getAuthToken = () => {
    const token = window.localStorage.getItem("token");
    
    if (!token) {
        LogOut();
        navigate("/login");
        return null;
    }

    try {
        const cleanToken = token.replace(/^"|"$/g, '');
        return `Bearer ${cleanToken}`;
    } catch (error) {
        console.error("Token error:", error);
        LogOut();
        navigate("/login");
        return null;
    }
  };

  const getProfile = useCallback(async () => {
    setLoading(true);
    const token = getAuthToken();
    
    if (!token) {
        setLoading(false);
        return;
    }

    try {
        const headers = {
            "Content-Type": "application/json",
            "Authorization": token
        };

        const result = await axios.get(
            `${config.BACKEND_API}/auth/profile`,
            { headers }
        );
        
        if (result.data && result.data.user) {
            const { user } = result.data;
            console.log("Profile data received:", user);
            
            setName(user.name || "");
            setEmail(user.email || "");
            setUserName(user.username || "");
            setType(user.role || "");
            setPhoneNumber(user.contact || "");
            setAddress(user.address || "");
            setLocation(user.location || "");
            validatePhoneNumber(user.contact);
            
            setUserData(user);
        }
    } catch (err) {
        console.error("Profile fetch error:", err);
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
            LogOut();
            navigate("/login");
        }
    } finally {
        setLoading(false);
    }
}, [LogOut, navigate, setUserData]);

  useEffect(() => {
    if (!userData) {
        getProfile();
    }
  }, []);

  useEffect(() => {
    if (userData) {
      setName(userData.name || '');
      setUserName(userData.username || '');
      setEmail(userData.email || '');
      setType(userData.role || '');
      setAddress(userData.address || '');
      setPhoneNumber(userData.contact || '');
      
      // Handle location data
      if (userData.location) {
        if (userData.location.coordinates && userData.location.address) {
          // New format
          setLocation({
            label: userData.location.address,
            position: {
              lat: userData.location.coordinates.lat,
              lon: userData.location.coordinates.lon
            }
          });
        } else if (typeof userData.location === 'string' && userData.location.includes(',')) {
          // Legacy format
          const [lat, lon] = userData.location.split(',').map(Number);
          setLocation({
            label: `${lat},${lon}`,
            position: { lat, lon }
          });
        }
      }
    }
  }, [userData]);

  const handleLocationSelect = (selectedLocation) => {
    if (selectedLocation) {
      setLocation(selectedLocation);
    }
  };

  const UpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setNotification({
          open: true,
          message: 'Authentication required',
          severity: 'error'
        });
        return;
      }

      const response = await axios.put(
        `${config.BACKEND_API}/auth/profile`,
        {
          name,
          contact: phoneNumber,
          address,
          location
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setNotification({
          open: true,
          message: 'Profile updated successfully',
          severity: 'success'
        });

        // Refresh user data
        const profileResponse = await axios.get(
          `${config.BACKEND_API}/auth/profile`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        
        if (profileResponse.data.success) {
          setUserData(profileResponse.data.user);
        }
      }
    } catch (error) {
      console.error("Update profile error:", error);
      setNotification({
        open: true,
        message: error.response?.data?.error || 'Failed to update profile',
        severity: 'error'
      });
    }
  };

  return (
    <div
      data-aos="fade-up"
      style={{ margin: "2em", fontFamily: "Quicksand", fontWeight: "600" }}
    >
        <ThemeProvider theme={theme}>
          <Grid container spacing={3} justifyContent="center">
            <Grid item xs={12} sm={6} md={6} lg={4} xl={4}>
              <Card
                sx={{
                  maxWidth: "100%",
                  justifyContent: "center",
                  textAlign: "center",
                }}
              >
                <CardMedia
                  component="img"
                  alt="profile"
                  height="100"
                  image={imageURL}
                  style={{ maxWidth: "100%", height: "auto" }}
                />
                <CardContent>
                  <Typography
                    variant="h5"
                    component="div"
                    sx={{ fontWeight: "bold" }}
                  >
                    YOU
                  </Typography>
                  <Typography
                    variant="subtitle1"
                    color="textSecondary"
                    sx={{ fontWeight: "bold" }}
                  >
                    {userName}
                  </Typography>
                  <Typography
                    variant="subtitle1"
                    color="textSecondary"
                    sx={{ fontWeight: "bold" }}
                  >
                    {email}
                  </Typography>
                  <Typography
                    variant="subtitle1"
                    color="textSecondary"
                    sx={{ fontWeight: "bold" }}
                  >
                    {phoneNumber ? `+91 ${phoneNumber}` : "+91"}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={6} lg={6} xl={6}>
              <Card>
                <CardContent>
                  <Grid container spacing={2} style={{ marginLeft: "0.1em" }}>
                    <Grid item xs={10} style={{ marginTop: "1em" }}>
                      <Typography
                        variant="h4"
                        component="div"
                        sx={{ fontWeight: "bold" }}
                      >
                        Profile
                      </Typography>
                    </Grid>
                    <Grid item xs={10} style={{ marginTop: "1em" }}>
                      <TextField
                        id="standard-helperText-1"
                        label="First Name"
                        value={name}
                        fullWidth
                        autoComplete="off"
                        InputProps={{
                            readOnly: true,
                        }}
                      />
                    </Grid>
                    <Grid item xs={10} style={{ marginTop: "0.4em" }}>
                      <TextField
                        id="standard-helperText-4"
                        label="Username"
                        value={userName}
                        fullWidth
                        autoComplete="off"
                        InputProps={{
                            readOnly: true,
                        }}
                      />
                    </Grid>
                    <Grid item xs={10}>
                      <TextField
                        id="outlined-read-only-input-5"
                        label="Email"
                        value={email}
                        fullWidth
                        autoComplete="off"
                        InputProps={{
                            readOnly: true,
                        }}
                      />
                    </Grid>
                    <Grid item xs={10} style={{ marginTop: "0.4em" }}>
                      <TextField
                        id="standard-helperText-4"
                        label="Type"
                        value={type}
                        fullWidth
                        autoComplete="off"
                        InputProps={{
                            readOnly: true,
                        }}
                      />
                    </Grid>
                    <Grid item xs={10} style={{ marginTop: "0.4em" }}>
                      <TextField
                        id="standard-helperText-1"
                        label="Address"
                        value={address}
                        onChange={(e) => {
                          setAddress(e.target.value);
                        }}
                        fullWidth
                        autoComplete="off"
                        error={justVerify && address === ""}
                        helperText={
                          justVerify &&
                          (address === "" ? "address cannot be empty." : "")
                        }
                        multiline
                        rows={3}
                      />
                    </Grid>
                    <Grid item xs={10} style={{ marginTop: "0.4em" }}>
                      <TextField
                        id="standard-helperText-8"
                        label="Phone No."
                        value={phoneNumber}
                        onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, "").substring(0, 10);
                            validatePhoneNumber(value);
                            setPhoneNumber(value);
                        }}
                        fullWidth
                        autoComplete="off"
                        error={!isValidPhone && justVerify}
                        helperText={
                            justVerify &&
                            (!isValidPhone
                                ? "Please enter a valid 10-digit phone number."
                                : "")
                        }
                        InputProps={{
                            startAdornment: <span style={{ color: 'rgba(0, 0, 0, 0.54)' }}>+91 </span>
                        }}
                      />
                    </Grid>
                    <Grid item xs={10} style={{ marginTop: "0.4em" }}>
                      <LocationSearch 
                        onLocationSelect={handleLocationSelect} 
                        initialValue={location}
                      />
                    </Grid>
                    <Grid item xs={10} style={{ marginTop: "1em" }}>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={UpdateProfile}
                        disabled={loading}
                        fullWidth
                      >
                        {loading ? "Updating..." : "Update Profile"}
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </ThemeProvider>

        <Notification 
            open={notification.open}
            message={notification.message}
            severity={notification.severity}
            handleClose={() => setNotification({ ...notification, open: false })}
        />
    </div>
  );
};

export default Profile;