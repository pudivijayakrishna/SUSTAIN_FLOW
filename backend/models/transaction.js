import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
    sender: {
        type: String,
        required: true
    },
    receiver: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['ngo', 'compostAgency'],
        required: true
    },
    itemCategory: {
        type: String,
        enum: ['books', 'clothes', 'surplus food', 'others'],
        required: function() { 
            return this.type === 'ngo';  // Only required for NGO
        },
        default: undefined
    },
    itemName: {
        type: String,
        required: function() { 
            return this.type === 'ngo' && this.itemCategory === 'others';
        },
        default: undefined
    },
    wasteType: {
        type: String,
        enum: ['food', 'e-waste'],
        required: function() { 
            return this.type === 'compostAgency';
        },
        default: undefined
    },
    itemType: {
        type: String,
        required: function() { 
            return this.type === 'compostAgency';
        },
        default: undefined
    },
    quantity: {
        type: Number,
        required: true,
        min: 0,
        validate: {
            validator: function(v) {
                if (this.type === 'ngo' && this.itemCategory === 'books') {
                    return v >= 1;
                }
                return v > 0;
            },
            message: props => `${props.value} is not a valid quantity!`
        }
    },
    description: {
        type: String,
        required: true,
        maxLength: 300,
        default: function() {
            return `Donation of ${this.quantity}kg ${this.wasteType || this.itemType || 'items'}`;
        }
    },
    points: {
        type: Number,
        required: true,
        min: 0,
        default: function() {
            // Default points calculation
            const basePoints = this.type === 'compostAgency' ? 10 : 15;
            return Math.floor(this.quantity * basePoints);
        }
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        required: true,
        default: 'pending'
    },
    date: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Add virtual field for formatted date
transactionSchema.virtual('formattedDate').get(function() {
    return this.createdAt.toLocaleDateString();
});

// Add indexes for better query performance
transactionSchema.index({ sender: 1, status: 1 });
transactionSchema.index({ receiver: 1, status: 1 });
transactionSchema.index({ type: 1 });
transactionSchema.index({ date: -1 });
transactionSchema.index({ createdAt: -1 });

const Transaction = mongoose.model('Transaction', transactionSchema);
export default Transaction;