/**
 * Navigation configuration types
 */

/**
 * Navigation menu item
 */
export interface NavigationItem {
  /** Unique identifier for the menu item */
  id: string;
  /** Display title of the menu item */
  title: string;
  /** Icon component name or element */
  icon: string;
  /** Route path to navigate to */
  path: string;
  /** Optional badge count or indicator */
  badge?: number;
  /** Whether the item is disabled */
  disabled?: boolean;
}

/**
 * Navigation menu group
 */
export interface NavigationGroup {
  /** Unique identifier for the group */
  id: string;
  /** Display label for the group (can be empty for no label) */
  label: string;
  /** Menu items in this group */
  items: NavigationItem[];
}

/**
 * Complete navigation configuration
 */
export interface NavigationConfig {
  /** All navigation groups */
  groups: NavigationGroup[];
}
