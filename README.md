# Agentage Desktop

> **Native desktop client for managing and executing AI agents** — part of the Agentage ecosystem.

[![CI](https://github.com/agentage/desktop/actions/workflows/ci.yml/badge.svg)](https://github.com/agentage/desktop/actions/workflows/ci.yml)
[![Release](https://github.com/agentage/desktop/actions/workflows/release.yml/badge.svg)](https://github.com/agentage/desktop/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-linux%20%7C%20macos%20%7C%20windows-lightgrey)](https://github.com/agentage/desktop/releases)

---

## 🎯 Vision

> _"Agents should be as simple as writing a README, as portable as a Docker container, and as shareable as an npm package."_

Agentage Desktop is the **visual interface** for the Agentage ecosystem — discover, create, execute, and publish AI agents from a native desktop application.

---

## ✨ Key Features

| Feature                     | Description                                          |
| --------------------------- | ---------------------------------------------------- |
| 🔍 **Agent Management**     | Browse, create, and manage local agent files         |
| 🤖 **Chat Interface**       | Anthropic Claude integration with streaming support  |
| 🔐 **OAuth Connections**    | Claude (Anthropic) and Codex (OpenAI) providers      |
| 🛠️ **Tools System**         | Extensible widget system and tool handlers           |
| 📁 **Workspace Management** | Organize agents across multiple workspaces           |
| 🎨 **Modern UI**            | React-based interface with Tailwind CSS and Radix UI |
| 📦 **Cross-Platform**       | Windows 10+, macOS 11+, Linux (Ubuntu 20.04+)        |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                Desktop Application (Electron)                │
│  ┌────────────────────────────────────────────────────────┐ │
│  │         React + TypeScript Frontend (Renderer)         │ │
│  │  • Chat Interface        • Agent Management            │ │
│  │  • Tools Configuration   • Workspace Management        │ │
│  │  • Model Settings        • OAuth Connections           │ │
│  └─────────────────────────┬──────────────────────────────┘ │
│                            │ IPC (Context Bridge)            │
│  ┌─────────────────────────▼──────────────────────────────┐ │
│  │              Electron Main Process                      │ │
│  │  • File System Operations • OAuth Flow (dynamic port)  │ │
│  │  • Chat Service           • Model Providers            │ │
│  │  • Workspace Service      • Context Management         │ │
│  │  • Widget System          • Tool Handlers              │ │
│  └─────────────────────────────────────────────────────────┘ │
└───────────────────────────────┬─────────────────────────────┘
                                │
           ┌────────────────────┼────────────────────┐
           ▼                    ▼                    ▼
    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
    │ Backend API  │    │  OAuth APIs  │    │ ~/.agentage/ │
    │ agentage.io  │    │ Claude/Codex │    │ Local Files  │
    └──────────────┘    └──────────────┘    └──────────────┘
```

---

## 🛠️ Tech Stack

| Category       | Technology       | Version          |
| -------------- | ---------------- | ---------------- |
| **Desktop**    | Electron         | 33+              |
| **UI**         | React            | 18+              |
| **Language**   | TypeScript       | 5.9+ (strict)    |
| **Bundler**    | Vite             | 6+               |
| **Validation** | Zod              | 4.3+             |
| **Styling**    | Tailwind CSS     | 4+               |
| **Components** | Radix UI         | Latest           |
| **Testing**    | Jest             | 30+              |

---

## 📁 Project Structure

```
src/
├── main/                 # Electron main process
│   ├── index.ts          # App entry, window creation
│   ├── preload.ts        # Context bridge (IPC)
│   ├── ipc/              # IPC layer
│   │   ├── handlers/     # IPC handler implementations
│   │   ├── registry.ts   # Handler registration
│   │   └── types.ts      # IPC type definitions
│   ├── services/         # Business logic services
│   │   ├── oauth/        # OAuth provider implementations
│   │   └── *.service.ts  # Core services
│   └── tools/            # Tool implementations
├── renderer/             # React app (UI)
│   ├── app/              # App bootstrap & routing
│   ├── components/       # Reusable UI components
│   │   ├── primitives/   # Base components (Icon, Text)
│   │   └── layout/       # Layout components (Flex, Grid, Stack)
│   ├── config/           # App configuration
│   ├── features/         # Feature-specific components
│   │   ├── chat/         # Chat interface components
│   │   └── composer/     # Message composer
│   ├── guards/           # Route guards (Auth, Electron)
│   ├── hooks/            # Custom React hooks
│   ├── layouts/          # Page layouts & chrome
│   ├── lib/              # Utility libraries & widget system
│   ├── pages/            # Page components
│   │   ├── agents/       # Agent management pages
│   │   ├── auth/         # Authentication pages
│   │   ├── settings/     # Settings pages
│   │   ├── tools/        # Tools configuration
│   │   └── workspaces/   # Workspace management
│   ├── styles/           # Global CSS
│   └── widgets/          # Dashboard widgets
└── shared/               # Shared types & schemas
    ├── schemas/          # Zod validation schemas
    └── types/            # TypeScript type definitions
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js >= 20.0.0
- npm >= 10.0.0

### Development

```bash
# Install dependencies
npm install

# Start development (Vite dev server + Electron app)
# The plugin automatically starts Electron after Vite is ready
npm run dev

# Alternative: Build once and run Electron (no hot reload)
npm run dev:electron
```

**Note:** `npm run dev` uses `vite-plugin-electron` which automatically:
1. Starts the Vite dev server for the renderer process
2. Builds the main and preload scripts
3. Launches Electron when ready
4. Enables hot-reload for both main and renderer processes

The app will wait for the Vite dev server to be ready before loading, preventing common connection issues.

### Build & Package

```bash
# Build for production
npm run build

# Package for current platform
npm run package

# Package for specific platforms
npm run package:linux
npm run package:mac
npm run package:win
```

---

## 📋 Scripts

| Command                 | Description                                         |
| ----------------------- | --------------------------------------------------- |
| `npm run dev`           | Start Vite + Electron with hot reload               |
| `npm run dev:electron`  | Build and run Electron (no hot reload)              |
| `npm run build`         | Production build                                    |
| `npm run type-check`    | TypeScript validation                               |
| `npm run lint`          | ESLint check                                        |
| `npm run lint:fix`      | Auto-fix lint issues                                |
| `npm run test`          | Run Jest tests                                      |
| `npm run verify`        | Full CI check (type + lint + build + test)          |
| `npm run package`       | Cross-platform packaging                            |

---

## ⚙️ Configuration

Local config file: `~/.agentage/config.json`

```json
{
  "auth": {
    "token": "<jwt-token>",
    "expiresAt": "2025-12-14T00:00:00Z",
    "user": {
      "id": "user-id",
      "email": "user@example.com"
    }
  },
  "registry": {
    "url": "https://dev.agentage.io"
  },
  "deviceId": "unique-device-id",
  "settings": {}
}
```

### Agent Sources

| Source     | Path                  | Description              |
| ---------- | --------------------- | ------------------------ |
| Local      | `~/.agentage/agents/` | User-managed agent files |
| Workspaces |                       | User-specific workspaces |

---

## 🔒 Security

- ✅ Context isolation enabled
- ✅ Zod validation on all inputs
- ✅ OAuth token storage in config
- ✅ No secrets in repository

---

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Follow coding standards (see below)
4. Run `npm run verify` before committing
5. Open a Pull Request

### Coding Standards

- 📤 **Named exports only** (no default exports)
- 🚫 **No `any` type** — explicit types always
- ⚛️ **Function components** — no class components
- 📏 **Files < 200 lines**, functions < 20 lines
- 🏷️ **Naming**: `PascalCase` for interfaces/types, `camelCase` for functions

---

## 🔗 Ecosystem

| Repository                                                            | Description                                      |
| --------------------------------------------------------------------- | ------------------------------------------------ |
| [agentage/agentkit](https://github.com/agentage/agentkit)             | SDK monorepo (`@agentage/sdk`, `@agentage/core`) |
| [agentage/cli](https://github.com/agentage/cli)                       | CLI tool (`@agentage/cli`)                       |
| [agentage/web](https://github.com/agentage/web)                       | Website & API (agentage.io)                      |
| [agentage/infrastructure](https://github.com/agentage/infrastructure) | Terraform + Docker configs                       |

---

## 📄 License

MIT © 2026 Agentage
