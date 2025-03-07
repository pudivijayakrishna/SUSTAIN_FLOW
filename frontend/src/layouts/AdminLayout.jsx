import React from 'react';
import { Box } from '@mui/material';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';

const AdminLayout = ({ children }) => {
    return (
        <Box sx={{ display: 'flex' }}>
            <AdminSidebar />
            <Box sx={{ flexGrow: 1 }}>
                <AdminHeader />
                <Box sx={{ p: 3 }}>
                    {children}
                </Box>
            </Box>
        </Box>
    );
};

export default AdminLayout; 