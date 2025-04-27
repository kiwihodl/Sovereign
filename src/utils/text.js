import React from 'react';

/**
 * Highlights occurrences of a search term within a text string
 * 
 * @param {string} text - The original text to process
 * @param {string} term - The search term to highlight
 * @param {string} className - CSS class name to apply to highlighted text
 * @returns {JSX.Element[]} - Array of text and highlighted spans
 */
export const highlightText = (text, term, className = 'bg-yellow-300/30 text-white') => {
  if (!text || !term || term.length < 2) {
    return text;
  }

  const parts = String(text).split(new RegExp(`(${term})`, 'gi'));

  return parts.map((part, index) => {
    const isMatch = part.toLowerCase() === term.toLowerCase();
    
    return isMatch ? (
      <span key={index} className={className}>
        {part}
      </span>
    ) : (
      part
    );
  });
};

/**
 * Truncates text around the first match of a search term
 * 
 * @param {string} text - The original text to process
 * @param {string} term - The search term to find
 * @param {number} contextLength - Number of characters to include before and after match
 * @returns {string} - Truncated text with match in the middle
 */
export const getTextWithMatchContext = (text, term, contextLength = 40) => {
  if (!text || !term || term.length < 2) {
    return text;
  }

  const lowerText = text.toLowerCase();
  const lowerTerm = term.toLowerCase();
  const matchIndex = lowerText.indexOf(lowerTerm);
  
  if (matchIndex === -1) {
    return text.length > contextLength * 2 
      ? text.substring(0, contextLength * 2) + '...'
      : text;
  }

  const start = Math.max(0, matchIndex - contextLength);
  const end = Math.min(text.length, matchIndex + term.length + contextLength);
  
  let result = text.substring(start, end);
  
  if (start > 0) {
    result = '...' + result;
  }
  
  if (end < text.length) {
    result = result + '...';
  }
  
  return result;
};
