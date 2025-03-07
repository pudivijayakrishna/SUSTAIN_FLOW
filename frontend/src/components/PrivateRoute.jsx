import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/auth';

const PrivateRoute = ({ children, allowedRoles }) => {
    const { isLoggedIn, role } = useAuth();
    const adminToken = localStorage.getItem('adminToken');
    const token = localStorage.getItem('token');
    const currentPath = window.location.pathname;
    
    // Add more detailed logging
    console.log("PrivateRoute Details:", {
        currentPath,
        isLoggedIn,
        role,
        allowedRoles,
        token: !!token,
        storedRole: localStorage.getItem('role'),
        hasAccess: allowedRoles?.includes(role)
    });

    // Don't protect the About Us route
    if (currentPath === '/about') {
        return children;
    }

    // Special check for admin routes
    if (currentPath.startsWith('/admin')) {
        if (!adminToken || role !== 'admin') {
            console.log("Admin access denied, redirecting to login");
            return <Navigate to="/login" />;
        }
        return children;
    }

    // Regular route checks
    if (!isLoggedIn || (!adminToken && !token)) {
        console.log("Not logged in, redirecting to login");
        return <Navigate to="/login" />;
    }

    // if (allowedRoles && !allowedRoles.includes(role)) {
    //     console.log("Role not allowed, redirecting to home", {role, allowedRoles});
    //     return <Navigate to="/" />;
    // }

    return children;
};

export default PrivateRoute; 