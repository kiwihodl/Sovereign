import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

export function useIsAdmin() {
  const { data: session, status } = useSession();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') {
      setIsLoading(true);
      return;
    }
    if (status === 'authenticated') {
      setIsAdmin(session?.user?.role?.admin || false);
      setIsLoading(false);
    } else if (status === 'unauthenticated') {
      setIsAdmin(false);
      setIsLoading(false);
    }
  }, [session, status]);

  return { isAdmin, isLoading };
}
