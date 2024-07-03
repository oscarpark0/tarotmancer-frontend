export const formatResponse = (text) => {
  if (typeof text !== 'string') {
    console.warn('formatResponse received non-string input:', text);
    return '';
  }

  return text
    .replace(/\n{3,}/g, '\n\n')
    .replace(/([.!?])\s*(?=[A-Z])/g, '$1\n\n')
    .replace(/^(-|\d+\.)\s*/gm, '  $1 ')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/(\d+\.)\s+([A-Z])/g, '$1\n\n$2')  // Add line break after numbered points
    .replace(/([A-Z][a-z]+:)/g, '\n$1')  // Add line break before card names
    .replace(/(\w+\s*\((?:up|down)right\))/g, '<em>$1</em>')  // Italicize card orientations
    .replace(/^Dear querent,/gm, '\n\nDear querent,')  // Add extra line break before "Dear querent"
    .replace(/Blessed be\./g, '\n\nBlessed be.');  // Add extra line break before "Blessed be"
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
