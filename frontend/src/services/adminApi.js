import axios from 'axios';
import config from '../config';

const getAdminHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
});

export const adminApi = {
    login: async (credentials) => {
        try {
            console.log('Attempting admin login...');
            const response = await axios.post(
                `${config.BACKEND_API}/admin/login`,
                credentials
            );
            
            if (response.data.success) {
                return {
                    success: true,
                    token: response.data.token,
                    role: response.data.role,
                    username: response.data.username
                };
            }
            throw new Error(response.data.error || 'Login failed');
        } catch (error) {
            console.error('Admin login error:', error);
            throw error;
        }
    },

    getUsers: async (filters = {}) => {
        try {
            const response = await axios.get(
                `${config.BACKEND_API}/admin/users`,
                {
                    headers: getAdminHeaders(),
                    params: filters
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching users:', error);
            throw error;
        }
    },

    getUserDetails: async (userId) => {
        try {
            const response = await axios.get(
                `${config.BACKEND_API}/admin/users/${userId}`,
                { headers: getAdminHeaders() }
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching user details:', error);
            throw error;
        }
    },

    toggleUserBlock: async (userId, { blocked, reason }) => {
        try {
            const response = await axios.post(
                `${config.BACKEND_API}/admin/users/${userId}/block`,
                { blocked, reason },
                { headers: getAdminHeaders() }
            );
            return response.data;
        } catch (error) {
            console.error('Error toggling user block status:', error);
            throw error;
        }
    },

    deleteUser: async (userId) => {
        try {
            const response = await axios.delete(
                `${config.BACKEND_API}/admin/users/${userId}`,
                { headers: getAdminHeaders() }
            );
            return response.data;
        } catch (error) {
            console.error('Error deleting user:', error);
            throw error;
        }
    },

    updateUser: async (userId, userData) => {
        try {
            const response = await axios.put(
                `${config.BACKEND_API}/admin/users/${userId}`,
                userData,
                { headers: getAdminHeaders() }
            );
            return response.data;
        } catch (error) {
            console.error('Error updating user:', error);
            throw error.response?.data || error;
        }
    },

    getDashboardStats: async (timeRange = 'all') => {
        try {
            const response = await axios.get(
                `${config.BACKEND_API}/admin/dashboard/stats`,
                {
                    headers: getAdminHeaders(),
                    params: { timeRange }
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            throw error;
        }
    },

    getWasteDetails: async () => {
        try {
            const response = await axios.get(
                `${config.BACKEND_API}/admin/waste-details`,
                { headers: getAdminHeaders() }
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching waste details:', error);
            throw error;
        }
    },

    getDonationDetails: async () => {
        try {
            const response = await axios.get(
                `${config.BACKEND_API}/admin/donation-details`,
                { headers: getAdminHeaders() }
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching donation details:', error);
            throw error;
        }
    },

    getTransactionDetails: async () => {
        try {
            const response = await axios.get(
                `${config.BACKEND_API}/admin/transaction-details`,
                { headers: getAdminHeaders() }
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching transaction details:', error);
            throw error;
        }
    },

    getPickups: async () => {
        try {
            const response = await axios.get(
                `${config.BACKEND_API}/admin/pickups`,
                { headers: getAdminHeaders() }
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching pickups:', error);
            throw error;
        }
    },

    getFeedback: async () => {
        try {
            const response = await axios.get(
                `${config.BACKEND_API}/admin/feedback`,
                { headers: getAdminHeaders() }
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching feedback:', error);
            throw error;
        }
    },

    deleteFeedback: async (id) => {
        try {
            const response = await axios.delete(
                `${config.BACKEND_API}/admin/feedback/${id}`,
                { headers: getAdminHeaders() }
            );
            return response.data;
        } catch (error) {
            console.error('Error deleting feedback:', error);
            throw error;
        }
    },

    replyToFeedback: async (id, data) => {
        try {
            const response = await axios.post(
                `${config.BACKEND_API}/admin/feedback/${id}/reply`,
                data,
                { headers: getAdminHeaders() }
            );
            return response.data;
        } catch (error) {
            console.error('Error replying to feedback:', error);
            throw error;
        }
    },

    // Verification related endpoints
    getPendingVerifications: async () => {
        try {
            console.log('Fetching pending verifications...');
            const response = await axios.get(
                `${config.BACKEND_API}/admin/verifications/pending`,
                { headers: getAdminHeaders() }
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching pending verifications:', error);
            throw error;
        }
    },

    getRejectedVerifications: async () => {
        try {
            console.log('Fetching rejected verifications...');
            const response = await axios.get(
                `${config.BACKEND_API}/admin/verifications/rejected`,
                { headers: getAdminHeaders() }
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching rejected verifications:', error);
            throw error;
        }
    },

    getVerificationStats: async () => {
        try {
            console.log('Fetching verification stats...');
            const response = await axios.get(
                `${config.BACKEND_API}/admin/verifications/stats`,
                { headers: getAdminHeaders() }
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching verification stats:', error);
            throw error;
        }
    },

    verifyDocument: async (userId, { status, comments }) => {
        try {
            console.log('Submitting verification decision...', { userId, status, comments });
            const response = await axios.post(
                `${config.BACKEND_API}/admin/verify-document`,
                { userId, status, comments },
                { headers: getAdminHeaders() }
            );
            return response.data;
        } catch (error) {
            console.error('Error submitting verification:', error);
            throw error;
        }
    },

    decryptDocument: async (userId) => {
        try {
            console.log('Requesting document decryption...', userId);
            const response = await axios.post(
                `${config.BACKEND_API}/admin/decrypt-document`,
                { userId },
                { headers: getAdminHeaders() }
            );
            return response.data;
        } catch (error) {
            console.error('Error decrypting document:', error);
            throw error;
        }
    }
}; 