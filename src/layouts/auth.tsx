import { useOutlet } from 'react-router';

import { ThemeControl } from '@/components/theme-control';

const AuthLayout = () => {
  const outlet = useOutlet();

  return (
    <>
      <div className="absolute top-4 right-4">
        <ThemeControl />
      </div>
      {outlet}
    </>
  );
};

export default AuthLayout;
