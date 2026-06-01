export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  return password && password.length >= 6;
};

export const validateFullName = (name) => {
  return name && name.trim().length >= 3 && !/\d/.test(name);
};

export const validatePhoneNumber = (phone) => {
  const cleanPhone = phone.replace(/\D/g, '');
  return cleanPhone.length === 10;
};

export const validateForm = (formData, schema) => {
  const errors = {};
  
  Object.keys(schema).forEach(field => {
    const validator = schema[field];
    if (!validator(formData[field])) {
      errors[field] = true;
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
