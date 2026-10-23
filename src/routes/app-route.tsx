import { useEffect, useMemo, useState } from 'react';

import { useRoutes } from 'react-router';

import LoadingIndicator from '@/components/loading-indicator';

import { LOCAL_STORAGE_KEY } from '@/constants';
import { useAuthService } from '@/services/auth.service';
import { useAuthStore } from '@/store';
import { getLocalStorage } from '@/utils';

import globalRoutes from './global';
import protectedRoutes from './private';
import publicRoutes from './public';

const AppRoutes = () => {
  const { getMe } = useAuthService();
  const { user } = useAuthStore();
  const [isInitialized, setIsInitialized] = useState(false);

  const token = useMemo(() => getLocalStorage(LOCAL_STORAGE_KEY.ACCESS_TOKEN), []);

  useEffect(() => {
    const initAuth = async () => {
      if (isInitialized) return;

      try {
        if (token && !user) {
          await getMe();
        }
      } finally {
        setIsInitialized(true);
      }
    };

    initAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const routing = useRoutes([...globalRoutes, ...publicRoutes, ...protectedRoutes]);

  if (!isInitialized && token) return <LoadingIndicator />;

  return <>{routing}</>;
};

export default AppRoutes;
