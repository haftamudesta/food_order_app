import {isEmailValid } from './helpers';
import validationMessages from './messages';

export const validateLoginField = (name, value) => {
    let error = '';
    
    switch (name) {
        case 'email':
            if (!value) error = validationMessages.email.required;
            else if (!isEmailValid(value)) error = validationMessages.email.invalid;
            break;
            
        case 'password':
            if (!value) error = validationMessages.password.required;
            break;
            
        default:
            break;
    }
    
    return error;
};

export const validateLoginForm = (formData) => {
    const errors = {};
    
    if (!formData.email || !isEmailValid(formData.email)) {
        errors.email = !formData.email ? validationMessages.email.required : validationMessages.email.invalid;
    }
    
    if (!formData.password) {
        errors.password = validationMessages.password.required;
    }
    
    return errors;
};

export const isLoginFormValid = (formData) => {
    const errors = validateLoginForm(formData);
    return Object.keys(errors).length === 0;
};