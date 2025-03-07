import React, { useState } from 'react';
import {
    Box,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Button,
    Typography,
    Paper,
    Grid,
    FormHelperText,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';

const DonationForm = ({ type, onSubmit, onClose }) => {
    const [formData, setFormData] = useState({
        itemCategory: '',
        itemName: '',
        wasteType: '',
        itemType: '',
        quantity: '',
        description: '',
    });
    const [errors, setErrors] = useState({});
    const [showPreview, setShowPreview] = useState(false);

    const validateForm = () => {
        const newErrors = {};

        if (type === 'ngo') {
            if (!formData.itemCategory) {
                newErrors.itemCategory = 'Please select an item category';
            }
            if (formData.itemCategory === 'others' && !formData.itemName) {
                newErrors.itemName = 'Please enter item name';
            }
            if (formData.itemCategory === 'books' && formData.quantity < 1) {
                newErrors.quantity = 'Minimum 1 book required';
            }
        } else {
            if (!formData.wasteType) {
                newErrors.wasteType = 'Please select waste type';
            }
            if (!formData.itemType) {
                newErrors.itemType = 'Please enter item type';
            }
        }

        if (!formData.quantity || formData.quantity <= 0) {
            newErrors.quantity = 'Please enter a valid quantity';
        }

        if (!formData.description.trim()) {
            newErrors.description = 'Description is required';
        } else if (formData.description.length > 300) {
            newErrors.description = 'Description must be less than 300 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            setShowPreview(true);
        }
    };

    const handleConfirmSubmit = () => {
        onSubmit(formData);
        setShowPreview(false);
        onClose();
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
                {type === 'ngo' ? 'NGO Donation Form' : 'Compost Agency Donation Form'}
            </Typography>

            <Grid container spacing={3}>
                {type === 'ngo' ? (
                    // NGO Form Fields
                    <>
                        <Grid item xs={12}>
                            <FormControl fullWidth error={!!errors.itemCategory}>
                                <InputLabel>Item Category</InputLabel>
                                <Select
                                    value={formData.itemCategory}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        itemCategory: e.target.value
                                    })}
                                >
                                    <MenuItem value="books">Books</MenuItem>
                                    <MenuItem value="clothes">Clothes</MenuItem>
                                    <MenuItem value="surplus food">Surplus Food</MenuItem>
                                    <MenuItem value="others">Others</MenuItem>
                                </Select>
                                {errors.itemCategory && (
                                    <FormHelperText>{errors.itemCategory}</FormHelperText>
                                )}
                            </FormControl>
                        </Grid>
                        {formData.itemCategory === 'others' && (
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Item Name"
                                    value={formData.itemName}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        itemName: e.target.value
                                    })}
                                    error={!!errors.itemName}
                                    helperText={errors.itemName}
                                />
                            </Grid>
                        )}
                    </>
                ) : (
                    // Compost Agency Form Fields
                    <>
                        <Grid item xs={12}>
                            <FormControl fullWidth error={!!errors.wasteType}>
                                <InputLabel>Waste Type</InputLabel>
                                <Select
                                    value={formData.wasteType}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        wasteType: e.target.value
                                    })}
                                >
                                    <MenuItem value="food">Food Waste</MenuItem>
                                    <MenuItem value="e-waste">E-Waste</MenuItem>
                                </Select>
                                {errors.wasteType && (
                                    <FormHelperText>{errors.wasteType}</FormHelperText>
                                )}
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Item Type"
                                value={formData.itemType}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    itemType: e.target.value
                                })}
                                error={!!errors.itemType}
                                helperText={errors.itemType}
                            />
                        </Grid>
                    </>
                )}

                {/* Common Fields */}
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        type="number"
                        label="Quantity (kg)"
                        value={formData.quantity}
                        onChange={(e) => setFormData({
                            ...formData,
                            quantity: e.target.value
                        })}
                        error={!!errors.quantity}
                        helperText={errors.quantity}
                    />
                </Grid>

                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label="Description"
                        value={formData.description}
                        onChange={(e) => setFormData({
                            ...formData,
                            description: e.target.value
                        })}
                        error={!!errors.description}
                        helperText={errors.description}
                    />
                </Grid>
            </Grid>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button onClick={onClose} sx={{ mr: 1 }}>
                    Cancel
                </Button>
                <Button type="submit" variant="contained" color="primary">
                    Preview
                </Button>
            </Box>

            {/* Preview Dialog */}
            <Dialog open={showPreview} onClose={() => setShowPreview(false)}>
                <DialogTitle>Preview Donation</DialogTitle>
                <DialogContent>
                    <Box sx={{ p: 2 }}>
                        {type === 'ngo' ? (
                            <>
                                <Typography><strong>Category:</strong> {formData.itemCategory}</Typography>
                                {formData.itemCategory === 'others' && (
                                    <Typography><strong>Item Name:</strong> {formData.itemName}</Typography>
                                )}
                            </>
                        ) : (
                            <>
                                <Typography><strong>Waste Type:</strong> {formData.wasteType}</Typography>
                                <Typography><strong>Item Type:</strong> {formData.itemType}</Typography>
                            </>
                        )}
                        <Typography><strong>Quantity:</strong> {formData.quantity} kg</Typography>
                        <Typography><strong>Description:</strong> {formData.description}</Typography>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowPreview(false)}>Edit</Button>
                    <Button onClick={handleConfirmSubmit} variant="contained" color="primary">
                        Confirm & Submit
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default DonationForm; 