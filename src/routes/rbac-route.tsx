import { PropsWithChildren } from 'react';

import { Navigate } from 'react-router';

import { PermissionType, ROLES, ROUTE_PATH } from '@/constants';
import { usePermission } from '@/hooks';
import { useAuthStore } from '@/store';

interface IProps {
  requiredPermissions: PermissionType;
  redirectTo: string;
}

const RbacRoute = ({
  requiredPermissions,
  redirectTo = ROUTE_PATH.ACCESS_DENINED,
  children,
}: IProps & PropsWithChildren) => {
  const { user } = useAuthStore();

  const userRole = user?.role || ROLES.USER;

  const { hasPermission } = usePermission(userRole);

  if (!hasPermission(requiredPermissions)) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};

export default RbacRoute;
