import React, { PropsWithChildren, lazy, useMemo } from 'react';

import { Navigate, RouteObject, useSearchParams } from 'react-router';
import { useShallow } from 'zustand/shallow';

import { ROUTE_PATH } from '@/constants';
import { useAuthStore } from '@/store';

const AuthLayout = lazy(() => import('@/layouts/auth'));
const Login = lazy(() => import('@/pages/auth/login'));
const Register = lazy(() => import('@/pages/auth/register'));

const PublicRoute = React.memo(({ children }: PropsWithChildren) => {
  const user = useAuthStore(useShallow((state) => state.user));

  const [searchParams] = useSearchParams();

  const returnUrl = useMemo(() => searchParams.get('returnUrl') ?? ROUTE_PATH.HOME, [searchParams]);

  return user ? <Navigate to={returnUrl} replace /> : children;
});

PublicRoute.displayName = 'PublicRoute';

const publicRoutes: RouteObject[] = [
  {
    element: (
      <PublicRoute>
        <AuthLayout />
      </PublicRoute>
    ),
    children: [
      {
        path: ROUTE_PATH.AUTH.LOGIN,
        element: <Login />,
      },
      {
        path: ROUTE_PATH.AUTH.REGISTER,
        element: <Register />,
      },
    ],
  },
];

export default publicRoutes;
