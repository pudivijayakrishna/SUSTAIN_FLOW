import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import fileUpload from 'express-fileupload';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import donorRoutes from './routes/donor.js';
import agencyRoutes from './routes/agency.js';
import ngoRoutes from './routes/ngo.js';
import notificationRoutes from './routes/notification.js';
import pickupRoutes from './routes/pickup.js';
import feedbackRoutes from './routes/feedback.js';
import apiRoutes from './routes/api.js';
import testRoutes from './routes/testRoutes.js';
import allfeedbacksRoutes from './routes/allfeedbacks.js';

// Import models in order
import './models/user.js';  // First import User model
import './models/pickup.js';  // Then import Pickup model which references User

dotenv.config();

const app = express();

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(fileUpload({
    limits: { 
        fileSize: 50 * 1024 * 1024,  // 50MB max file size
        files: 1
    },
    useTempFiles: false,
    abortOnLimit: true,
    responseOnLimit: 'File size is too large',
    debug: process.env.NODE_ENV === 'development',
    safeFileNames: true,
    preserveExtension: true,
    createParentPath: true,
    parseNested: true,
    uploadTimeout: 60000, // 60 seconds timeout
    routeHandler: function(req, res, next) {
        if (req.path.includes('/upload') || req.path.includes('/document')) {
            if (!req.files && !req.body.data) {
                return res.status(400).json({
                    success: false,
                    message: 'No files were uploaded'
                });
            }
        }
        next();
    }
}));

// Routes
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/donor', donorRoutes);
app.use('/agency', agencyRoutes);
app.use('/ngo', ngoRoutes);
app.use('/notifications', notificationRoutes);
app.use('/api/pickup', pickupRoutes);
app.use('/feedback', feedbackRoutes);
app.use('/test', testRoutes);
app.use('/', apiRoutes);
app.use('/allfeedbacks', allfeedbacksRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        success: false, 
        error: 'Something broke!',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Add error handling middleware for file upload
app.use((err, req, res, next) => {
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
            error: 'File too large',
            details: 'Maximum file size is 50MB'
        });
    }
    next(err);
});

// Add a basic route handler for the root path
app.get('/', (req, res) => {
    res.json({ message: 'Server is running' });
});

// Database connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 60000, // Increase from 5000 to 60000
    socketTimeoutMS: 60000,
    connectTimeoutMS: 60000,
    maxPoolSize: 10,
    minPoolSize: 5,
    maxIdleTimeMS: 30000,
    retryWrites: true,
    w: 'majority'
})
.then(() => {
    console.log('Connected to MongoDB Atlas');
})
.catch((error) => {
    console.error('MongoDB connection error:', error);
});

mongoose.connection.on('connected', async () => {
    console.log('MongoDB connected successfully');
    try {
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Available collections:', collections.map(c => c.name));
        
        // Check users collection
        const User = mongoose.model('User');
        const userCount = await User.countDocuments();
        console.log('Total users in database:', userCount);
    } catch (error) {
        console.error('Error checking database:', error);
    }
});

// Start server
const startServer = async (retryCount = 0) => {
    const basePort = parseInt(process.env.PORT) || 8000;
    const PORT = basePort + retryCount;
    
    try {
        await new Promise((resolve, reject) => {
            const server = app.listen(PORT, () => {
                console.log(`Server is running on port ${PORT}`);
                resolve();
            }).on('error', (err) => {
                if (err.code === 'EADDRINUSE' && retryCount < 10) {
                    console.log(`Port ${PORT} is in use, trying port ${PORT + 1}`);
                    server.close();
                    startServer(retryCount + 1);
                } else {
                    reject(err);
                }
            });
        });
    } catch (error) {
        console.error('Failed to start server:', error);
    }
};

startServer();

export default app;
