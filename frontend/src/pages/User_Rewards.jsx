import React, { useState, useEffect } from 'react';
import { 
    Typography, 
    Card, 
    CardContent,
    Grid,
    Button,
    Divider,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Alert
} from '@mui/material';
import axios from 'axios';
import config from '../config.js';

const User_Rewards = () => {
    const [rewards, setRewards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openModal, setOpenModal] = useState(false);
    const [selectedReward, setSelectedReward] = useState(null);
    const [redeemPoints, setRedeemPoints] = useState('');
    const [error, setError] = useState('');
    const [remainingPoints, setRemainingPoints] = useState(0);

    const fetchRewards = async () => {
        try {
            const headers = {
                "Content-Type": "application/json",
                Authorization: `Bearer ${window.localStorage.getItem("token")}`
            };

            const response = await axios.get(
                `${config.BACKEND_API}/donor/reward-store`,
                { headers }
            );

            setRewards(response.data.userRewards);
        } catch (error) {
            console.error('Error fetching rewards:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRewards();
    }, []);

    const handleOpenRedeemModal = (reward) => {
        setSelectedReward(reward);
        setRedeemPoints('');
        setError('');
        setRemainingPoints(reward.userPoints);
        setOpenModal(true);
    };

    const handleCloseRedeemModal = () => {
        setOpenModal(false);
        setSelectedReward(null);
        setRedeemPoints('');
        setError('');
    };

    const handlePointsChange = (e) => {
        const value = e.target.value;
        
        // Only allow numbers
        if (!/^\d*$/.test(value)) {
            return;
        }

        setRedeemPoints(value);

        if (!value) {
            setError('');
            setRemainingPoints(selectedReward?.userPoints || 0);
            return;
        }

        const points = parseInt(value);
        
        if (points <= 0) {
            setError('Points must be greater than 0');
            setRemainingPoints(selectedReward?.userPoints || 0);
        } else if (points > selectedReward?.userPoints) {
            setError('Insufficient points available');
            setRemainingPoints(selectedReward?.userPoints - points);
        } else {
            setError('');
            setRemainingPoints(selectedReward?.userPoints - points);
        }
    };

    const handleRedeem = async () => {
        if (!selectedReward || !redeemPoints) return;

        const points = parseInt(redeemPoints);
        if (points <= 0 || points > selectedReward.userPoints) {
            setError('Invalid points amount');
            return;
        }

        try {
            const headers = {
                "Content-Type": "application/json",
                Authorization: `Bearer ${window.localStorage.getItem("token")}`
            };

            await axios.post(
                `${config.BACKEND_API}/donor/redeem-reward`,
                {
                    username: selectedReward.username,
                    reward: {
                        name: "Points Redemption",
                        point: points
                    }
                },
                { headers }
            );

            alert("Points redeemed successfully!");
            handleCloseRedeemModal();
            fetchRewards();
        } catch (error) {
            console.error('Error redeeming points:', error);
            setError(error.response?.data?.error || "Failed to redeem points");
        }
    };

    if (loading) {
        return <Typography>Loading...</Typography>;
    }

    return (
        <div style={{ padding: '2em' }}>
            <Typography variant="h4" gutterBottom align="center">
                My Rewards
            </Typography>

            <Grid container spacing={3}>
                {rewards.map((reward, index) => (
                    <Grid item xs={12} key={index}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6">
                                    {reward.name} ({reward.role === 'ngo' ? 'NGO' : 'Compost Agency'})
                                </Typography>
                                <Typography variant="h5" color="primary">
                                    Available Points: {reward.userPoints}
                                </Typography>
                                <Divider sx={{ my: 2 }} />
                                <Grid container spacing={2} alignItems="center">
                                    <Grid item xs={8}>
                                        <Typography>
                                            You can redeem these points for rewards
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={4}>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            fullWidth
                                            onClick={() => handleOpenRedeemModal(reward)}
                                            disabled={reward.userPoints <= 0}
                                        >
                                            Redeem Points
                                        </Button>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Redemption Modal */}
            <Dialog open={openModal} onClose={handleCloseRedeemModal} maxWidth="sm" fullWidth>
                <DialogTitle>Redeem Points</DialogTitle>
                <DialogContent>
                    <Typography gutterBottom>
                        Available Points: {selectedReward?.userPoints || 0}
                    </Typography>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Points to Redeem"
                        type="text"
                        fullWidth
                        value={redeemPoints}
                        onChange={handlePointsChange}
                        error={!!error}
                        helperText={error}
                    />
                    <Typography 
                        color={remainingPoints < 0 ? "error" : "primary"} 
                        sx={{ mt: 2 }}
                    >
                        Remaining Points: {remainingPoints}
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseRedeemModal} color="primary">
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleRedeem} 
                        color="primary"
                        disabled={!!error || !redeemPoints || parseInt(redeemPoints) <= 0}
                    >
                        Redeem
                    </Button>
                </DialogActions>
            </Dialog>

            {rewards.length === 0 && (
                <Typography variant="h6" align="center" sx={{ mt: 4 }}>
                    No rewards available. Start donating to earn points!
                </Typography>
            )}
        </div>
    );
};

export default User_Rewards;
