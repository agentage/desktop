/**
 * Drop zone component for adding workspaces
 * Re-exports the shared DropZone component with workspace-specific defaults
 */
import { DropZone as BaseDropZone } from '../../components/ui/index.js';

export interface DropZoneProps {
  onDrop: (path: string) => void;
  onBrowse: () => void;
}

export const DropZone = ({ onDrop, onBrowse }: DropZoneProps): React.JSX.Element => (
  <BaseDropZone onDrop={onDrop} onBrowse={onBrowse} text="Drop folder here" hint="or browse" />
);
