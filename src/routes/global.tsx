import { lazy } from 'react';

import { RouteObject } from 'react-router';

import { ROUTE_PATH } from '@/constants';

const DefaultLayout = lazy(() => import('@/layouts/default'));

const NotFound = lazy(() => import('@/pages/not-found'));
const Home = lazy(() => import('@/pages/home'));

const globalRoutes: RouteObject[] = [
  {
    element: <DefaultLayout />,
    children: [
      { path: ROUTE_PATH.HOME, element: <Home /> },
      { path: ROUTE_PATH.NOTFOUND, element: <NotFound /> },
    ],
  },
];

export default globalRoutes;
