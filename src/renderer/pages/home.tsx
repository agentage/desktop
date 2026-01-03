import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVerticalIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import type { Layout, WidgetInstance, WidgetPlacement } from '../../shared/types/widget.types.js';
import { cn } from '../lib/utils.js';
import { createWidgetHost } from '../lib/widget-host.js';
import { loadWidget } from '../lib/widget-loader.js';

interface OutletContext {
  isEditMode: boolean;
  onLayoutChange: (widgets: WidgetPlacement[], hasChanges: boolean) => void;
  saveSuccessTrigger?: number;
}

/**
 * Sortable widget wrapper component
 */
interface SortableWidgetProps {
  placement: WidgetPlacement;
  widget: WidgetInstance;
  isEditMode: boolean;
  gridColumns: number;
  rowHeight: number;
  widgetHost: import('../../shared/types/widget.types.js').WidgetHost;
}

const SortableWidget = ({
  placement,
  widget,
  isEditMode,
  widgetHost,
}: SortableWidgetProps): React.JSX.Element => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: placement.id,
    disabled: !isEditMode,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    gridColumn: `span ${String(placement.size.w)}`,
    gridRow: `span ${String(placement.size.h)}`,
  };

  const Component = widget.component;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'rounded-xl border border-border bg-card p-4 relative',
        isEditMode && 'cursor-move hover:border-primary/50 hover:shadow-md select-none',
        isDragging && 'opacity-50 z-50'
      )}
    >
      {/* Drag handle - visible only in edit mode */}
      {isEditMode && (
        <div
          {...attributes}
          {...listeners}
          className={cn(
            'absolute top-2 right-2 p-1.5 rounded-md',
            'bg-muted hover:bg-accent cursor-grab active:cursor-grabbing',
            'text-muted-foreground hover:text-foreground',
            'transition-colors z-10'
          )}
          title="Drag to reorder"
        >
          <GripVerticalIcon className="size-4" />
        </div>
      )}
      <Component host={widgetHost} />
    </div>
  );
};

/**
 * Home page - Dashboard overview with widgets
 * Route: /
 *
 * Purpose: Landing page after login with widget-based layout
 * Features: Dynamic widget loading from layout configuration
 */
export const HomePage = (): React.JSX.Element => {
  const navigate = useNavigate();
  const widgetHost = createWidgetHost(navigate);
  const { isEditMode, onLayoutChange, saveSuccessTrigger } = useOutletContext<OutletContext>();
  const [layout, setLayout] = useState<Layout | null>(null);
  const [widgets, setWidgets] = useState<Map<string, WidgetInstance>>(new Map());
  const [loading, setLoading] = useState(true);
  const [widgetOrder, setWidgetOrder] = useState<WidgetPlacement[]>([]);
  const [initialOrder, setInitialOrder] = useState<WidgetPlacement[]>([]);

  useEffect(() => {
    const init = async (): Promise<void> => {
      try {
        // Load layout from main process
        const result = await window.agentage.widgets.loadLayout('home');
        if (!result) {
          setLoading(false);
          return;
        }

        setLayout(result.layout);
        setWidgetOrder(result.layout.widgets);
        setInitialOrder(result.layout.widgets);

        // Import components for widgets in layout
        const loaded = new Map<string, WidgetInstance>();
        for (const placement of result.layout.widgets) {
          const widget = await loadWidget(placement.id);
          if (widget) loaded.set(placement.id, widget);
        }
        setWidgets(loaded);
      } catch (error) {
        console.error('Failed to initialize homepage:', error);
      } finally {
        setLoading(false);
      }
    };

    void init();
  }, []);

  // Notify parent about layout changes
  useEffect(() => {
    if (widgetOrder.length > 0) {
      // Check if order has changed from initial
      const hasChanges =
        JSON.stringify(widgetOrder.map((w) => w.id)) !==
        JSON.stringify(initialOrder.map((w) => w.id));
      onLayoutChange(widgetOrder, hasChanges);
    }
  }, [widgetOrder, initialOrder, onLayoutChange]);

  // Reset to initial order when exiting edit mode
  useEffect(() => {
    if (!isEditMode && initialOrder.length > 0) {
      setWidgetOrder(initialOrder);
    }
  }, [isEditMode, initialOrder]);

  // Update initial order when save succeeds
  useEffect(() => {
    if (saveSuccessTrigger && saveSuccessTrigger > 0) {
      setInitialOrder(widgetOrder);
    }
  }, [saveSuccessTrigger, widgetOrder]);

  // dnd-kit sensors for mouse and keyboard
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent): void => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setWidgetOrder((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!layout) {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <div className="text-muted-foreground">No layout available</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={widgetOrder.map((w) => w.id)} strategy={rectSortingStrategy}>
          <div
            className="grid gap-4"
            style={{
              gridTemplateColumns: `repeat(${String(layout.grid.columns)}, 1fr)`,
              gridAutoRows: `${String(layout.grid.rowHeight)}px`,
            }}
          >
            {widgetOrder.map((placement) => {
              const widget = widgets.get(placement.id);
              if (!widget) return null;

              return (
                <SortableWidget
                  key={placement.id}
                  placement={placement}
                  widget={widget}
                  isEditMode={isEditMode}
                  gridColumns={layout.grid.columns}
                  rowHeight={layout.grid.rowHeight}
                  widgetHost={widgetHost}
                />
              );
            })}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};
