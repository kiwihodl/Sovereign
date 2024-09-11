import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

export function useIsAdmin() {
  const { data: session, status } = useSession();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (status === 'authenticated') {
      setIsAdmin(session?.user?.role?.admin || false);
    } else if (status === 'unauthenticated') {
      setIsAdmin(false);
    }
  }, [session, status]);

  return { isAdmin, isLoading: status === 'loading' };
}