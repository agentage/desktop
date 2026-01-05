import { FileTextIcon } from '../components/index.js';

/**
 * ContextPage - Document collections management
 *
 * Purpose: Manage document collections for agent context/RAG
 * Features: Upload documents, create collections, manage embeddings
 */
export const ContextPage = (): React.JSX.Element => (
  <div className="flex-1 p-4 h-full">
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-md bg-primary/10">
          <FileTextIcon />
        </div>
        <h1 className="text-base font-semibold text-foreground">Context</h1>
      </div>

      {/* Content */}
      <div className="text-sm text-muted-foreground">
        <p>Document collections - placeholder</p>
      </div>
    </div>
  </div>
);
