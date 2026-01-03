/**
 * Loading indicator with animated dots
 * Used for streaming messages and pending states
 */
export const LoadingIndicator = (): React.JSX.Element => (
  <span className="inline-flex items-center gap-1">
    <span className="size-1.5 rounded-full bg-current animate-bounce [animation-delay:-0.3s]" />
    <span className="size-1.5 rounded-full bg-current animate-bounce [animation-delay:-0.15s]" />
    <span className="size-1.5 rounded-full bg-current animate-bounce" />
  </span>
);
