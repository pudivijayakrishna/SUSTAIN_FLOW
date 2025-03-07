import React, { useState } from 'react';
import {
    Box,
    TextField,
    Button,
    Typography,
    Alert,
    CircularProgress
} from '@mui/material';
import axios from 'axios';
import config from '../config';

const OTPVerification = ({ email, onVerificationComplete }) => {
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [otpSent, setOtpSent] = useState(false);

    const handleSendOTP = async () => {
        try {
            setLoading(true);
            await axios.post(`${config.BACKEND_API}/auth/send-otp`, { email });
            setOtpSent(true);
            setError('');
        } catch (error) {
            setError(error.response?.data?.error || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async () => {
        if (!otp) {
            setError('Please enter OTP');
            return;
        }

        try {
            setLoading(true);
            await onVerificationComplete(otp);
            setError('');
        } catch (error) {
            setError(error.response?.data?.error || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box>
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}
            
            <Typography gutterBottom>
                Email: {email}
            </Typography>

            {!otpSent ? (
                <Button 
                    variant="contained" 
                    onClick={handleSendOTP}
                    fullWidth
                    disabled={loading}
                >
                    {loading ? <CircularProgress size={24} /> : 'Send OTP'}
                </Button>
            ) : (
                <Box>
                    <TextField
                        label="Enter OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        fullWidth
                        margin="normal"
                        disabled={loading}
                    />
                    <Button 
                        variant="contained" 
                        onClick={handleVerifyOTP}
                        fullWidth
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Verify OTP'}
                    </Button>
                </Box>
            )}
        </Box>
    );
};

export default OTPVerification; 