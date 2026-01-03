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

| Feature                    | Description                                     |
| -------------------------- | ----------------------------------------------- |
| 🔍 **Agent Discovery**     | Browse and manage local agent files             |
| 🤖 **Chat Interface**      | Claude integration with streaming responses     |
| 🔐 **OAuth Authentication**| Claude and Codex provider connections           |
| 🛠️ **Tools System**        | Extensible tool handlers and converters         |
| 📁 **Workspace Management**| Organize agents across multiple workspaces      |
| 📦 **Cross-Platform**      | Windows 10+, macOS 11+, Linux (Ubuntu 20.04+)   |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                Desktop Application (Electron)                │
│  ┌────────────────────────────────────────────────────────┐ │
│  │         React + TypeScript Frontend (Renderer)         │ │
│  │  • Chat Interface        • Agent Management            │ │
│  │  • Tools Settings        • Workspace UI                │ │
│  └─────────────────────────┬──────────────────────────────┘ │
│                            │ IPC                             │
│  ┌─────────────────────────▼──────────────────────────────┐ │
│  │              Electron Main Process                      │ │
│  │  • File System Ops       • OAuth Flow (dynamic port)   │ │
│  │  • Chat Service          • Model Providers             │ │
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
| **Validation** | Zod              | 3.25+            |
| **Testing**    | Jest             | 30+              |
| **Linting**    | ESLint           | 9+ (flat config) |
| **Packaging**  | electron-builder | 25+              |
| **AI**         | Anthropic SDK    | 0.71+            |
| **Git**        | simple-git       | 3.30+            |

---

## 📁 Project Structure

```
src/
├── main/                 # Electron main process
│   ├── index.ts          # App entry, window creation
│   ├── preload.ts        # Context bridge (IPC)
│   ├── ipc-handlers.ts   # IPC handler registration
│   └── services/         # Business logic services
├── renderer/             # React app (UI)
│   ├── main.tsx          # React entry point
│   ├── App.tsx           # Main component
│   ├── components/       # UI components
│   └── styles/           # CSS files
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

# Start Vite dev server (renderer only)
npm run dev

# Build and run full Electron app
npm run dev:electron
```

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

| Command                 | Description                                |
| ----------------------- | ------------------------------------------ |
| `npm run dev`           | Start Vite dev server (renderer)           |
| `npm run dev:electron`  | Build + run Electron app                   |
| `npm run build`         | Production build                           |
| `npm run type-check`    | TypeScript validation                      |
| `npm run lint`          | ESLint check                               |
| `npm run lint:fix`      | Auto-fix lint issues                       |
| `npm run test`          | Run Jest tests                             |
| `npm run test:coverage` | Coverage report                            |
| `npm run verify`        | Full CI check (type + lint + build + test) |
| `npm run package`       | Cross-platform packaging                   |
| `npm run clean`         | Clean build artifacts                      |

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
  "tokens": [],
  "settings": {}
}
```

### Agent Sources

| Source       | Path                             | Description              |
| ------------ | -------------------------------- | ------------------------ |
| Local        | `~/.agentage/agents/`            | User-managed agent files |
| Workspaces   | `~/.agentage/{userId}/`          | User-specific workspaces |

---

## 🔒 Security

- ✅ Context isolation enabled
- ✅ Node integration disabled in renderer
- ✅ Preload scripts for safe IPC
- ✅ Zod validation on all inputs
- ✅ OAuth token storage in config
- ✅ No secrets in repository

---

## 🧪 Testing

```bash
# Run all tests
npm run test

# Watch mode
npm run test:watch

# Coverage report (70% threshold)
npm run test:coverage
```

**Coverage Requirements**: 70% for branches, functions, lines, and statements.

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
| [agentage/requirements](https://github.com/agentage/requirements)     | Top-level specs & planning                       |

---

## 📄 License

MIT © 2025 Agentage
