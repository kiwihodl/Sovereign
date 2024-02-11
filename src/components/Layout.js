import React from 'react';
import { useLogin } from '@/hooks/useLogin';

const Layout = ({ children }) => {
  useLogin(); 

  return <>{children}</>;
};

export default Layout;
