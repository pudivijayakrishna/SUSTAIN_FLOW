import axios from 'axios';
import config from '../config';

const getHeaders = () => {
    const token = localStorage.getItem('token')?.replace(/"/g, '');
    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    };
};

export const agencyApi = {
    getHistory: async () => {
        const response = await axios.get(
            `${config.BACKEND_API}/agency/history`,
            { headers: getHeaders() }
        );
        return response.data;
    },

    getTransactions: async () => {
        const response = await axios.get(
            `${config.BACKEND_API}/agency`,
            { headers: getHeaders() }
        );
        return response.data;
    },

    confirmSupplies: async (data) => {
        const response = await axios.post(
            `${config.BACKEND_API}/agency/confirm-supplies`,
            data,
            { headers: getHeaders() }
        );
        return response.data;
    }
}; 