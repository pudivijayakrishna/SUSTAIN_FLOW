export const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const errors = [];
    if (password.length < minLength) {
        errors.push(`Password must be at least ${minLength} characters long`);
    }
    if (!hasUpperCase) {
        errors.push('Password must contain at least one uppercase letter');
    }
    if (!hasNumber) {
        errors.push('Password must contain at least one number');
    }
    if (!hasSpecialChar) {
        errors.push('Password must contain at least one special character');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

export const passwordValidationMiddleware = (req, res, next) => {
    const { password, newPassword } = req.body;
    const passwordToValidate = newPassword || password;

    if (!passwordToValidate) {
        return res.status(400).json({ error: 'Password is required' });
    }

    const validation = validatePassword(passwordToValidate);
    if (!validation.isValid) {
        return res.status(400).json({ 
            error: 'Invalid password format',
            details: validation.errors 
        });
    }

    next();
}; 