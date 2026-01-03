import { useEffect, useState } from 'react';
import type { Layout, WidgetInstance } from '../../shared/types/widget.types.js';
import { widgetHost } from '../lib/widget-host.js';
import { loadWidget } from '../lib/widget-loader.js';

/**
 * Home page - Dashboard overview with widgets
 * Route: /
 *
 * Purpose: Landing page after login with widget-based layout
 * Features: Dynamic widget loading from layout configuration
 */
export const HomePage = (): React.JSX.Element => {
  const [layout, setLayout] = useState<Layout | null>(null);
  const [widgets, setWidgets] = useState<Map<string, WidgetInstance>>(new Map());
  const [loading, setLoading] = useState(true);

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
      <div
        className="grid gap-4"
        style={{
          gridTemplateColumns: `repeat(${String(layout.grid.columns)}, 1fr)`,
          gridAutoRows: `${String(layout.grid.rowHeight)}px`,
        }}
      >
        {layout.widgets.map((placement) => {
          const widget = widgets.get(placement.id);
          if (!widget) return null;

          const Component = widget.component;

          return (
            <div
              key={placement.id}
              className="rounded-xl border border-border bg-card p-4"
              style={{
                gridColumn: `span ${String(placement.size.w)}`,
                gridRow: `span ${String(placement.size.h)}`,
              }}
            >
              <Component host={widgetHost} />
            </div>
          );
        })}
      </div>
    </div>
  );
};
