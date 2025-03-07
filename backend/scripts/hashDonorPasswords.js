import User from '../models/user.js';
import bcrypt from 'bcrypt';
import connectDB from '../config/mongoose.js';
import dotenv from 'dotenv';

dotenv.config();

const migrateDonorPasswords = async () => {
    try {
        console.log('Connecting to database...');
        await connectDB();
        
        // Find all donors with unhashed passwords
        const donors = await User.find({ role: 'donor' });
        console.log(`Found ${donors.length} donors`);
        
        let updatedCount = 0;
        for (const donor of donors) {
            // Check if password is not already hashed
            if (!donor.password.startsWith('$2b$')) {
                console.log(`Processing donor: ${donor.username}`);
                const hashedPassword = await bcrypt.hash(donor.password, 10);
                donor.password = hashedPassword;
                await donor.save();
                updatedCount++;
                console.log(`Updated password for donor: ${donor.username}`);
            }
        }
        
        console.log(`Migration completed successfully. Updated ${updatedCount} donors.`);
        process.exit(0);
    } catch (error) {
        console.error('Migration error:', error);
        process.exit(1);
    }
};

migrateDonorPasswords(); 