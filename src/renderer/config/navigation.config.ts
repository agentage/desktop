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
    // {
    //   id: 'work',
    //   label: 'WORK',
    //   items: [
    //     {
    //       id: 'tasks',
    //       title: 'Tasks',
    //       icon: 'list-checks',
    //       path: '/tasks',
    //     },
    //   ],
    // },
    {
      id: 'resources',
      label: 'RESOURCES',
      items: [
        {
          id: 'resources',
          title: 'Resources',
          icon: 'layers',
          path: '/resources',
        },
      ],
    },
    {
      id: 'chat',
      label: 'CHAT',
      items: [], // Conversation history will be rendered dynamically
    },
  ],
};
