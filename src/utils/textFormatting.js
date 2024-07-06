export const formatResponse = (text) => {
  if (typeof text !== 'string') {
    console.warn('formatResponse received non-string input:', text);
    return '';
  }

  const replacements = [
    [/\n{3,}/g, '\n\n'],
    [/([.!?])\s*(?=[A-Z])/g, '$1\n\n'],
    [/^(-|\d+\.)\s*/gm, '  $1 '],
    [/\*\*(.*?)\*\*/g, '<strong>$1</strong>'],
    [/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'],
    [/(\d+\.)\s+([A-Z])/g, '$1\n\n$2'],
    [/([A-Z][a-z]+:)/g, '\n$1'],
    [/(\w+\s*\((?:up|down)right\))/g, '<em>$1</em>'],
    [/^Dear querent,/gm, '\n\nDear querent,'],
    [/Blessed be\./g, '\n\nBlessed be.']
  ];

  let formattedText = replacements.reduce((acc, [regex, replacement]) => acc.replace(regex, replacement), text);
  
  // Remove any incomplete words at the end of the text
  formattedText = formattedText.replace(/\S+$/, '');

  return formattedText;
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
