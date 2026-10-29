// Validation & Sanitization Helpers
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return typeof email === 'string' && emailRegex.test(email.trim());
};

const sanitizeInput = (str) => {
  if (typeof str !== 'string') return '';
  return str.trim().replace(/[<>]/g, '');
};

const isStrongPassword = (password) => {
  return typeof password === 'string' && password.length >= 6;
};

module.exports = { isValidEmail, sanitizeInput, isStrongPassword };