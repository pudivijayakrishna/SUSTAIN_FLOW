import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
    const [adminState, setAdminState] = useState({
        isAuthenticated: false,
        user: null,
        loading: true
    });
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (token) {
            setAdminState({
                isAuthenticated: true,
                user: { role: 'admin' },
                loading: false
            });
        } else {
            setAdminState(prev => ({ ...prev, loading: false }));
        }
    }, []);

    const login = (userData, token) => {
        localStorage.setItem('adminToken', token);
        setAdminState({
            isAuthenticated: true,
            user: userData,
            loading: false
        });
        navigate('/admin/dashboard');
    };

    const logout = () => {
        localStorage.removeItem('adminToken');
        setAdminState({
            isAuthenticated: false,
            user: null,
            loading: false
        });
        navigate('/login');
    };

    if (adminState.loading) {
        return <div>Loading...</div>;
    }

    return (
        <AdminContext.Provider value={{ adminState, login, logout }}>
            {children}
        </AdminContext.Provider>
    );
};

export const useAdmin = () => {
    const context = useContext(AdminContext);
    if (!context) {
        throw new Error('useAdmin must be used within an AdminProvider');
    }
    return context;
}; 