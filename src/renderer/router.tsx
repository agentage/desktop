import { createHashRouter } from 'react-router-dom';
import { AuthGuard } from './guards/AuthGuard.js';
import { ElectronGuard } from './guards/ElectronGuard.js';
import { AppLayout, LoginLayout } from './layouts/index.js';
import {
  AccountPage,
  AccountsPage,
  AgentPage,
  ContextPage,
  ErrorPage,
  HelpPage,
  HomePage,
  LoginPage,
  ModelsPage,
  SecretsPage,
  SettingsPage,
  TasksPage,
  ToolsPage,
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
                path: '/tasks',
                element: <TasksPage />,
              },
              {
                path: '/tools',
                element: <ToolsPage />,
              },
              {
                path: '/secrets',
                element: <SecretsPage />,
              },
              {
                path: '/context',
                element: <ContextPage />,
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
