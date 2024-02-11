import React from 'react';
import { useAutoLogin } from '@/hooks/useAutoLogin';

const Layout = ({ children }) => {
  useAutoLogin(); 
  console.log('Layout');

  return <>{children}</>;
};

export default Layout;
