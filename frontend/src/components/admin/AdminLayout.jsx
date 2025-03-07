import React from 'react';
import { Box, Drawer, List, ListItem, ListItemIcon, ListItemText, Typography, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/auth';
import {
    Dashboard as DashboardIcon,
    People as UsersIcon,
    VerifiedUser as VerificationIcon,
    LocalShipping as PickupIcon,
    Logout as LogoutIcon
} from '@mui/icons-material';

const drawerWidth = 240;

const AdminLayout = ({ children }) => {
    const navigate = useNavigate();
    const { LogOut } = useAuth();

    const menuItems = [
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin/dashboard' },
        { text: 'Users', icon: <UsersIcon />, path: '/admin/users' },
        { text: 'Verifications', icon: <VerificationIcon />, path: '/admin/verifications' },
        { text: 'Pickup & Feedback', icon: <PickupIcon />, path: '/admin/pickup-feedback' }
    ];

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        LogOut();
        navigate('/login');
    };

    return (
        <Box sx={{ display: 'flex' }}>
            <Drawer
                variant="permanent"
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: drawerWidth,
                        boxSizing: 'border-box',
                        backgroundColor: '#25396F',
                        color: 'white'
                    },
                }}
            >
                <Box sx={{ p: 2 }}>
                    <Typography variant="h6" sx={{ color: 'white' }}>
                        Admin Panel
                    </Typography>
                </Box>
                <List>
                    {menuItems.map((item) => (
                        <ListItem
                            button
                            key={item.text}
                            onClick={() => navigate(item.path)}
                            sx={{
                                '&:hover': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.1)'
                                }
                            }}
                        >
                            <ListItemIcon sx={{ color: 'white' }}>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText primary={item.text} />
                        </ListItem>
                    ))}
                    <ListItem
                        button
                        onClick={handleLogout}
                        sx={{
                            marginTop: 'auto',
                            '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.1)'
                            }
                        }}
                    >
                        <ListItemIcon sx={{ color: 'white' }}>
                            <LogoutIcon />
                        </ListItemIcon>
                        <ListItemText primary="Logout" />
                    </ListItem>
                </List>
            </Drawer>
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    backgroundColor: '#f5f5f5',
                    minHeight: '100vh'
                }}
            >
                {children}
            </Box>
        </Box>
    );
};

export default AdminLayout;