export const formatResponse = (text) => {
  if (typeof text !== 'string') {
    console.warn('formatResponse received non-string input:', text);
    return '';
  }
  console.log("Formatting text:", text);
  return text; // Temporarily return the text without modifications
};

// Additional utility functions for text formatting

export const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

export const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

export const slugify = (text) => {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');
};