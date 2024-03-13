import React from 'react';
import { useLogin } from '@/hooks/useLogin';

const Layout = ({ children }) => {
  useLogin();

  return (
    <div>
      {children}
    </div>)
};

export default Layout;
