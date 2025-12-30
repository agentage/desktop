/**
 * Workspace page constants
 */

// Available workspace icons
export const WORKSPACE_ICONS = [
  { id: 'folder', label: 'Folder' },
  { id: 'briefcase', label: 'Briefcase' },
  { id: 'code', label: 'Code' },
  { id: 'star', label: 'Star' },
  { id: 'heart', label: 'Heart' },
  { id: 'rocket', label: 'Rocket' },
  { id: 'home', label: 'Home' },
  { id: 'book', label: 'Book' },
  { id: 'music', label: 'Music' },
  { id: 'camera', label: 'Camera' },
  { id: 'gamepad', label: 'Gamepad' },
  { id: 'gift', label: 'Gift' },
  { id: 'graduation', label: 'Graduation' },
  { id: 'leaf', label: 'Leaf' },
  { id: 'lightbulb', label: 'Lightbulb' },
  { id: 'palette', label: 'Palette' },
  { id: 'paw', label: 'Paw' },
  { id: 'flask', label: 'Flask' },
  { id: 'wrench', label: 'Wrench' },
  { id: 'globe', label: 'Globe' },
] as const;

// Available workspace colors (10 colors for 2 rows of 5)
export const WORKSPACE_COLORS = [
  { id: 'slate', value: '#64748b', label: 'Slate' },
  { id: 'red', value: '#ef4444', label: 'Red' },
  { id: 'orange', value: '#f97316', label: 'Orange' },
  { id: 'amber', value: '#f59e0b', label: 'Amber' },
  { id: 'green', value: '#22c55e', label: 'Green' },
  { id: 'cyan', value: '#06b6d4', label: 'Cyan' },
  { id: 'blue', value: '#3b82f6', label: 'Blue' },
  { id: 'violet', value: '#8b5cf6', label: 'Violet' },
  { id: 'pink', value: '#ec4899', label: 'Pink' },
  { id: 'rose', value: '#f43f5e', label: 'Rose' },
] as const;

export type WorkspaceIconId = (typeof WORKSPACE_ICONS)[number]['id'];
export type WorkspaceColorId = (typeof WORKSPACE_COLORS)[number]['id'];
