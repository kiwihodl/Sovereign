import React from 'react';
import { useRouter } from 'next/router';
import 'primeicons/primeicons.css';

const BottomBar = () => {
    const router = useRouter();

    const isActive = (path) => {
        return router.pathname === path;
    };

    return (
        <div className='min-bottom-bar:hidden fixed bottom-0 left-0 right-0 bg-gray-800 p-2 flex justify-around items-center z-20 border-t-2 border-gray-700'>
            <div onClick={() => router.push('/')} className={`cursor-pointer px-4 py-3 rounded-lg ${isActive('/') ? 'bg-gray-700' : ''}`}>
                <i className="pi pi-home text-2xl" />
            </div>
            <div onClick={() => router.push('/content')} className={`cursor-pointer px-4 py-3 rounded-lg ${isActive('/content') ? 'bg-gray-700' : ''}`}>
                <i className="pi pi-video text-2xl" />
            </div>
            <div onClick={() => router.push('/feed?channel=global')} className={`cursor-pointer px-4 py-3 rounded-lg ${isActive('/feed') ? 'bg-gray-700' : ''}`}>
                <i className="pi pi-comments text-2xl" />
            </div>
        </div>
    );
};

export default BottomBar;
