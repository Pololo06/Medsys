export const validateEmail = (value) => {
  if (!value || !value.trim()) return 'El correo electrónico es obligatorio.';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value.trim())) return 'Ingresa un correo válido.';
  return null;
};

export const validatePassword = (value) => {
  if (!value) return 'La contraseña es obligatoria.';
  if (value.length < 6) return 'La contraseña debe tener al menos 6 caracteres.';
  return null;
};

export const validateFullName = (value) => {
  if (!value || !value.trim()) return 'El nombre completo es obligatorio.';
  if (value.trim().length < 3) return 'El nombre debe tener al menos 3 caracteres.';
  if (/\d/.test(value)) return 'El nombre no debe contener números.';
  return null;
};

export const validatePhone = (value) => {
  if (!value || !value.trim()) return 'El teléfono es obligatorio.';
  const cleanPhone = value.replace(/\D/g, '');
  if (cleanPhone.length !== 10) return 'El teléfono debe tener exactamente 10 dígitos.';
  return null;
};

export const validateDocumentId = (value) => {
  if (!value || !value.trim()) return 'El documento es obligatorio.';
  if (value.trim().length < 5) return 'El documento debe tener al menos 5 caracteres.';
  return null;
};

export const validateForm = (fields) => {
  const errors = {};
  Object.entries(fields).forEach(([fieldName, value]) => {
    if (fieldName === 'email') errors[fieldName] = validateEmail(value);
    else if (fieldName === 'password') errors[fieldName] = validatePassword(value);
    else if (fieldName === 'fullName') errors[fieldName] = validateFullName(value);
    else if (fieldName === 'phone') errors[fieldName] = validatePhone(value);
    else if (!value || (typeof value === 'string' && !value.trim())) {
      errors[fieldName] = 'Este campo es obligatorio.';
    }
  });
  Object.keys(errors).forEach(key => { if (errors[key] === null) delete errors[key]; });
  return errors;
};
