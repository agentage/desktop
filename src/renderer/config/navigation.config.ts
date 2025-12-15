import type { NavigationConfig } from '../../shared/types/navigation.types.js';

/**
 * Navigation menu configuration for Agentage Desktop
 * Inspired by modern learning platforms like Uxcel
 */
export const navigationConfig: NavigationConfig = {
  groups: [
    {
      id: 'main',
      label: '', // No label for main navigation
      items: [
        {
          id: 'home',
          title: 'Home',
          icon: 'home',
          path: '/',
        },
        {
          id: 'agents',
          title: 'Agents',
          icon: 'bot',
          path: '/agents',
        },
      ],
    },
    {
      id: 'work',
      label: 'WORK',
      items: [
        {
          id: 'tasks',
          title: 'Tasks',
          icon: 'list-checks',
          path: '/tasks',
        },
        {
          id: 'workflows',
          title: 'Workflows',
          icon: 'workflow',
          path: '/workflows',
        },
        {
          id: 'templates',
          title: 'Templates',
          icon: 'file-stack',
          path: '/templates',
        },
      ],
    },
    {
      id: 'resources',
      label: 'RESOURCES',
      items: [
        {
          id: 'models',
          title: 'Models',
          icon: 'brain',
          path: '/models',
        },
        {
          id: 'tools',
          title: 'Tools',
          icon: 'wrench',
          path: '/tools',
        },
        {
          id: 'context',
          title: 'Context',
          icon: 'file-text',
          path: '/context',
        },
        {
          id: 'accounts',
          title: 'Accounts',
          icon: 'link',
          path: '/accounts',
        },
      ],
    },
  ],
};
