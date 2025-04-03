import { useState } from 'react';
import axios from 'axios';

export const useEncryptContent = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const encryptContent = async content => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post('/api/encrypt', { content });

      if (response.status !== 200) {
        throw new Error('Failed to encrypt content');
      }

      const encryptedContent = response.data.encryptedContent;
      setIsLoading(false);
      return encryptedContent;
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
      return null;
    }
  };

  return { encryptContent, isLoading, error };
};
