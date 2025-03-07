import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/auth';
import {
    Box,
    Card,
    CardContent,
    Typography,
    TextField,
    Button,
    Container,
    Alert
} from '@mui/material';
import axios from 'axios';
import config from '../config';

const ChangePassword = () => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();
    const { LogOut } = useAuth();

    useEffect(() => {
        // Check if user needs to change password
        const mustChange = localStorage.getItem('mustChangePassword');
        if (mustChange !== 'true') {
            navigate('/profile');
        }
    }, [navigate]);

    // Add password validation
    const validatePassword = (password) => {
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumber = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        const errors = [];
        if (password.length < minLength) {
            errors.push(`Password must be at least ${minLength} characters long`);
        }
        if (!hasUpperCase) {
            errors.push('Password must contain at least one uppercase letter');
        }
        if (!hasLowerCase) {
            errors.push('Password must contain at least one lowercase letter');
        }
        if (!hasNumber) {
            errors.push('Password must contain at least one number');
        }
        if (!hasSpecialChar) {
            errors.push('Password must contain at least one special character');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!currentPassword) {
            setError('Current password is required');
            return;
        }

        // Validate new password
        const validation = validatePassword(newPassword);
        if (!validation.isValid) {
            setError(validation.errors.join('\n'));
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (currentPassword === newPassword) {
            setError('New password must be different from current password');
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(
                `${config.BACKEND_API}/auth/change-password`,
                {
                    currentPassword,
                    newPassword
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );

            if (response.data.success) {
                // Show success message before logout
                setSuccess('Password changed successfully. Please login with your new password.');
                setTimeout(() => {
                    LogOut();
                    navigate('/login');
                }, 2000);
            }
        } catch (error) {
            setError(error.response?.data?.error || 'Failed to change password');
            if (error.response?.data?.details) {
                setError(Array.isArray(error.response.data.details) 
                    ? error.response.data.details.join('\n') 
                    : error.response.data.details);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="sm">
            <Box sx={{ mt: 8, mb: 4 }}>
                <Card>
                    <CardContent>
                        <Typography variant="h5" component="h1" gutterBottom>
                            Change Your Password
                        </Typography>
                        <Typography color="textSecondary" sx={{ mb: 3 }}>
                            Please change your temporary password to continue
                        </Typography>

                        {error && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {error}
                            </Alert>
                        )}

                        {success && (
                            <Alert severity="success" sx={{ mb: 2 }}>
                                {success}
                            </Alert>
                        )}

                        <form onSubmit={handleSubmit}>
                            <TextField
                                fullWidth
                                type="password"
                                label="Current Password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                margin="normal"
                                required
                            />
                            <TextField
                                fullWidth
                                type="password"
                                label="New Password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                margin="normal"
                                required
                            />
                            <TextField
                                fullWidth
                                type="password"
                                label="Confirm New Password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                margin="normal"
                                required
                            />
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                fullWidth
                                sx={{ mt: 3 }}
                                disabled={loading}
                            >
                                {loading ? 'Changing Password...' : 'Change Password'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </Box>
        </Container>
    );
};

export default ChangePassword; 