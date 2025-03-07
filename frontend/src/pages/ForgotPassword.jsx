import React, { useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    TextField,
    Button,
    Container,
    Alert,
    CircularProgress
} from '@mui/material';
import axios from 'axios';
import config from '../config';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        const url = `${config.BACKEND_API}/auth/forgot-password`;
        console.log('Sending request to:', url);

        try {
            const response = await axios.post(url, { email });
            console.log('Response:', response.data);

            setSuccess('Password reset instructions have been sent to your email.');
            setEmail('');
        } catch (error) {
            console.error('Error:', error);
            setError(error.response?.data?.error || 'Failed to process request');
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
                            Forgot Password
                        </Typography>
                        <Typography color="textSecondary" sx={{ mb: 3 }}>
                            Enter your email address to reset your password
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
                                type="email"
                                label="Email Address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
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
                                    'Reset Password'
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </Box>
        </Container>
    );
};

export default ForgotPassword; 