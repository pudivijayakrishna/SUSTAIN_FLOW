import { authenticateToken } from '../config/authMiddleware.js';
import { upload } from '../config/multer.js';

// Get verification status
router.get('/verification-status', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select(
            'verificationStatus submissionAttempts verificationComments'
        );
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Server Error' });
    }
});

// Resubmit document
router.post('/resubmit-document', 
    authenticateToken, 
    upload.single('document'),
    async (req, res) => {
        try {
            const user = await User.findById(req.user.id);
            
            // Check attempts
            if (user.submissionAttempts >= 3) {
                return res.status(400).json({ 
                    error: 'Maximum submission attempts reached' 
                });
            }

            // Check if document was uploaded
            if (!req.file) {
                return res.status(400).json({ 
                    error: 'No document provided' 
                });
            }

            // Update user document
            user.verificationDocument = {
                data: req.file.buffer.toString('base64'),
                fileName: req.file.originalname,
                fileType: req.file.mimetype,
                uploadedAt: new Date()
            };
            user.verificationStatus = 'pending';

            await user.save();

            // Notify admin about resubmission
            await Notification.create({
                sender: user.username,
                receiver: 'admin',
                message: `${user.username} has resubmitted verification document (Attempt ${user.submissionAttempts}/3)`,
                type: 'document_resubmission'
            });

            res.json({ 
                success: true, 
                message: 'Document submitted for verification' 
            });
        } catch (error) {
            console.error('Error in document resubmission:', error);
            res.status(500).json({ error: 'Server Error' });
        }
    }
); 