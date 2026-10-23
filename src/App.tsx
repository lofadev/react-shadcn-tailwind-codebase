import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router';

import { ThemeProvider } from '@/components/theme-provider';

import ToastMessage from './components/custom/toast-message';
import SuspenseWrapper from './components/suspense-wrapper';
import AppRoutes from './routes/app-route';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});

const App = () => {
  return (
    <ThemeProvider>
      <SuspenseWrapper>
        <ToastMessage />
        <BrowserRouter>
          <QueryClientProvider client={queryClient}>
            <AppRoutes />
          </QueryClientProvider>
        </BrowserRouter>
      </SuspenseWrapper>
    </ThemeProvider>
  );
};

export default App;
