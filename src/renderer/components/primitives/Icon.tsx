import { cn } from '../../lib/utils.js';
import { IconContainer } from '../icon-container.js';
import * as Icons from '../icons.js';

type IconName =
  | 'home'
  | 'bot'
  | 'list-checks'
  | 'wrench'
  | 'brain'
  | 'settings'
  | 'check-circle'
  | 'alert-circle';

type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type IconColor = 'blue' | 'green' | 'amber' | 'violet' | 'rose' | 'cyan' | 'muted';

export interface IconProps {
  name: IconName;
  size?: IconSize;
  color?: IconColor;
  bg?: boolean;
  className?: string;
}

const iconMap: Record<IconName, React.ComponentType> = {
  home: Icons.HomeIcon,
  bot: Icons.BotIcon,
  'list-checks': Icons.ListChecksIcon,
  wrench: Icons.WrenchIcon,
  brain: Icons.BrainIcon,
  settings: Icons.SettingsIcon,
  'check-circle': Icons.CheckCircleIcon,
  'alert-circle': Icons.AlertCircleIcon,
};

const sizeMap: Record<IconSize, string> = {
  xs: 'size-3',
  sm: 'size-4',
  md: 'size-5',
  lg: 'size-6',
  xl: 'size-8',
};

const colorMap: Record<IconColor, string> = {
  blue: 'text-blue-500',
  green: 'text-green-500',
  amber: 'text-amber-500',
  violet: 'text-violet-500',
  rose: 'text-rose-500',
  cyan: 'text-cyan-500',
  muted: 'text-muted-foreground',
};

const bgSizeMap: Record<IconSize, 'sm' | 'md' | 'lg'> = {
  xs: 'sm',
  sm: 'sm',
  md: 'md',
  lg: 'lg',
  xl: 'lg',
};

/**
 * Icon - Unified icon component
 *
 * Purpose: Replace direct icon imports with name-based lookup
 * Features: Size variants, color variants, optional background container
 *
 * @example
 * <Icon name="bot" color="blue" size="sm" bg />
 * <Icon name="settings" size="md" />
 */
export const Icon = ({ name, size = 'md', color, bg, className }: IconProps): React.JSX.Element => {
  const IconComponent = iconMap[name] as React.ComponentType | undefined;

  if (!IconComponent) {
    console.warn(`Icon "${name}" not found`);
    return <span />;
  }

  const icon = (
    <div className={cn(!bg && color && colorMap[color], !bg && sizeMap[size], className)}>
      <IconComponent />
    </div>
  );

  if (bg && color) {
    return (
      <IconContainer color={color} size={bgSizeMap[size]} className={className}>
        {icon}
      </IconContainer>
    );
  }

  return icon;
};
