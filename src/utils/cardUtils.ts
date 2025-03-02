/**
 * Utility functions for working with tarot card images and data
 */

/**
 * Maps tarot card names to their corresponding image filenames
 */
export const cardToFileMapping: Record<string, string> = {
  "The Fool": "m00.webp",
  "The Magician": "m01.webp",
  "The High Priestess": "m02.webp",
  "The Empress": "m03.webp",
  "The Emperor": "m04.webp",
  "The Hierophant": "m05.webp",
  "The Lovers": "m06.webp",
  "The Chariot": "m07.webp",
  "Strength": "m08.webp",
  "The Hermit": "m09.webp",
  "Wheel of Fortune": "m10.webp",
  "Justice": "m11.webp",
  "The Hanged Man": "m12.webp",
  "Death": "m13.webp",
  "Temperance": "m14.webp",
  "The Devil": "m15.webp",
  "The Tower": "m16.webp",
  "The Star": "m17.webp",
  "The Moon": "m18.webp",
  "The Sun": "m19.webp",
  "Judgement": "m20.webp",
  "The World": "m21.webp",
  // Minor Arcana - Wands
  "Ace of Wands": "w01.webp",
  "Two of Wands": "w02.webp",
  "Three of Wands": "w03.webp",
  "Four of Wands": "w04.webp",
  "Five of Wands": "w05.webp",
  "Six of Wands": "w06.webp",
  "Seven of Wands": "w07.webp",
  "Eight of Wands": "w08.webp",
  "Nine of Wands": "w09.webp",
  "Ten of Wands": "w10.webp",
  "Page of Wands": "w11.webp",
  "Knight of Wands": "w12.webp",
  "Queen of Wands": "w13.webp",
  "King of Wands": "w14.webp",
  // Minor Arcana - Cups
  "Ace of Cups": "c01.webp",
  "Two of Cups": "c02.webp",
  "Three of Cups": "c03.webp",
  "Four of Cups": "c04.webp",
  "Five of Cups": "c05.webp",
  "Six of Cups": "c06.webp",
  "Seven of Cups": "c07.webp",
  "Eight of Cups": "c08.webp",
  "Nine of Cups": "c09.webp",
  "Ten of Cups": "c10.webp",
  "Page of Cups": "c11.webp",
  "Knight of Cups": "c12.webp",
  "Queen of Cups": "c13.webp",
  "King of Cups": "c14.webp",
  // Minor Arcana - Swords
  "Ace of Swords": "s01.webp",
  "Two of Swords": "s02.webp",
  "Three of Swords": "s03.webp",
  "Four of Swords": "s04.webp",
  "Five of Swords": "s05.webp",
  "Six of Swords": "s06.webp",
  "Seven of Swords": "s07.webp",
  "Eight of Swords": "s08.webp",
  "Nine of Swords": "s09.webp",
  "Ten of Swords": "s10.webp",
  "Page of Swords": "s11.webp",
  "Knight of Swords": "s12.webp",
  "Queen of Swords": "s13.webp",
  "King of Swords": "s14.webp",
  // Minor Arcana - Pentacles
  "Ace of Pentacles": "p01.webp",
  "Two of Pentacles": "p02.webp",
  "Three of Pentacles": "p03.webp",
  "Four of Pentacles": "p04.webp",
  "Five of Pentacles": "p05.webp",
  "Six of Pentacles": "p06.webp",
  "Seven of Pentacles": "p07.webp",
  "Eight of Pentacles": "p08.webp",
  "Nine of Pentacles": "p09.webp",
  "Ten of Pentacles": "p10.webp",
  "Page of Pentacles": "p11.webp",
  "Knight of Pentacles": "p12.webp",
  "Queen of Pentacles": "p13.webp",
  "King of Pentacles": "p14.webp"
};

/**
 * Gets the correct image filename for a given card name
 * @param cardName The name of the tarot card
 * @returns The filename for the card's image
 */
export const getCardImageFilename = (cardName: string): string => {
  return cardToFileMapping[cardName] || "m00.webp"; // Default to The Fool if not found
};

/**
 * Process a card image path to ensure it's properly formatted for ImageKit
 * @param path The image path or URL
 * @returns The formatted path for use with ImageKit
 */
export const formatCardImagePath = (path: string): string => {
  // If the path is a full URL, extract just the filename
  if (path.startsWith('http')) {
    return path.replace('https://ik.imagekit.io/tarotmancer/', '');
  }
  // If the path is just a card name, convert to filename
  if (!path.includes('.') && cardToFileMapping[path]) {
    return cardToFileMapping[path];
  }
  // If it's already a filename (e.g., "m01.webp"), return as is
  return path;
};