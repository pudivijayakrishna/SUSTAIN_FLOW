import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Box,
    Grid,
    TextField,
    Button,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    IconButton,
    Divider
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

const UserEditDialog = ({ 
    open, 
    onClose, 
    user, 
    onSubmit 
}) => {
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        contact: user?.contact || '',
        isBlocked: user?.isBlocked || false,
        blockReason: user?.blockReason || '',
    });
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleChange = (field) => (event) => {
        setFormData(prev => ({
            ...prev,
            [field]: event.target.value
        }));
        setError(null);
        setSuccess(false);
    };

    const handleSubmit = async () => {
        try {
            await onSubmit(formData);
            setSuccess(true);
            // Don't close automatically, let user see the success message
        } catch (err) {
            setError(err.message || 'Failed to update user');
        }
    };

    return (
        <Dialog 
            open={open} 
            onClose={onClose}
            maxWidth="md"
            fullWidth
        >
            <DialogTitle>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    Edit User Details
                    <IconButton onClick={onClose}>
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>

            <DialogContent>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}
                {success && (
                    <Alert severity="success" sx={{ mb: 2 }}>
                        User details updated successfully!
                    </Alert>
                )}

                <Box sx={{ p: 2 }}>
                    {/* Basic Information */}
                    <Typography variant="h6" gutterBottom>
                        Basic Information
                    </Typography>
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Name"
                                value={formData.name}
                                onChange={handleChange('name')}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Email"
                                value={formData.email}
                                onChange={handleChange('email')}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Username"
                                value={user?.username}
                                disabled
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Role"
                                value={user?.role}
                                disabled
                            />
                        </Grid>
                    </Grid>

                    <Divider sx={{ my: 3 }} />

                    {/* Contact Details */}
                    <Typography variant="h6" gutterBottom>
                        Contact Details
                    </Typography>
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Contact Number"
                                value={formData.contact}
                                onChange={handleChange('contact')}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Address"
                                value={user?.address}
                                disabled
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Location"
                                value={user?.location}
                                disabled
                            />
                        </Grid>
                    </Grid>

                    <Divider sx={{ my: 3 }} />

                    {/* Account Settings */}
                    <Typography variant="h6" gutterBottom>
                        Account Settings
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel>Account Status</InputLabel>
                                <Select
                                    value={formData.isBlocked}
                                    onChange={handleChange('isBlocked')}
                                >
                                    <MenuItem value={false}>Active</MenuItem>
                                    <MenuItem value={true}>Blocked</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        {formData.isBlocked && (
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={3}
                                    label="Block Reason"
                                    value={formData.blockReason}
                                    onChange={handleChange('blockReason')}
                                />
                            </Grid>
                        )}
                    </Grid>
                </Box>
            </DialogContent>

            <DialogActions sx={{ p: 3 }}>
                <Button onClick={onClose}>
                    Cancel
                </Button>
                <Button 
                    variant="contained" 
                    color="primary"
                    onClick={handleSubmit}
                >
                    Save Changes
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default UserEditDialog; 