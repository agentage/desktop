import { createHashRouter } from 'react-router-dom';
import { AuthGuard } from './guards/AuthGuard.js';
import { ElectronGuard } from './guards/ElectronGuard.js';
import { AppLayout, LoginLayout } from './layouts/index.js';
import {
  AccountPage,
  AccountsPage,
  AgentPage,
  ErrorPage,
  HelpPage,
  HomePage,
  LoginPage,
  ModelsPage,
  SettingsPage,
} from './pages/index.js';

/**
 * Application router using hash-based routing for Electron compatibility
 * (file:// protocol doesn't support browser history API)
 */
export const router = createHashRouter([
  {
    // Root guard - checks Electron IPC health
    element: <ElectronGuard />,
    errorElement: <ErrorPage />,
    children: [
      // Public routes (login)
      {
        element: <LoginLayout />,
        children: [
          {
            path: '/login',
            element: <LoginPage />,
          },
        ],
      },
      // Protected routes (require auth)
      {
        element: <AuthGuard />,
        children: [
          {
            element: <AppLayout />,
            children: [
              {
                path: '/',
                element: <HomePage />,
              },
              {
                path: '/agent/:name',
                element: <AgentPage />,
              },
              {
                path: '/account',
                element: <AccountPage />,
              },
              {
                path: '/accounts',
                element: <AccountsPage />,
              },
              {
                path: '/models',
                element: <ModelsPage />,
              },
              {
                path: '/settings',
                element: <SettingsPage />,
              },
              {
                path: '/help',
                element: <HelpPage />,
              },
            ],
          },
        ],
      },
    ],
  },
]);
