import { Link } from 'react-router';

import PageWrapper from '@/components/page-wrapper';
import { Button } from '@/components/ui/button';

import { ROUTE_PATH } from '@/constants';
import { useAuthService } from '@/services/auth.service';
import { useAuthStore } from '@/store';

const Home = () => {
  const { user } = useAuthStore();
  const { logout } = useAuthService();

  return (
    <div>
      <PageWrapper>
        <div className="mt-4 flex h-full items-center justify-between">
          <h1>Home page</h1>
          {user ? (
            <Button onClick={logout}>Logout</Button>
          ) : (
            <Link className="underline-offset-4 transition-all hover:underline" to={ROUTE_PATH.AUTH.LOGIN}>
              Login
            </Link>
          )}
        </div>
      </PageWrapper>
    </div>
  );
};

export default Home;
