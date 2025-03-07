// config/mongoose.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_URI;
        
        if (!uri) {
            throw new Error('MongoDB URI not found in environment variables');
        }

        // Add connection state logging
        console.log('Attempting to connect to MongoDB...');
        console.log('Current connection state:', mongoose.connection.readyState);
        
        // Enhanced connection options with longer timeouts
        const options = {
            serverSelectionTimeoutMS: 60000, // 1 minute
            socketTimeoutMS: 90000, // 1.5 minutes
            maxPoolSize: 50,
            wtimeoutMS: 60000,
            family: 4,
            retryWrites: true,
            w: 'majority',
            useNewUrlParser: true,
            useUnifiedTopology: true,
            autoIndex: true,
            connectTimeoutMS: 60000,
            heartbeatFrequencyMS: 30000,
            minPoolSize: 5,
            maxIdleTimeMS: 30000,
            serverSelectionTimeoutMS: 60000,
            keepAlive: true,
            keepAliveInitialDelay: 300000
        };

        // Connect with debug logging
        await mongoose.connect(uri, options);
        console.log('MongoDB connected successfully');
        console.log('New connection state:', mongoose.connection.readyState);

        // Connection event handlers
        mongoose.connection.on('connected', () => {
            console.log('Mongoose connected to MongoDB');
        });

        mongoose.connection.on('error', (err) => {
            console.error('Mongoose connection error:', err);
            // Try to reconnect on error
            setTimeout(() => {
                mongoose.connect(uri, options).catch(err => {
                    console.error('Reconnection failed:', err);
                });
            }, 5000);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('Mongoose disconnected from MongoDB');
            // Try to reconnect on disconnection
            setTimeout(() => {
                mongoose.connect(uri, options).catch(err => {
                    console.error('Reconnection failed:', err);
                });
            }, 5000);
        });

        // Handle process termination
        process.on('SIGINT', async () => {
            try {
                await mongoose.connection.close();
                console.log('MongoDB connection closed through app termination');
                process.exit(0);
            } catch (err) {
                console.error('Error closing MongoDB connection:', err);
                process.exit(1);
            }
        });

    } catch (error) {
        console.error('MongoDB connection error:', error);
        // Try to reconnect on initial connection failure
        console.log('Attempting to reconnect in 5 seconds...');
        setTimeout(() => {
            connectDB().catch(err => {
                console.error('Reconnection failed:', err);
            });
        }, 5000);
    }
};

export default connectDB;
