import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from '../models/user.js';
import dotenv from 'dotenv';

dotenv.config();

const resetPassword = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Find the user
        const user = await User.findOne({ username: 'agency3', role: 'compostAgency' });
        if (!user) {
            console.log('User not found');
            process.exit(1);
        }

        // Hash and set the default password
        const defaultPassword = 'user@1234';
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);
        
        // Update user
        user.password = hashedPassword;
        user.mustChangePassword = true;
        await user.save();

        console.log('Password reset successful');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

resetPassword();
