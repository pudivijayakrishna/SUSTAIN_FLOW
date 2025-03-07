import React, { useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    Rating,
    TextField,
    Button,
    Alert,
    CircularProgress
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import config from '../config';

const FeedbackForm = () => {
    const { pickupId } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        rating: 0,
        comment: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await axios.post(`${config.BACKEND_API}/api/feedback/${pickupId}`, formData, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            setSuccess(true);
            setTimeout(() => {
                navigate('/dashboard');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to submit feedback');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <Alert severity="success" sx={{ mt: 2 }}>
                Thank you for your feedback! Redirecting...
            </Alert>
        );
    }

    return (
        <Paper elevation={3} sx={{ p: 3, maxWidth: 600, mx: 'auto', mt: 4 }}>
            <Typography variant="h5" gutterBottom align="center">
                Share Your Feedback
            </Typography>

            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
                <Box sx={{ mb: 3, textAlign: 'center' }}>
                    <Typography component="legend">Rate your experience</Typography>
                    <Rating
                        name="rating"
                        value={formData.rating}
                        onChange={(_, value) => setFormData(prev => ({
                            ...prev,
                            rating: value
                        }))}
                        size="large"
                        sx={{ mt: 1 }}
                    />
                </Box>

                <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Your Comments"
                    value={formData.comment}
                    onChange={(e) => setFormData(prev => ({
                        ...prev,
                        comment: e.target.value
                    }))}
                    sx={{ mb: 3 }}
                />

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    disabled={loading || !formData.rating}
                >
                    {loading ? <CircularProgress size={24} /> : 'Submit Feedback'}
                </Button>
            </Box>
        </Paper>
    );
};

export default FeedbackForm; 