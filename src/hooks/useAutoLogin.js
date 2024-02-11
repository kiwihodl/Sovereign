import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { setPubkey, setUsername } from "@/redux/reducers/userReducer";

export const useAutoLogin = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  console.log('useAutoLogin');

  useEffect(() => {
      const publicKey = window.localStorage.getItem('pubkey');
      console.log('Auto logging in with public key:', publicKey);

    if (publicKey) {
      const login = async () => {
        try {
          const response = await axios.get(`/api/users/${publicKey}`);
          if (response.status === 200 && response.data) {
            dispatch(setPubkey(publicKey));
            if (response.data.username) {
              dispatch(setUsername(response.data.username));
            }
          } else {
            // Handle user not found or other errors appropriately
          }
        } catch (error) {
          console.error('Error during auto login:', error);
          // Handle error
        }
      };

      login();
    }
  }, [dispatch]);

  return null;
};
