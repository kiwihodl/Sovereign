import { useState, useRef } from 'react';
import axios from 'axios';

export const useDecryptContent = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  // Map of in-progress decryption promises, keyed by content hash
  const inProgressMap = useRef(new Map());
  const cachedResults = useRef({});
  
  const decryptContent = async (encryptedContent) => {
    // Validate input
    if (!encryptedContent) {
      return null;
    }
    
    // Use first 20 chars as our cache/lock key
    const cacheKey = encryptedContent.substring(0, 20);
    
    // Check if we've already decrypted this content
    if (cachedResults.current[cacheKey]) {
      return cachedResults.current[cacheKey];
    }
    
    // Check if this specific content is already being decrypted
    if (inProgressMap.current.has(cacheKey)) {
      // Return the existing promise for this content
      try {
        return await inProgressMap.current.get(cacheKey);
      } catch (error) {
        // If the existing promise rejects, we'll try again below
        if (error.name !== 'AbortError') {
          console.warn('Previous decryption attempt failed, retrying');
        }
      }
    }
    
    // Create abort controller for this request
    const abortController = new AbortController();
    
    // Create a new decryption promise for this content
    const decryptPromise = (async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await axios.post('/api/decrypt', 
          { encryptedContent }, 
          { signal: abortController.signal }
        );
        
        if (response.status !== 200) {
          throw new Error(`Failed to decrypt: ${response.statusText}`);
        }
        
        const decryptedContent = response.data.decryptedContent;
        
        // Cache the successful result
        cachedResults.current[cacheKey] = decryptedContent;
        
        return decryptedContent;
      } catch (error) {
        // Handle abort errors specifically
        if (axios.isCancel(error)) {
          throw new DOMException('Decryption aborted', 'AbortError');
        }
        
        setError(error.message || 'Decryption failed');
        // Re-throw to signal failure to awaiter
        throw error;
      } finally {
        setIsLoading(false);
        // Remove this promise from the in-progress map
        inProgressMap.current.delete(cacheKey);
      }
    })();
    
    // Store the promise and abort controller in our map
    const abortablePromise = {
      promise: decryptPromise,
      abort: () => abortController.abort()
    };
    
    inProgressMap.current.set(cacheKey, decryptPromise);
    
    // Function to handle timeouts from parent callers
    decryptPromise.cancel = () => {
      abortController.abort();
    };
    
    // Return the promise
    try {
      return await decryptPromise;
    } catch (error) {
      // We've already set the error state in the promise
      return null;
    }
  };
  
  return { decryptContent, isLoading, error };
};
