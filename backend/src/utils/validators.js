const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidPhone = (phone) => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
};

const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  return str.trim().replace(/[<>]/g, '');
};

const validateSocialHandle = (handle, platform) => {
  if (!handle) return true;
  
  const patterns = {
    instagram: /^[a-zA-Z0-9._]{1,30}$/,
    tiktok: /^[a-zA-Z0-9._]{1,24}$/,
    youtube: /^[a-zA-Z0-9._-]{1,100}$/,
    twitter: /^[a-zA-Z0-9._]{1,15}$/
  };
  
  const pattern = patterns[platform];
  return pattern ? pattern.test(handle) : true;
};

const validateEngagementRate = (rate) => {
  return typeof rate === 'number' && rate >= 0 && rate <= 100;
};

const validateAudienceSize = (size) => {
  return typeof size === 'number' && size >= 0 && Number.isInteger(size);
};

module.exports = {
  isValidEmail,
  isValidPhone,
  isValidUrl,
  sanitizeString,
  validateSocialHandle,
  validateEngagementRate,
  validateAudienceSize
};