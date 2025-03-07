import mongoose from "mongoose";
import crypto from 'crypto';

const verificationDocumentSchema = new mongoose.Schema({
    data: Buffer,
    fileName: String,
    fileType: String,
    encryptionKey: String,
    iv: String,
    uploadedAt: {
        type: Date,
        default: Date.now
    }
});

const documentHistorySchema = new mongoose.Schema({
    data: Buffer,
    fileName: String,
    fileType: String,
    uploadedAt: Date,
    encryptionKey: String,
    iv: String,
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'replaced', 'deleted'],
        default: 'pending'
    },
    comment: String,
    rejectionReason: String,
    submissionNumber: Number
});

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: function() {
            return this.role === 'donor';
        }
    },
    role: {
        type: String,
        required: true,
        enum: ['donor', 'ngo', 'compostAgency', 'admin']
    },
    contact: {
        type: String,
        required: false
    },
    address: {
        type: String,
        required: false
    },
    location: {
        coordinates: {
            lat: {
                type: Number,
                required: function() {
                    // Only required after registration for NGO and CompostAgency
                    return false;
                }
            },
            lon: {
                type: Number,
                required: function() {
                    // Only required after registration for NGO and CompostAgency
                    return false;
                }
            }
        },
        address: {
            type: String,
            required: function() {
                // Only required after registration for NGO and CompostAgency
                return false;
            }
        }
    },
    description: {
        type: String,
        required: false
    },
    operatingHours: {
        type: String,
        required: function() {
            // Only require operatingHours after verification
            return (this.role === 'ngo' || this.role === 'compostAgency') && this.isVerified;
        }
    },
    wasteTypes: [{
        type: String,
        required: function() {
            // Only require wasteTypes after verification
            return this.role === 'compostAgency' && this.isVerified;
        }
    }],
    itemTypes: [{
        type: String,
        required: function() {
            // Only require itemTypes after verification
            return this.role === 'ngo' && this.isVerified;
        }
    }],
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'maxAttemptsReached'],
        default: 'pending'
    },
    verificationDocument: verificationDocumentSchema,
    documentHistory: [documentHistorySchema],
    verificationComments: [{
        comment: String,
        status: String,
        date: Date
    }],
    submissionAttempts: {
        type: Number,
        default: 0
    },
    mustChangePassword: {
        type: Boolean,
        default: false
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date
}, {
    timestamps: true
});

// Create indexes
userSchema.index({ username: 1 }, { unique: true });
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1 });
userSchema.index({ verificationStatus: 1 });

// Static method to find user by username and role
userSchema.statics.findByUsernameAndRole = async function(username, role) {
    const user = await this.findOne({ username: username.trim() });
    console.log('Find by username result:', {
        searched: { username, role },
        found: user ? {
            username: user.username,
            role: user.role,
            id: user._id
        } : null
    });
    return user;
};

// Document history middleware
userSchema.pre('save', function(next) {
    if (this.isModified('verificationDocument')) {
        // Store the current document in history before any changes
        if (this.verificationDocument) {
            console.log('Adding document to history for user:', this._id);
            
            if (!this.documentHistory) {
                this.documentHistory = [];
            }

            // Create a clean copy for history
            const historyEntry = {
                ...this.verificationDocument.toObject(),
                status: this.verificationStatus,
                submissionNumber: this.documentHistory.length + 1,
                rejectionReason: this.verificationComments?.length > 0 
                    ? this.verificationComments[this.verificationComments.length - 1].comment 
                    : null
            };
            
            this.documentHistory.push(historyEntry);
            console.log('Document history updated, total entries:', this.documentHistory.length);
        }
    }

    next();
});

// Method to decrypt document
userSchema.methods.getDecryptedDocument = function() {
    try {
        console.log('Attempting to decrypt document for user:', this._id);
        
        if (!this.verificationDocument?.data) {
            console.log('No document data found for user:', this._id);
            return null;
        }
        
        if (!this.verificationDocument.encryptionKey || !this.verificationDocument.iv) {
            console.log('Missing encryption key or IV for user:', this._id);
            return null;
        }

        // Convert hex strings back to buffers
        const key = Buffer.from(this.verificationDocument.encryptionKey, 'hex');
        const iv = Buffer.from(this.verificationDocument.iv, 'hex');

        // Ensure data is a Buffer
        const encryptedData = Buffer.isBuffer(this.verificationDocument.data) 
            ? this.verificationDocument.data 
            : Buffer.from(this.verificationDocument.data);

        console.log('Decryption parameters:', {
            keyLength: key.length,
            ivLength: iv.length,
            dataLength: encryptedData.length,
            firstBytesHex: encryptedData.slice(0, 4).toString('hex')
        });

        // Create decipher and decrypt data
        const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
        const decryptedBuffer = Buffer.concat([
            decipher.update(encryptedData),
            decipher.final()
        ]);

        console.log('Decryption successful:', {
            decryptedLength: decryptedBuffer.length,
            firstBytesHex: decryptedBuffer.slice(0, 4).toString('hex')
        });
        
        return decryptedBuffer;

    } catch (error) {
        console.error('Error decrypting document for user:', this._id, error);
        throw error;
    }
};

const User = mongoose.model('User', userSchema);
export default User;