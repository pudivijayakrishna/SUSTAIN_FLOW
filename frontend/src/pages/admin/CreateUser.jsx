import React, { useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    TextField,
    Button,
    Typography,
    Grid,
    MenuItem,
    Alert,
    CircularProgress,
    Stepper,
    Step,
    StepLabel,
    Paper
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import config from '../../config';

const CreateUser = () => {
    const navigate = useNavigate();
    const [activeStep, setActiveStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        email: '',
        role: '',
        contact: '',
        address: '',
        document: null
    });

    const steps = ['Basic Information', 'Contact Details', 'Role & Verification'];

    const handleFileChange = (event) => {
        setFormData({
            ...formData,
            document: event.target.files[0]
        });
    };

    const handleSubmit = async () => {
        setError('');
        setLoading(true);

        try {
            // Create form data for file upload
            const submitData = new FormData();
            Object.keys(formData).forEach(key => {
                if (formData[key] !== null) {
                    submitData.append(key, formData[key]);
                }
            });

            const response = await axios.post(
                `${config.BACKEND_API}/admin/users/create`,
                submitData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${localStorage.getItem('adminToken')}`
                    }
                }
            );

            navigate('/admin/users');
        } catch (error) {
            console.error('Error creating user:', error);
            setError(error.response?.data?.error || 'Failed to create user');
        } finally {
            setLoading(false);
        }
    };

    const handleNext = () => {
        setActiveStep((prevStep) => prevStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevStep) => prevStep - 1);
    };

    const getStepContent = (step) => {
        switch (step) {
            case 0:
                return (
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                required
                                fullWidth
                                label="Name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                required
                                fullWidth
                                label="Username"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                required
                                fullWidth
                                label="Email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </Grid>
                    </Grid>
                );

            case 1:
                return (
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Contact Number"
                                value={formData.contact}
                                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Address"
                                multiline
                                rows={4}
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            />
                        </Grid>
                    </Grid>
                );

            case 2:
                return (
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                required
                                fullWidth
                                select
                                label="Role"
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            >
                                <MenuItem value="donor">Donor</MenuItem>
                                <MenuItem value="ngo">NGO</MenuItem>
                                <MenuItem value="compostAgency">Compost Agency</MenuItem>
                            </TextField>
                        </Grid>
                        {(formData.role === 'ngo' || formData.role === 'compostAgency') && (
                            <Grid item xs={12}>
                                <Typography variant="subtitle2" gutterBottom>
                                    Upload Verification Document (MOA/Trust Deed)
                                </Typography>
                                <input
                                    accept="application/pdf,image/*"
                                    style={{ display: 'none' }}
                                    id="document-upload"
                                    type="file"
                                    onChange={handleFileChange}
                                />
                                <label htmlFor="document-upload">
                                    <Button
                                        variant="outlined"
                                        component="span"
                                        fullWidth
                                    >
                                        Upload Document
                                    </Button>
                                </label>
                                {formData.document && (
                                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                                        Selected file: {formData.document.name}
                                    </Typography>
                                )}
                            </Grid>
                        )}
                    </Grid>
                );

            default:
                return 'Unknown step';
        }
    };

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Create New User
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <Paper sx={{ p: 3, mb: 3 }}>
                <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>

                <form>
                    {getStepContent(activeStep)}

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                        <Button
                            disabled={activeStep === 0}
                            onClick={handleBack}
                            sx={{ mr: 1 }}
                        >
                            Back
                        </Button>
                        {activeStep === steps.length - 1 ? (
                            <Button
                                variant="contained"
                                onClick={handleSubmit}
                                disabled={loading}
                            >
                                {loading ? <CircularProgress size={24} /> : 'Create User'}
                            </Button>
                        ) : (
                            <Button
                                variant="contained"
                                onClick={handleNext}
                            >
                                Next
                            </Button>
                        )}
                    </Box>
                </form>
            </Paper>
        </Box>
    );
};

export default CreateUser; 