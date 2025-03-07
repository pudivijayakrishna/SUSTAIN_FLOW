import * as React from "react";
import { useState } from "react";
import {
    Avatar,
    Button,
    CssBaseline,
    TextField,
    Typography,
    Container,
    Alert,
    Select,
    MenuItem,
    Box,
    FormControl,
    InputLabel,
    Link,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { useAuth } from "../context/auth";
import { adminApi } from "../services/adminApi";
import axios from "axios";
import config from "../config.js";

const defaultTheme = createTheme();

const getRedirectPath = (role) => {
    switch (role) {
        case 'admin':
            return '/admin/dashboard';
        case 'donor':
            return '/donor';
        case 'ngo':
            return '/ngo';
        case 'compostAgency':
            return '/agency';
        default:
            return '/';
    }
};

export default function Login() {
    const [formData, setFormData] = useState({
        username: "",
        password: "",
        role: ""
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const { setIsLoggedIn, setRole, setUsername } = useAuth();
    const navigate = useNavigate();
    const [verificationStatus, setVerificationStatus] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.username || !formData.password || !formData.role) {
            setError("All fields are required");
            return;
        }

        setLoading(true);
        setError("");
        setVerificationStatus(null);

        try {
            console.log('Attempting login with:', {
                username: formData.username,
                role: formData.role,
                hasPassword: !!formData.password
            });

            if (formData.role === 'admin') {
                console.log('Attempting admin login...');
                const response = await adminApi.login({
                    username: formData.username,
                    password: formData.password
                });

                if (response.success) {
                    localStorage.setItem('adminToken', response.token);
                    setIsLoggedIn(true);
                    setRole("admin");
                    setUsername("admin");
                    navigate("/admin/dashboard");
                }
            } else {
                const response = await axios.post(
                    `${config.BACKEND_API}/auth/login`,
                    formData,
                    {
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }
                );

                console.log('Login response:', response.data);

                if (response.data.success) {
                    // Store user data
                    localStorage.setItem('token', response.data.token);
                    localStorage.setItem('role', response.data.user.role);
                    localStorage.setItem('username', response.data.user.username);
                    localStorage.setItem('email', response.data.user.email);
                    localStorage.setItem('name', response.data.user.name);
                    localStorage.setItem('mustChangePassword', response.data.user.mustChangePassword);

                    // Update auth context
                    setIsLoggedIn(true);
                    setRole(response.data.user.role);
                    setUsername(response.data.user.username);

                    // Handle navigation
                    if (response.data.user.mustChangePassword) {
                        navigate('/change-password');
                    } else {
                        navigate(getRedirectPath(response.data.user.role));
                    }
                }
            }
        } catch (error) {
            console.log('Login error details:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message
            });
            
            if (error.response?.data?.error === 'Account pending verification') {
                setVerificationStatus({
                    status: error.response.data.verificationStatus,
                    message: 'Your account is pending verification. Please wait for admin approval.'
                });
            } else {
                setError(error.response?.data?.error || "Login failed");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError(""); // Clear error when user types
    };

    return (
        <div className="my-glass-effect">
            <ThemeProvider theme={defaultTheme}>
                <Container component="main" maxWidth="sm">
                    <CssBaseline />
                    <Box sx={{
                        marginTop: 12,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        borderRadius: '2em',
                        padding: '3em',
                    }}>
                        <Avatar sx={{ m: 1 }} style={{ backgroundColor: "#25396F" }}>
                            <LockOutlinedIcon />
                        </Avatar>
                        <Typography component="h1" variant="h5">
                            Sign In
                        </Typography>
                        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 3 }}>
                            <FormControl fullWidth sx={{ mb: 2 }}>
                                <InputLabel>Role</InputLabel>
                                <Select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <MenuItem value="admin">Admin</MenuItem>
                                    <MenuItem value="compostAgency">Compost Agency</MenuItem>
                                    <MenuItem value="ngo">NGO</MenuItem>
                                    <MenuItem value="donor">Donor</MenuItem>
                                </Select>
                            </FormControl>

                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                label="Username"
                                name="username"
                                value={formData.username}
                                onChange={handleInputChange}
                                autoFocus
                            />
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                name="password"
                                label="Password"
                                type="password"
                                value={formData.password}
                                onChange={handleInputChange}
                            />

                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                sx={{ mt: 3, mb: 2 }}
                                disabled={loading}
                            >
                                {loading ? "Signing In..." : "Sign In"}
                            </Button>

                            {error && (
                                <Alert severity="error" sx={{ mt: 2 }}>
                                    {error}
                                </Alert>
                            )}
                            {verificationStatus && (
                                <Alert 
                                    severity={verificationStatus.status === 'pending' ? 'info' : 'warning'}
                                    sx={{ mt: 2 }}
                                >
                                    {verificationStatus.message}
                                </Alert>
                            )}
                        </Box>
                    </Box>
                    <Box sx={{ mt: 2, textAlign: 'center' }}>
                        <Typography variant="body2">
                            Don't have an account?{' '}
                            <Link 
                                component={RouterLink} 
                                to="/register"
                                sx={{ 
                                    color: defaultTheme.palette.primary.main,
                                    textDecoration: 'none',
                                    '&:hover': {
                                        textDecoration: 'underline'
                                    }
                                }}
                            >
                                Register here
                            </Link>
                        </Typography>
                    </Box>
                    <Box sx={{ mt: 2, textAlign: 'center' }}>
                        <Typography variant="body2">
                            <Link 
                                component={RouterLink} 
                                to="/forgot-password"
                                sx={{ 
                                    color: defaultTheme.palette.primary.main,
                                    textDecoration: 'none',
                                    '&:hover': {
                                        textDecoration: 'underline'
                                    }
                                }}
                            >
                                Forgot Password?
                            </Link>
                        </Typography>
                    </Box>
                </Container>
            </ThemeProvider>
        </div>
    );
}
