# Agentage Desktop - Development Instructions

## **Project Philosophy**

- Build a lightweight, local Electron app for managing AI agents.
- Prioritize simplicity, usability, and security.
- Simple working solution first, then optimize.
- Less is better: DO NOT add unnecessary features or complexity.
- DO NOT OVERCOMPLICATED SOLUTIONS - ALWAYS FIND THE SIMPLEST ELEGANT WAY.

## **Project Overview**

- Electron desktop client for Agentage
- Run, edit and manage AI agents locally
- TypeScript + React + Vite + Electron
- Cross-platform: Linux, macOS, Windows

## **Project Agreements**

- Default branch: `master`
- Repository: `agentage/desktop`
- Branch names: `feature/*`, `bugfix/*`, `hotfix/*`, `setup-*`
- Commits: `feat:`, `fix:`, `chore:` (max 72 chars)
- Verifications: `npm run verify` (type-check + lint + build + test)

## **Publishing**

- Cross-platform builds via electron-builder
- Artifacts published to GitHub Releases on tag push

## **Release Strategy**

- 🎯 **MINIMAL FIRST**: Simple agent management UI
- 🚫 **No Over-Engineering**: Focus on core workflows
- ⚡ **Essential Only**: Run, edit, list agents

## **Rules**

- 📊 Use icons/tables for structured output
- 📁 NO extra docs unless explicitly asked
- 🐙 GitHub: owner `agentage`, repo `desktop`
- ⚡ Prefer function calls over terminal commands
- 📂 Source code in `src/` directory

## **Coding Standards**

### TypeScript

- 🚫 No `any` type - explicit types always
- 📤 Named exports only (no default exports)
- 📏 Files <200 lines, functions <20 lines
- 🔄 Functional: arrow functions, async/await, destructuring
- 🏗️ Interfaces over classes
- ✅ ESM modules (`type: "module"`)

### React

- ⚛️ Function components only (no class components)
- 🪝 Custom hooks for shared logic
- 📦 Props interfaces for all components
- 🎨 CSS variables for theming

### Naming

- **Interfaces**: `AgentConfig`, `AppConfig`, `IpcChannels`
- **Types**: `AppState`, `RunResult`
- **Components**: `AgentList.tsx`, `AgentRunner.tsx`
- **Files**: `*.service.ts`, `*.schema.ts`, `*.types.ts`, `*.test.ts`

## **Tech Stack**

- **Language**: TypeScript 5.3+ (strict mode)
- **Framework**: Electron 33+
- **UI**: React 18+ (strict mode)
- **Bundler**: Vite 6+
- **Validation**: Zod
- **Testing**: Jest 30+ with ts-jest
- **E2E**: Playwright
- **Linting**: ESLint 9+ (flat config)
- **Formatting**: Prettier
- **Package Manager**: npm

## **Node Requirements**

- Node.js >= 20.0.0
- npm >= 10.0.0

## **Architecture Patterns**

### Main Process (Electron)

```typescript
// IPC handler registration
ipcMain.handle('agents:list', async () => listAgents());
ipcMain.handle('agents:run', async (_event, name, prompt) => runAgent(name, prompt));
```

### Preload (Context Bridge)

```typescript
// Expose safe API to renderer
contextBridge.exposeInMainWorld('agentage', {
  agents: {
    list: () => ipcRenderer.invoke('agents:list'),
    run: (name, prompt) => ipcRenderer.invoke('agents:run', name, prompt),
  },
});
```

### Renderer (React)

```typescript
// Use exposed API
const agents = await window.agentage.agents.list();
```

## **IPC Naming Conventions**

### Channel Pattern: `{domain}[.subdomain]:{action}`

- Use **dots** (`.`) for subdomain separation
- Use **colons** (`:`) before action
- Actions: `list`, `get`, `add`, `update`, `remove`, `load`, `save`, `validate`

Examples:

```typescript
'agents:list'; // Simple domain:action
'agents:run'; // Simple domain:action
'chat.models:get'; // Subdomain: chat domain, models subdomain, get action
'chat.tools:get'; // Subdomain: chat domain, tools subdomain, get action
'chat.context:get'; // Subdomain: chat domain, context subdomain, get action
'models.providers:load'; // Subdomain: models domain, providers subdomain, load action
'models.providers:save'; // Subdomain: models domain, providers subdomain, save action
```

### Event Pattern: `{domain}[.subdomain]:changed`

- Always use **`:changed`** suffix for state change events
- Consistent naming for real-time updates

Examples:

```typescript
'models:changed'; // Models list updated
'tools:changed'; // Tools settings updated
'workspace:changed'; // Workspace list updated
```

### Action Naming Rules

- **Collections**: `list`, `getAll`
- **Single item**: `get`, `add`, `update`, `remove`
- **State**: `load`, `save`, `validate`
- **Operations**: `send`, `cancel`, `clear`, `browse`, `switch`

## **Workspace Structure**

```
src/
  main/               # Electron main process
    index.ts          # App entry, window creation
    preload.ts        # Context bridge (IPC)
    ipc-handlers.ts   # IPC handler registration
    services/         # Business logic
  renderer/           # React app (UI)
    main.tsx          # React entry
    App.tsx           # Main component
    components/       # UI components
    styles/           # CSS files
  shared/             # Shared types & schemas
    schemas/          # Zod validation schemas
    types/            # TypeScript type definitions
```

## **Scripts**

All packages support:

- `npm run dev` - Start dev (renderer + main)
- `npm run build` - Build TypeScript + Vite
- `npm run type-check` - TypeScript validation
- `npm run lint` - ESLint check
- `npm run lint:fix` - Auto-fix linting
- `npm run test` - Run Jest tests
- `npm run test:watch` - Watch mode
- `npm run test:coverage` - Coverage report
- `npm run verify` - All checks
- `npm run clean` - Clean build artifacts
- `npm run package` - Cross-platform packaging

## **Quality Gates**

- ✅ Type check must pass
- ✅ Linting must pass (no warnings)
- ✅ All tests must pass
- ✅ Coverage >= 70% (branches, functions, lines, statements)
- ✅ Build must succeed

## **Security**

- 🔒 Context isolation enabled
- 🔒 Node integration disabled in renderer
- 🔒 Preload scripts for safe IPC
- 🔒 Validate all user input with Zod
- 🔒 No secrets in repo (use `~/.agentage/config.json`)
