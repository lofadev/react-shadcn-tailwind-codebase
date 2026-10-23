import { Link } from 'react-router';

import { ROUTE_PATH } from '@/constants';

import PageWrapper from './page-wrapper';
import { ThemeControl } from './theme-control';

const Header = () => {
  return (
    <header className="border-grid bg-background/95 supports-[backdrop-filter]:bg-background/60 fixed top-0 z-50 w-screen backdrop-blur">
      <PageWrapper>
        <div className="flex h-14 items-center justify-between border-b">
          <h1 className="text-2xl font-bold">
            <Link to={ROUTE_PATH.HOME}>LOGO</Link>
          </h1>

          <ThemeControl />
        </div>
      </PageWrapper>
    </header>
  );
};

export default Header;
