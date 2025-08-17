
/**
 * Basic input sanitization utility
 */
export const sanitizeInput = (input: string): string => {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  // Remove potentially dangerous characters and trim whitespace
  return input
    .replace(/[<>\"'&]/g, '') // Remove basic HTML/script injection characters
    .trim()
    .slice(0, 1000); // Limit length to prevent abuse
};
