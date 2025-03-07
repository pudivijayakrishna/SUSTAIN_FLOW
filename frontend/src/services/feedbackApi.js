import axios from 'axios';
import config from '../config';

const BASE_URL = `${config.BACKEND_API}/allfeedbacks`;

const feedbackApi = {
    getAllFeedbacks: async () => {
        try {
            const response = await axios.get(`${BASE_URL}/all`);
            console.log('Feedback API Response:', response.data); // Debug log
            return response.data;
        } catch (error) {
            console.error('Feedback API Error:', error);
            throw error;
        }
    },

    addFeedback: async (feedbackData) => {
        try {
            const response = await axios.post(`${BASE_URL}/add`, feedbackData);
            return response.data;
        } catch (error) {
            console.error('Error adding feedback:', error);
            throw error;
        }
    }
};

export default feedbackApi;  // Changed to default export
