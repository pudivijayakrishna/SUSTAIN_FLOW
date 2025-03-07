import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box, Card, CardContent, Typography, TextField, Button,
    Container, Alert, CircularProgress, Stepper, Step, StepLabel
} from '@mui/material';
import OTPVerification from '../components/OTPVerification';
import axios from 'axios';
import config from '../config';

const steps = ['Enter New Password', 'Verify Email'];

const ResetPassword = () => {
    const [activeStep, setActiveStep] = useState(0);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [email, setEmail] = useState('');
    const { token } = useParams();
    const navigate = useNavigate();

    // Verify token and get email
    React.useEffect(() => {
        const verifyToken = async () => {
            try {
                const response = await axios.get(
                    `${config.BACKEND_API}/auth/verify-reset-token/${token}`
                );
                setEmail(response.data.email);
            } catch (error) {
                setError('Invalid or expired reset token');
            }
        };
        verifyToken();
    }, [token]);

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }
await handlePassword()
        // setActiveStep(1);
    };

    const handlePassword = async () => {
        try {
            setLoading(true);
            const response = await axios.post(
                `${config.BACKEND_API}/auth/setnewpassword`,
                { 
                    newPassword:password,
                    email 
                }
            );
            
            setSuccess('Password has been reset successfully. You can now login with your new password.');
            setTimeout(() => {
                navigate('/login');
            }, 1000);
        } catch (error) {
            console.error('Error:', error);
            setError(error.response?.data?.error || 'Failed to reset password');
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
                            Reset Password
                        </Typography>

                        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                            {steps.map((label) => (
                                <Step key={label}>
                                    <StepLabel>{label}</StepLabel>
                                </Step>
                            ))}
                        </Stepper>

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


                            <form onSubmit={handlePasswordSubmit}>
                                <TextField
                                    fullWidth
                                    type="password"
                                    label="New Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    margin="normal"
                                    required
                                    helperText="Password must be at least 8 characters long, contain one uppercase letter, one number, and one special character"
                                />
                                <TextField
                                    fullWidth
                                    type="password"
                                    label="Confirm Password"
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
                                    {loading ? (
                                        <CircularProgress size={24} />
                                    ) : (
                                        'Continue'
                                    )}
                                </Button>
                            </form>
                    </CardContent>
                </Card>
            </Box>
        </Container>
    );
};

export default ResetPassword; 