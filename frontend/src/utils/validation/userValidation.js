export const validateUserField = (name, value, formData = {}) => {
    let error = '';
    
    switch (name) {
        case 'name':
            if (!value) error = 'Name is required';
            else if (value.length < 2) error = 'Name must be at least 2 characters';
            else if (value.length > 50) error = 'Name cannot exceed 50 characters';
            break;
            
        case 'email':
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!value) error = 'Email is required';
            else if (!emailRegex.test(value)) error = 'Please provide a valid email';
            break;
            
        case 'phone':
            const phoneRegex = /^(^\+251|^0)[1-9]\d{8}$/;
            if (!value) error = 'Phone number is required';
            else if (!phoneRegex.test(value)) {
                error = 'Invalid Ethiopian phone number! Format: +251915574522 or 0915574522';
            }
            break;
            
        case 'password':
            if (!value) error = 'Password is required';
            else if (value.length < 6) error = 'Password must be at least 6 characters';
            else if (formData.confirmPassword && value !== formData.confirmPassword) {
                return { error: '', updateConfirmPassword: true };
            }
            break;
            
        case 'confirmPassword':
            if (!value) error = 'Please confirm your password';
            else if (value !== formData.password) error = 'Passwords do not match';
            break;
            
        default:
            break;
    }
    
    return { error, updateConfirmPassword: false };
};

export const validateAllUserFields = (formData) => {
    const errors = {};
    
    Object.keys(formData).forEach(key => {
        const { error } = validateUserField(key, formData[key], formData);
        if (error) errors[key] = error;
    });
    
    return errors;
};

export const isUserFormValid = (formData) => {
    const errors = validateAllUserFields(formData);
    return Object.keys(errors).length === 0;
};