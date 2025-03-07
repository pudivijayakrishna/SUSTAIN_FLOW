import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Grid,
    CircularProgress,
    Alert,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import config from '../config';

const RewardList = () => {
    const [rewards, setRewards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingReward, setEditingReward] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        pointsRequired: ''
    });

    const fetchRewards = async () => {
        try {
            const response = await axios.get(
                `${config.BACKEND_API}/agency/rewards`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            setRewards(response.data.rewards || []);
        } catch (error) {
            console.error('Error fetching rewards:', error);
            setError('Failed to fetch rewards');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRewards();
    }, []);

    const handleOpenDialog = (reward = null) => {
        if (reward) {
            setEditingReward(reward);
            setFormData({
                name: reward.name,
                description: reward.description,
                pointsRequired: reward.pointsRequired
            });
        } else {
            setEditingReward(null);
            setFormData({
                name: '',
                description: '',
                pointsRequired: ''
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingReward(null);
        setFormData({
            name: '',
            description: '',
            pointsRequired: ''
        });
    };

    const handleSubmit = async () => {
        try {
            const endpoint = editingReward 
                ? `${config.BACKEND_API}/agency/rewards/${editingReward._id}`
                : `${config.BACKEND_API}/agency/rewards`;
            
            const method = editingReward ? 'put' : 'post';

            await axios[method](
                endpoint,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );

            handleCloseDialog();
            fetchRewards();
        } catch (error) {
            console.error('Error saving reward:', error);
            setError('Failed to save reward');
        }
    };

    const handleDelete = async (rewardId) => {
        try {
            await axios.delete(
                `${config.BACKEND_API}/agency/rewards/${rewardId}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            fetchRewards();
        } catch (error) {
            console.error('Error deleting reward:', error);
            setError('Failed to delete reward');
        }
    };

    if (loading) return <CircularProgress />;
    if (error) return <Alert severity="error">{error}</Alert>;

    return (
        <Box>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Rewards Management</Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                >
                    Add Reward
                </Button>
            </Box>

            <Grid container spacing={3}>
                {rewards.map((reward) => (
                    <Grid item xs={12} sm={6} md={4} key={reward._id}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    {reward.name}
                                </Typography>
                                <Typography color="textSecondary" gutterBottom>
                                    Points Required: {reward.pointsRequired}
                                </Typography>
                                <Typography variant="body2">
                                    {reward.description}
                                </Typography>
                                <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                                    <Button
                                        size="small"
                                        startIcon={<EditIcon />}
                                        onClick={() => handleOpenDialog(reward)}
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        size="small"
                                        color="error"
                                        startIcon={<DeleteIcon />}
                                        onClick={() => handleDelete(reward._id)}
                                    >
                                        Delete
                                    </Button>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle>
                    {editingReward ? 'Edit Reward' : 'Add New Reward'}
                </DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Reward Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        margin="normal"
                    />
                    <TextField
                        fullWidth
                        label="Description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        margin="normal"
                        multiline
                        rows={3}
                    />
                    <TextField
                        fullWidth
                        label="Points Required"
                        type="number"
                        value={formData.pointsRequired}
                        onChange={(e) => setFormData({ ...formData, pointsRequired: e.target.value })}
                        margin="normal"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained" color="primary">
                        {editingReward ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default RewardList; 