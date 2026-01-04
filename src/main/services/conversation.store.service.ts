import type { BrowserWindow } from 'electron';
import { mkdir, readFile, writeFile } from 'fs/promises';
import { homedir } from 'os';
import { join } from 'path';
import {
  conversationIndexSchema,
  conversationSnapshotSchema,
  createConversationOptionsSchema,
  listConversationsOptionsSchema,
} from '../../shared/schemas/conversation.schema.js';
import type { ChatMessage } from '../../shared/types/chat.types.js';
import type {
  AssistantMessage,
  ConversationIndex,
  ConversationMessage,
  ConversationRef,
  ConversationSnapshot,
  CreateConversationOptions,
  ListConversationsOptions,
  SessionConfig,
  ToolMessage,
  UserMessage,
} from '../../shared/types/conversation.types.js';

/**
 * Main window reference for event emission
 */
let mainWindowRef: BrowserWindow | null = null;

/**
 * Set main window for event emission
 */
export const setConversationStoreWindow = (window: BrowserWindow | null): void => {
  mainWindowRef = window;
};

/**
 * Emit conversations changed event
 */
const emitConversationsChanged = (): void => {
  if (mainWindowRef && !mainWindowRef.isDestroyed()) {
    mainWindowRef.webContents.send('conversations:changed');
  }
};

const CONFIG_DIR = join(homedir(), '.agentage');
const CONVERSATIONS_DIR = join(CONFIG_DIR, 'conversations');
const INDEX_FILE = join(CONVERSATIONS_DIR, 'index.json');

/**
 * In-memory cache of index for fast access
 */
let indexCache: ConversationIndex | null = null;

/**
 * Generate unique conversation ID
 */
const generateId = (): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 8);
  return `${timestamp}${random}`;
};

/**
 * Generate unique message ID
 */
const generateMessageId = (): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 9);
  return `msg_${timestamp}_${random}`;
};

/**
 * Get date folder name (YYYY-MM-DD)
 */
const getDateFolder = (date: Date = new Date()): string => date.toISOString().split('T')[0];

/**
 * Derive title from first user message
 */
const deriveTitle = (snapshot: ConversationSnapshot): string => {
  const firstUser = snapshot.messages.find((m) => m.type === 'user');
  if (!firstUser) return 'New conversation';

  // Get first 50 chars, trim at word boundary
  const content = firstUser.content.slice(0, 50);
  const lastSpace = content.lastIndexOf(' ');
  return lastSpace > 30 ? content.slice(0, lastSpace) + '...' : content + '...';
};

/**
 * Initialize conversations directory
 */
export const initConversationStore = async (): Promise<void> => {
  await mkdir(CONVERSATIONS_DIR, { recursive: true });
  await loadIndex();
};

/**
 * Load index from disk (with caching)
 */
const loadIndex = async (): Promise<ConversationIndex> => {
  if (indexCache) return indexCache;

  try {
    const content = await readFile(INDEX_FILE, 'utf-8');
    const parsed = JSON.parse(content) as unknown;
    indexCache = conversationIndexSchema.parse(parsed);
    return indexCache;
  } catch {
    // Create default index if file doesn't exist
    const defaultIndex: ConversationIndex = {
      version: 1,
      conversations: [],
      updatedAt: new Date().toISOString(),
    };
    indexCache = defaultIndex;
    await saveIndex(defaultIndex);
    return defaultIndex;
  }
};

/**
 * Save index to disk
 */
const saveIndex = async (index: ConversationIndex): Promise<void> => {
  index.updatedAt = new Date().toISOString();
  const validated = conversationIndexSchema.parse(index);
  await writeFile(INDEX_FILE, JSON.stringify(validated, null, 2), 'utf-8');
  indexCache = validated;
};

/**
 * Get relative path for conversation file
 */
const getConversationPath = (id: string, date?: Date): string => {
  const folder = getDateFolder(date);
  return `${folder}/${id}.json`;
};

/**
 * Get absolute file path for conversation
 */
const getAbsolutePath = (relativePath: string): string => join(CONVERSATIONS_DIR, relativePath);

/**
 * Load conversation snapshot from disk
 */
const loadSnapshot = async (relativePath: string): Promise<ConversationSnapshot> => {
  const content = await readFile(getAbsolutePath(relativePath), 'utf-8');
  const parsed = JSON.parse(content) as unknown;
  return conversationSnapshotSchema.parse(parsed);
};

/**
 * Save conversation snapshot to disk
 */
const saveSnapshot = async (
  relativePath: string,
  snapshot: ConversationSnapshot
): Promise<void> => {
  const validated = conversationSnapshotSchema.parse(snapshot);
  const absolutePath = getAbsolutePath(relativePath);

  // Ensure date folder exists
  const folder = join(CONVERSATIONS_DIR, relativePath.split('/')[0]);
  await mkdir(folder, { recursive: true });

  await writeFile(absolutePath, JSON.stringify(validated, null, 2), 'utf-8');
};

/**
 * Create new conversation
 */
export const createConversation = async (
  options: CreateConversationOptions
): Promise<ConversationSnapshot> => {
  const validated = createConversationOptionsSchema.parse(options);

  const id = validated.id ?? generateId();
  const now = new Date();
  const relativePath = getConversationPath(id, now);

  const snapshot: ConversationSnapshot = {
    version: '1.0.0',
    format: 'agentage-conversation',
    id,
    title: validated.title ?? 'New conversation',
    session: {
      model: validated.model,
      provider: validated.provider,
      system: validated.system,
      agentId: validated.agentId,
      agentName: validated.agentName,
      tools: validated.tools,
      modelConfig: validated.modelConfig,
    },
    messages: [],
    metadata: {
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      tags: validated.tags ?? [],
      isPinned: false,
    },
  };

  // Save snapshot
  await saveSnapshot(relativePath, snapshot);

  // Update index
  const index = await loadIndex();
  const ref: ConversationRef = {
    id,
    path: relativePath,
    title: snapshot.title,
    agentId: snapshot.session.agentId,
    model: snapshot.session.model,
    messageCount: 0,
    createdAt: snapshot.metadata.createdAt,
    updatedAt: snapshot.metadata.updatedAt,
    tags: snapshot.metadata.tags,
    isPinned: snapshot.metadata.isPinned,
  };

  index.conversations.unshift(ref); // Add to beginning
  await saveIndex(index);

  // Emit change event
  emitConversationsChanged();

  return snapshot;
};

/**
 * Get conversation by ID
 */
export const getConversation = async (id: string): Promise<ConversationSnapshot | null> => {
  const index = await loadIndex();
  const ref = index.conversations.find((c) => c.id === id);

  if (!ref) return null;

  try {
    return await loadSnapshot(ref.path);
  } catch {
    // File missing — remove from index
    index.conversations = index.conversations.filter((c) => c.id !== id);
    await saveIndex(index);
    return null;
  }
};

/**
 * List conversations with filtering and sorting
 */
export const listConversations = async (
  options?: ListConversationsOptions
): Promise<ConversationRef[]> => {
  const validated = options ? listConversationsOptionsSchema.parse(options) : {};
  const index = await loadIndex();

  let results = [...index.conversations];

  // Filter by agent
  if (validated.agentId) {
    results = results.filter((c) => c.agentId === validated.agentId);
  }

  // Filter by model
  if (validated.model) {
    results = results.filter((c) => c.model === validated.model);
  }

  // Filter by tags
  if (validated.tags?.length) {
    results = results.filter((c) => {
      const tags = validated.tags;
      return tags && c.tags && tags.some((tag) => c.tags?.includes(tag));
    });
  }

  // Search in title
  if (validated.search) {
    const query = validated.search.toLowerCase();
    results = results.filter((c) => c.title.toLowerCase().includes(query));
  }

  // Sort pinned first
  if (validated.pinnedFirst) {
    results.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return 0;
    });
  }

  // Sort by field
  const sortBy = validated.sortBy ?? 'updatedAt';
  const sortDirection = validated.sortDirection ?? 'desc';

  results.sort((a, b) => {
    let aVal: string | number;
    let bVal: string | number;

    if (sortBy === 'messageCount') {
      aVal = a.messageCount;
      bVal = b.messageCount;
    } else {
      aVal = a[sortBy];
      bVal = b[sortBy];
    }

    const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  // Pagination
  const skip = validated.skip ?? 0;
  const limit = validated.limit ?? results.length;

  return results.slice(skip, skip + limit);
};

/**
 * Append message to conversation
 * Accepts ChatMessage and converts to ConversationMessage format for storage
 */
export const appendMessage = async (id: string, message: ChatMessage): Promise<void> => {
  const index = await loadIndex();
  const ref = index.conversations.find((c) => c.id === id);

  if (!ref) {
    throw new Error(`Conversation ${id} not found`);
  }

  const snapshot = await loadSnapshot(ref.path);
  const timestamp = message.timestamp || new Date().toISOString();

  // Convert ChatMessage to ConversationMessage for storage
  if (message.role === 'user') {
    // If user message has tool results, add ToolMessage entries
    if (message.toolResults && message.toolResults.length > 0) {
      for (const tr of message.toolResults) {
        const toolMsg: ToolMessage = {
          type: 'tool',
          id: generateMessageId(),
          content: JSON.stringify(tr.result),
          timestamp,
          tool_call_id: tr.id,
          name: tr.name,
          isError: tr.isError,
        };
        snapshot.messages.push(toolMsg);
      }
    }

    // Only add user message if it has actual content or no tool results
    // (Tool results without user content means this was just a tool response carrier)
    if (message.content || !message.toolResults || message.toolResults.length === 0) {
      const userMsg: UserMessage = {
        type: 'user',
        id: generateMessageId(),
        content: message.content,
        timestamp,
        references: message.references,
        config: message.config
          ? {
              model: message.config.model,
              temperature: message.config.modelConfig?.temperature,
              maxTokens: message.config.modelConfig?.maxTokens,
            }
          : undefined,
      };
      snapshot.messages.push(userMsg);
    }
  } else {
    // Assistant message
    const assistantMsg: AssistantMessage = {
      type: 'assistant',
      id: generateMessageId(),
      content: message.content,
      timestamp,
      tool_calls: message.toolCalls?.map((tc) => ({
        id: tc.id,
        name: tc.name,
        input: tc.input,
        status: 'completed',
      })),
      finishReason: message.toolCalls && message.toolCalls.length > 0 ? 'tool_use' : 'end_turn',
    };
    snapshot.messages.push(assistantMsg);
  }

  snapshot.metadata.updatedAt = new Date().toISOString();

  // Update title if this is first user message
  const firstUserMsg = snapshot.messages.find((m) => m.type === 'user');
  if (firstUserMsg && snapshot.messages.filter((m) => m.type === 'user').length === 1) {
    snapshot.title = deriveTitle(snapshot);
  }

  // Save snapshot
  await saveSnapshot(ref.path, snapshot);

  // Update index ref
  ref.messageCount = snapshot.messages.length;
  ref.updatedAt = snapshot.metadata.updatedAt;
  ref.title = snapshot.title;

  await saveIndex(index);

  // Emit change event
  emitConversationsChanged();
};

/**
 * Update usage statistics for conversation
 */
export const updateUsageStats = async (
  id: string,
  inputTokens: number,
  outputTokens: number
): Promise<void> => {
  const index = await loadIndex();
  const ref = index.conversations.find((c) => c.id === id);

  if (!ref) return; // Silent fail for missing conversation

  const snapshot = await loadSnapshot(ref.path);

  // Initialize or update usage
  snapshot.usage ??= { inputTokens: 0, outputTokens: 0, totalTokens: 0 };

  snapshot.usage.inputTokens += inputTokens;
  snapshot.usage.outputTokens += outputTokens;
  snapshot.usage.totalTokens = snapshot.usage.inputTokens + snapshot.usage.outputTokens;

  snapshot.metadata.updatedAt = new Date().toISOString();

  await saveSnapshot(ref.path, snapshot);
};

/**
 * Convert array of ConversationMessages to ChatMessage format
 * Groups tool messages with user messages
 */
const convertMessagesToLegacy = (messages: ConversationMessage[]): ChatMessage[] => {
  const legacy: ChatMessage[] = [];
  const pendingToolResults: ToolMessage[] = [];

  for (const msg of messages) {
    if (msg.type === 'tool') {
      // Collect tool messages
      pendingToolResults.push(msg);
    } else if (msg.type === 'user') {
      // Add user message
      const userMsg: ChatMessage = {
        role: 'user',
        content: msg.content,
        timestamp: msg.timestamp,
        references: msg.references,
        config: msg.config
          ? {
              model: msg.config.model ?? '',
              modelConfig: {
                temperature: msg.config.temperature,
                maxTokens: msg.config.maxTokens,
              },
            }
          : undefined,
      };

      // Attach any pending tool results
      if (pendingToolResults.length > 0) {
        userMsg.toolResults = pendingToolResults.map((tm) => ({
          id: tm.tool_call_id,
          name: tm.name,
          result: JSON.parse(tm.content) as unknown,
          isError: tm.isError,
        }));
        pendingToolResults.length = 0; // Clear
      }

      legacy.push(userMsg);
    } else {
      // Assistant message
      legacy.push({
        role: 'assistant',
        content: msg.content,
        timestamp: msg.timestamp,
        toolCalls: msg.tool_calls?.map((tc) => ({
          id: tc.id,
          name: tc.name,
          input: tc.input,
        })),
      });
    }
  }

  return legacy;
};

/**
 * Restore conversation to in-memory format for continuing the chat
 */
export const restoreConversation = async (
  id: string
): Promise<{
  id: string;
  messages: ChatMessage[];
  config: SessionConfig;
  createdAt: string;
  updatedAt: string;
} | null> => {
  const snapshot = await getConversation(id);
  if (!snapshot) return null;

  // Convert stored messages to runtime format
  const legacyMessages = convertMessagesToLegacy(snapshot.messages);

  // Return in the format expected by chat service
  return {
    id: snapshot.id,
    messages: legacyMessages,
    config: snapshot.session,
    createdAt: snapshot.metadata.createdAt,
    updatedAt: snapshot.metadata.updatedAt,
  };
};
