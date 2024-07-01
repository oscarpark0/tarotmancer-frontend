export const formatResponse = (text) => {
  // Check if text is a string, if not return an empty string
  if (typeof text !== 'string') {
    console.warn('formatResponse received non-string input:', text);
    return '';
  }

  // Remove extra newlines
  let formatted = text.replace(/\n{3,}/g, '\n\n');
  
  // Add proper spacing after punctuation
  formatted = formatted.replace(/([.!?])\s*(?=[A-Z])/g, '$1\n\n');
  
  // Ensure consistent indentation for lists
  formatted = formatted.replace(/^(-|\d+\.)\s*/gm, '  $1 ');
  
  // Highlight important phrases
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Convert URLs to clickable links
  formatted = formatted.replace(
    /(https?:\/\/[^\s]+)/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
  );
  
  return formatted;
};
