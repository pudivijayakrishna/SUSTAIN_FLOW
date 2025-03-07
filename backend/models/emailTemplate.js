import mongoose from 'mongoose';

const emailTemplateSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        enum: [
            'userBlock',
            'userUnblock',
            'verificationApproved',
            'verificationRejected',
            'documentRequest',
            'bulkAction',
            'accountDeletion'
        ]
    },
    subject: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    },
    variables: [{
        type: String,
        required: true
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    lastModifiedBy: {
        type: String,
        required: true
    },
    lastModifiedAt: {
        type: Date,
        default: Date.now
    },
    version: {
        type: Number,
        default: 1
    }
}, {
    timestamps: true
});

// Add indexes for better query performance
emailTemplateSchema.index({ name: 1 }, { unique: true });
emailTemplateSchema.index({ isActive: 1 });
emailTemplateSchema.index({ lastModifiedAt: -1 });

// Add method to get template with variables replaced
emailTemplateSchema.methods.getCompiledTemplate = function(variables) {
    let compiledBody = this.body;
    
    // Replace each variable in the template
    Object.keys(variables).forEach(key => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        compiledBody = compiledBody.replace(regex, variables[key]);
    });
    
    return {
        subject: this.subject,
        body: compiledBody
    };
};

// Add method to validate required variables
emailTemplateSchema.methods.validateVariables = function(variables) {
    const missingVariables = this.variables.filter(v => !variables.hasOwnProperty(v));
    if (missingVariables.length > 0) {
        throw new Error(`Missing required variables: ${missingVariables.join(', ')}`);
    }
    return true;
};

// Add static method to get default templates
emailTemplateSchema.statics.getDefaultTemplates = function() {
    return [
        {
            name: 'userBlock',
            subject: 'Your Account Has Been Blocked',
            body: `Dear {{username}},

We regret to inform you that your account has been blocked due to {{reason}}.

If you believe this is a mistake, please contact our support team.

Best regards,
Admin Team`,
            variables: ['username', 'reason']
        },
        {
            name: 'userUnblock',
            subject: 'Your Account Has Been Unblocked',
            body: `Dear {{username}},

Your account has been unblocked. You can now access all features of our platform.

Best regards,
Admin Team`,
            variables: ['username']
        },
        {
            name: 'verificationApproved',
            subject: 'Account Verification Approved',
            body: `Dear {{username}},

Congratulations! Your account verification has been approved.

Best regards,
Admin Team`,
            variables: ['username']
        },
        {
            name: 'verificationRejected',
            subject: 'Account Verification Rejected',
            body: `Dear {{username}},

Your account verification has been rejected for the following reason:
{{reason}}

Please address these concerns and submit your verification again.

Best regards,
Admin Team`,
            variables: ['username', 'reason']
        },
        {
            name: 'documentRequest',
            subject: 'Additional Documents Required',
            body: `Dear {{username}},

Please provide the following additional documents:
{{documentList}}

Best regards,
Admin Team`,
            variables: ['username', 'documentList']
        },
        {
            name: 'bulkAction',
            subject: '{{actionType}} Notice',
            body: `Dear {{username}},

This is to inform you that your account has been affected by a bulk {{actionType}} action.
{{details}}

Best regards,
Admin Team`,
            variables: ['username', 'actionType', 'details']
        },
        {
            name: 'accountDeletion',
            subject: 'Account Deletion Notice',
            body: `Dear {{username}},

Your account has been scheduled for deletion. This action will be completed in 30 days.
Reason: {{reason}}

If you wish to cancel this action, please contact support immediately.

Best regards,
Admin Team`,
            variables: ['username', 'reason']
        }
    ];
};

// Add pre-save middleware to update version
emailTemplateSchema.pre('save', function(next) {
    if (this.isModified('body') || this.isModified('subject')) {
        this.version += 1;
    }
    next();
});

const EmailTemplate = mongoose.model('EmailTemplate', emailTemplateSchema);

// Initialize default templates if none exist
EmailTemplate.countDocuments().then(count => {
    if (count === 0) {
        EmailTemplate.getDefaultTemplates().forEach(template => {
            new EmailTemplate({
                ...template,
                lastModifiedBy: 'system'
            }).save();
        });
    }
});

export default EmailTemplate;