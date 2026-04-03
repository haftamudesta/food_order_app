const validationMessages = {
    name: {
        required: 'Name is required',
        minLength: 'Name must be at least 2 characters',
        maxLength: 'Name cannot exceed 50 characters'
    },
    email: {
        required: 'Email is required',
        invalid: 'Please provide a valid email'
    },
    phone: {
        required: 'Phone number is required',
        invalid: 'Invalid Ethiopian phone number! Format: +251915574522 or 0915574522'
    },
    password: {
        required: 'Password is required',
        minLength: 'Password must be at least 6 characters',
        invalid: 'Invalid email or password'
    },
    confirmPassword: {
        required: 'Please confirm your password',
        mismatch: 'Passwords do not match'
    },
    login: {
        success: 'Login successful!',
        failed: 'Invalid email or password',
        networkError: 'Network error. Please try again'
    }
};

export default validationMessages;