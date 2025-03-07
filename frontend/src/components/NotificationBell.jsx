import React, { useState, useEffect } from 'react';
import { 
    Badge, 
    IconButton, 
    Menu, 
    MenuItem, 
    Typography,
    Box,
    Divider,
    Button
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import DeleteIcon from '@mui/icons-material/Delete';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import StarIcon from '@mui/icons-material/Star';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import config from '../config';

const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [anchorEl, setAnchorEl] = useState(null);
    const navigate = useNavigate();
    
    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            // Use the common notifications endpoint
            const response = await axios.get(
                `${config.BACKEND_API}/notifications`, 
                {
                    headers: { 
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data && Array.isArray(response.data.notifications)) {
                setNotifications(response.data.notifications);
            } else {
                console.error('Invalid notifications format:', response.data);
                setNotifications([]);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
            setNotifications([]);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 10000);
        return () => clearInterval(interval);
    }, []);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleNotificationClick = async (notification) => {
        try {
            await axios.put(
                `${config.BACKEND_API}/notifications/${notification._id}/read`,
                {},
                {
                    headers: { 
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            // Remove from list
            setNotifications(prev => 
                prev.filter(n => n._id !== notification._id)
            );

            // Navigate if link exists
            if (notification.link) {
                navigate(notification.link);
            }

            handleClose();
        } catch (error) {
            console.error('Error handling notification:', error);
        }
    };

    const clearReadNotifications = async () => {
        try {
            const response = await axios.delete(
                `${config.BACKEND_API}/notifications/clear-read`,
                {
                    headers: { 
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data.success) {
                // Remove all read notifications from state
                setNotifications(prev => prev.filter(n => !n.read));
                console.log(`Cleared ${response.data.deletedCount} notifications`);
            }
        } catch (error) {
            console.error('Error clearing notifications:', error);
        }
    };

    const handleDeleteNotification = async (event, notificationId) => {
        event.stopPropagation();
        try {
            await axios.delete(
                `${config.BACKEND_API}/notifications/${notificationId}`,
                {
                    headers: { 
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            // Remove from local state
            setNotifications(prev => 
                prev.filter(n => n._id !== notificationId)
            );
        } catch (error) {
            console.error('Error deleting notification:', error);
            // Optionally show error notification to user
            // setError('Failed to delete notification');
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'pickup':
                return <LocalShippingIcon fontSize="small" />;
            case 'points':
                return <StarIcon fontSize="small" />;
            case 'reward':
                return <CardGiftcardIcon fontSize="small" />;
            default:
                return <NotificationsIcon fontSize="small" />;
        }
    };

    const getNotificationColor = (priority) => {
        switch (priority) {
            case 'high':
                return 'error.main';
            case 'medium':
                return 'warning.main';
            default:
                return 'info.main';
        }
    };

    return (
        <Box>
            <IconButton onClick={handleClick} color="inherit">
                <Badge 
                    badgeContent={notifications.filter(n => !n.read).length} 
                    color="error"
                >
                    <NotificationsIcon />
                </Badge>
            </IconButton>
            
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                PaperProps={{
                    style: {
                        maxHeight: 400,
                        width: 320,
                    }
                }}
            >
                <Box sx={{ p: 2 }}>
                    <Typography variant="h6">
                        Notifications
                    </Typography>
                </Box>
                <Divider />
                
                {notifications.length === 0 ? (
                    <MenuItem disabled>
                        No new notifications
                    </MenuItem>
                ) : (
                    <>
                        {notifications.map((notification) => (
                            <MenuItem 
                                key={notification._id}
                                onClick={() => handleNotificationClick(notification)}
                                sx={{ 
                                    whiteSpace: 'normal',
                                    py: 1.5,
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-start',
                                    borderLeft: 3,
                                    borderColor: getNotificationColor(notification.priority)
                                }}
                            >
                                <Box sx={{ mr: 1 }}>
                                    {getNotificationIcon(notification.type)}
                                </Box>
                                <Box sx={{ flex: 1, mr: 2 }}>
                                    <Typography variant="subtitle2">
                                        {notification.title}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {notification.message}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {new Date(notification.createdAt).toLocaleString()}
                                    </Typography>
                                </Box>
                                <IconButton 
                                    size="small"
                                    onClick={(e) => handleDeleteNotification(e, notification._id)}
                                    sx={{ 
                                        mt: -0.5, 
                                        '&:hover': { 
                                            color: 'error.main' 
                                        } 
                                    }}
                                >
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            </MenuItem>
                        ))}
                        <Divider />
                        <Box sx={{ p: 1, display: 'flex', justifyContent: 'center' }}>
                            <Button 
                                size="small"
                                onClick={clearReadNotifications}
                            >
                                Clear All Read
                            </Button>
                        </Box>
                    </>
                )}
            </Menu>
        </Box>
    );
};

export default NotificationBell;