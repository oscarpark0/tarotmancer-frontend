export const getImagePath = (imagePath) => {
  // Check if the imagePath is a full URL
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    // Extract just the filename from the full URL
    const urlParts = imagePath.split('/');
    return urlParts[urlParts.length - 1];
  }
  // If it's not a full URL, just return the imagePath as is
  return imagePath;
};