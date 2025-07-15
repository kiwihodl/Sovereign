import React from 'react';
import { useRouter } from 'next/router';
import 'primeicons/primeicons.css';

const BottomBar = () => {
  const router = useRouter();

  const isActive = path => {
    return router.pathname === path;
  };

  return (
    <div className="min-bottom-bar:hidden fixed bottom-0 left-0 right-0 bg-gray-800 p-2 flex justify-around items-center z-20 border-t-2 border-gray-700">
      <div
        onClick={() => router.push('/')}
        className={`hover:bg-gray-700 cursor-pointer px-4 py-2 rounded-lg ${isActive('/') ? 'bg-gray-700' : ''}`}
      >
        <i className="pi pi-home text-2xl" />
      </div>
      <div
        onClick={() => router.push('/content?tag=all')}
        className={`hover:bg-gray-700 cursor-pointer px-4 py-2 rounded-lg ${isActive('/content') ? 'bg-gray-700' : ''}`}
      >
        <i className="pi pi-play-circle text-2xl" />
      </div>
      <div
        onClick={() => router.push('/store')}
        className={`hover:bg-gray-700 cursor-pointer px-4 py-2 rounded-lg ${isActive('/store') ? 'bg-gray-700' : ''}`}
      >
        <i className="pi pi-shopping-cart text-2xl" />
      </div>
      <div
        onClick={() => router.push('/about')}
        className={`hover:bg-gray-700 cursor-pointer px-4 py-2 rounded-lg ${isActive('/about') ? 'bg-gray-700' : ''}`}
      >
        <i className="pi pi-info-circle text-2xl" />
      </div>
    </div>
  );
};

export default BottomBar;
