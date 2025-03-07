import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Button, Grid, TextField } from '@mui/material';
import axios from 'axios';
import config from '../config.js';
import Notification from '../components/Notification';

const Store = () => {
  const [storeItems, setStoreItems] = useState([]);
  const [filter, setFilter] = useState('');
  const [notification, setNotification] = useState({ open: false, message: '', severity: '' });

  useEffect(() => {
    const fetchStoreItems = async () => {
      try {
        const headers = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${window.localStorage.getItem("token")}`,
        };
        const response = await axios.get((config.BACKEND_API || "http://localhost:8000") + "/store", { headers });
        setStoreItems(response.data.items); // Assuming backend sends list of items in `items` field
      } catch (err) {
        console.error('Failed to fetch store items', err);
      }
    };
    fetchStoreItems();
  }, []);

  const handleRedeem = (item) => {
    // Trigger redeem action, backend endpoint should handle redemption
    // Assuming `item` has a `rewardId` or similar unique identifier
    axios.post((config.BACKEND_API || "http://localhost:8000") + "/redeem", { rewardId: item.id })
      .then(response => {
        setNotification({ open: true, message: 'Reward redeemed successfully!', severity: 'success' });
      })
      .catch(error => {
        setNotification({ open: true, message: 'Failed to redeem reward', severity: 'error' });
      });
  };

  const handleCloseNotification = () => {
    setNotification({ open: false, message: '', severity: '' });
  };

  const filteredItems = storeItems.filter(item =>
    item.name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div style={{ margin: '20px' }}>
      <TextField
        label="Search Rewards"
        variant="outlined"
        fullWidth
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />
      <Grid container spacing={3} style={{ marginTop: '20px' }}>
        {filteredItems.map((item, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card>
              <CardContent>
                <Typography variant="h5" component="div">{item.name}</Typography>
                <Typography color="textSecondary">Points: {item.points}</Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleRedeem(item)}
                >
                  Redeem
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Notification
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        handleClose={handleCloseNotification}
      />
    </div>
  );
};

export default Store;
