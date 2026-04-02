import { useState, useCallback } from 'react';
import { validateUserField, validateAllUserFields } from '../utils/validation';

export const useFormValidation = (initialState = {}) => {
    const [formData, setFormData] = useState(initialState);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    
    const validateField = useCallback((name, value) => {
        const { error } = validateUserField(name, value, formData);
        setErrors(prev => ({ ...prev, [name]: error }));
        return error;
    }, [formData]);
    
    const validateForm = useCallback(() => {
        const newErrors = validateAllUserFields(formData);
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData]);
    
    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        validateField(name, value);
    }, [validateField]);
    
    const handleBlur = useCallback((e) => {
        const { name } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));
        validateField(name, formData[name]);
    }, [formData, validateField]);
    
    const resetForm = useCallback(() => {
        setFormData(initialState);
        setErrors({});
        setTouched({});
    }, [initialState]);
    
    const setFieldValue = useCallback((name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
        validateField(name, value);
    }, [validateField]);
    
    return {
        formData,
        setFormData,
        errors,
        touched,
        validateField,
        validateForm,
        handleChange,
        handleBlur,
        resetForm,
        setFieldValue,
        setTouched
    };
};