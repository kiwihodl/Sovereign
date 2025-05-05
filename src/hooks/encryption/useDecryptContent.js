import { useState, useRef } from 'react';
import axios from 'axios';

export const useDecryptContent = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const inProgressRef = useRef(false);
  const cachedResults = useRef({});
  
  const decryptContent = async (encryptedContent) => {
    // Validate input
    if (!encryptedContent) {
      return null;
    }
    
    // Prevent multiple simultaneous calls
    if (inProgressRef.current) {
      // Wait for a small delay to prevent tight loop
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Return a cached result if we have one
      const firstChars = encryptedContent.substring(0, 20);
      if (cachedResults.current[firstChars]) {
        return cachedResults.current[firstChars];
      }
      
      return null;
    }
    
    // Check if we've already decrypted this content
    const firstChars = encryptedContent.substring(0, 20);
    if (cachedResults.current[firstChars]) {
      return cachedResults.current[firstChars];
    }
    
    try {
      inProgressRef.current = true;
      setIsLoading(true);
      setError(null);
      
      const response = await axios.post('/api/decrypt', { encryptedContent });
      
      if (response.status !== 200) {
        throw new Error(`Failed to decrypt: ${response.statusText}`);
      }
      
      const decryptedContent = response.data.decryptedContent;
      
      // Cache the result
      cachedResults.current[firstChars] = decryptedContent;
      
      return decryptedContent;
    } catch (error) {
      setError(error.message || 'Decryption failed');
      return null;
    } finally {
      setIsLoading(false);
      inProgressRef.current = false;
    }
  };
  
  return { decryptContent, isLoading, error };
};
