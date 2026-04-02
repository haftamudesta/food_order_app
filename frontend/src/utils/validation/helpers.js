export const isEmpty = (value) => {
    return !value || value.trim() === '';
};

export const isEmailValid = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const isPhoneValid = (phone, pattern) => {
    const phoneRegex = pattern || /^(^\+251|^0)[1-9]\d{8}$/;
    return phoneRegex.test(phone);
};

export const isLengthValid = (value, min, max) => {
    const length = value?.trim().length || 0;
    if (min && length < min) return false;
    if (max && length > max) return false;
    return true;
};

export const doPasswordsMatch = (password, confirmPassword) => {
    return password === confirmPassword;
};