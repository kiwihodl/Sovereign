import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useNDKContext } from '@/context/NDKContext';
import UserProfileCard from '@/components/profile/UserProfileCard';
import useCheckCourseProgress from '@/hooks/tracking/useCheckCourseProgress';
import useWindowWidth from '@/hooks/useWindowWidth';
import UserProgressTable from '@/components/profile/DataTables/UserProgressTable';
import UserPurchaseTable from '@/components/profile/DataTables/UserPurchaseTable';
import UserAccountLinking from '@/components/profile/UserAccountLinking';

const UserProfile = () => {
  const windowWidth = useWindowWidth();
  const [user, setUser] = useState(null);
  const [account, setAccount] = useState(null);
  const { data: session } = useSession();
  const { ndk, addSigner } = useNDKContext();
  useCheckCourseProgress();

  useEffect(() => {
    if (session?.user) {
      console.log('Session', session);
      setUser(session.user);

      if (session?.account) {
        setAccount(session.account);
      }
    }
  }, [session]);

  return (
    user && (
      <div className="py-4 px-1">
        {windowWidth < 768 && <h1 className="text-3xl font-bold mb-6">Profile</h1>}
        <div className="w-full flex flex-row max-lap:flex-col">
          <div className="w-[22%] h-full max-lap:w-full">
            {user && <UserProfileCard user={user} />}
            {user && <UserAccountLinking session={session} />}
          </div>

          <div className="w-[78%] flex flex-col justify-center mx-auto max-lap:w-full">
            <UserProgressTable session={session} ndk={ndk} windowWidth={windowWidth} />
            <UserPurchaseTable session={session} windowWidth={windowWidth} />
          </div>
        </div>
      </div>
    )
  );
};

export default UserProfile;
