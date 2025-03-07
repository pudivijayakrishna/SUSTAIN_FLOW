import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import FeedbackForm from '../components/FeedbackForm';

const Feedback = () => {
    return (
        <Container maxWidth="md">
            <Box sx={{ py: 4 }}>
                <Typography variant="h4" gutterBottom align="center">
                    Pickup Feedback
                </Typography>
                <Typography color="text.secondary" align="center" sx={{ mb: 4 }}>
                    Your feedback helps us improve our service
                </Typography>
                <FeedbackForm />
            </Box>
        </Container>
    );
};

export default Feedback; 