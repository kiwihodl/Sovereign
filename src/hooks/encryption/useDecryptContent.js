import { useState } from 'react';
import axios from 'axios';

export const useDecryptContent = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const decryptContent = async (encryptedContent) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post('/api/decrypt', { encryptedContent });

      if (response.status !== 200) {
        throw new Error('Failed to decrypt content');
      }

      const decryptedContent = response.data.decryptedContent;
      setIsLoading(false);
      return decryptedContent;
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
      return null;
    }
  };

  return { decryptContent, isLoading, error };
};