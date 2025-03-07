import multer from 'multer';

// Configure storage
const storage = multer.memoryStorage();

// File filter
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Only PDF files are allowed'), false);
    }
};

// Configure multer
export const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB max file size
    },
    fileFilter: fileFilter
});

// Error handler middleware
export const handleUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                error: 'File too large',
                message: 'File size should not exceed 5MB'
            });
        }
        return res.status(400).json({
            error: err.code,
            message: err.message
        });
    }
    
    if (err.message === 'Only PDF files are allowed') {
        return res.status(400).json({
            error: 'Invalid file type',
            message: err.message
        });
    }
    
    next(err);
}; 