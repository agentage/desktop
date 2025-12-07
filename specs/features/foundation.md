# Foundation - Implementation Plan

**Feature**: Foundation Setup  
**Status**: ✅ COMPLETE  
**Date**: December 7, 2025  
**Priority**: P0 (Critical)

---

## 📋 Overview

This document describes the foundation setup for the Agentage Desktop application - the infrastructure required before any feature development begins.

### Scope

| Component        | Status  | Description                       |
| ---------------- | ------- | --------------------------------- |
| CI/CD Pipeline   | ✅ Done | GitHub Actions for PR validation  |
| Release Workflow | ✅ Done | Automated cross-platform releases |
| PR Validation    | ✅ Done | Type-check, lint, test gates      |
| Build System     | ✅ Done | Vite + Electron builder           |
| Empty App Shell  | ✅ Done | Minimal working Electron app      |

---

## 🔗 Alignment with Top-Level Strategy

From `IMPLEMENTATION_PLAN.md`:

- **Phase 5**: Desktop App (Weeks 5-8) - 🟡 IN PROGRESS (10%)
- **Week 1 Goal**: Project setup + Authentication
- **Target**: Electron project initialized

This foundation completes the **project initialization** portion of Week 1.

---

## 🏗️ Architecture

### Project Structure

```
desktop/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml           # PR validation + cross-platform build
│   │   └── release.yml      # Tag-triggered release
│   ├── dependabot.yml       # Automated dependency updates
│   └── copilot-instructions.md
├── src/
│   ├── main/                # Electron main process
│   │   ├── index.ts         # App entry, window creation
│   │   ├── preload.ts       # Context bridge (IPC)
│   │   ├── ipc-handlers.ts  # IPC handler registration
│   │   └── services/        # Business logic
│   ├── renderer/            # React app (UI)
│   │   ├── main.tsx         # React entry
│   │   ├── App.tsx          # Main component
│   │   ├── components/      # UI components
│   │   └── styles/          # CSS files
│   └── shared/              # Shared types & schemas
│       ├── schemas/         # Zod validation schemas
│       └── types/           # TypeScript type definitions
├── package.json
├── tsconfig.json
├── vite.config.ts
├── jest.config.js
└── eslint.config.js
```

### Tech Stack

| Category   | Technology | Version          |
| ---------- | ---------- | ---------------- |
| Desktop    | Electron   | 33+              |
| UI         | React      | 18+              |
| Language   | TypeScript | 5.9+             |
| Bundler    | Vite       | 6+               |
| Validation | Zod        | 3.25+            |
| Testing    | Jest       | 30+              |
| Linting    | ESLint     | 9+ (flat config) |

---

## ✅ Completed Components

### 1. CI/CD Pipeline (`.github/workflows/ci.yml`)

**Triggers**:

- Push to `main`/`master` branches
- Pull requests to `main`/`master`

**Jobs**:

#### Job 1: Lint & Test

- **Matrix**: Node.js 20.x, 22.x
- **Steps**:
  1. Checkout code
  2. Setup Node.js with npm cache
  3. Install dependencies (`npm ci`)
  4. Type check (`npm run type-check`)
  5. Lint (`npm run lint`)
  6. Test with coverage (`npm run test -- --coverage`)
  7. Upload coverage to Codecov (Node 20.x only)

#### Job 2: Build (Cross-Platform)

- **Matrix**: ubuntu-latest, macos-latest, windows-latest
- **Depends on**: lint-and-test job
- **Steps**:
  1. Checkout code
  2. Setup Node.js
  3. Install dependencies
  4. Build (`npm run build`)
  5. Package for platform (Linux/macOS/Windows)
  6. Upload artifacts (7-day retention)

### 2. Release Workflow (`.github/workflows/release.yml`)

**Triggers**:

- Push tags matching `v*` pattern

**Process**:

1. Build on all 3 platforms in parallel
2. Package platform-specific installers:
   - **Linux**: AppImage, deb
   - **macOS**: dmg, zip
   - **Windows**: nsis, portable
3. Create GitHub Release (draft)
4. Upload all artifacts to release

**Artifacts Published**:

```
release/
├── Agentage-*.AppImage    # Linux
├── Agentage-*.deb         # Linux
├── Agentage-*.dmg         # macOS
├── Agentage-*.zip         # macOS
├── Agentage-*.exe         # Windows (NSIS)
└── Agentage-*-portable.exe # Windows (Portable)
```

### 3. PR Validation (Quality Gates)

**Required Checks** (all must pass):

- ✅ Type check (`tsc --noEmit`)
- ✅ Lint (`eslint` with strict TypeScript rules)
- ✅ Tests (`jest` with 70% coverage threshold)
- ✅ Build (cross-platform verification)

**Coverage Thresholds**:

```javascript
coverageThreshold: {
  global: {
    branches: 70,
    functions: 70,
    lines: 70,
    statements: 70,
  },
}
```

### 4. Build System

**Scripts**:

```json
{
  "dev": "vite", // Dev server (renderer)
  "dev:electron": "npm run build && electron .", // Full Electron dev
  "build": "tsc && vite build", // Production build
  "build:main": "tsc -p tsconfig.main.json",
  "build:renderer": "vite build",
  "verify": "npm run type-check && npm run lint && npm run build && npm run test",
  "package": "electron-builder", // All platforms
  "package:linux": "electron-builder --linux",
  "package:mac": "electron-builder --mac",
  "package:win": "electron-builder --win"
}
```

**Build Output**:

```
dist/
├── main/        # Electron main process
├── preload/     # Preload scripts
└── renderer/    # React app (static files)

release/         # Platform installers
```

### 5. Empty App Shell

**Main Process** (`src/main/index.ts`):

- Window creation (1200x800, min 800x600)
- Preload script with context isolation
- Dev mode detection (loads localhost:5173 or file)
- IPC handler registration

**Renderer** (`src/renderer/App.tsx`):

- Basic React app structure
- Agent list sidebar (placeholder)
- Agent runner content area (placeholder)
- CSS styling foundation

**IPC Bridge** (`src/main/preload.ts`):

- Context bridge for safe renderer-main communication
- `window.agentage.agents.list()` API
- `window.agentage.agents.run()` API

---

## 📊 Verification Commands

```bash
# Full verification (CI equivalent)
npm run verify

# Individual checks
npm run type-check    # TypeScript validation
npm run lint          # ESLint
npm run test          # Jest tests
npm run build         # Production build

# Development
npm run dev           # Vite dev server (renderer only)
npm run dev:electron  # Full Electron dev mode
```

---

## 🔒 Security Configuration

### Electron Security

- ✅ Context isolation enabled
- ✅ Node integration disabled in renderer
- ✅ Preload scripts for safe IPC
- ✅ CSP headers (to be configured)

### Dependency Management

- ✅ Dependabot enabled (weekly updates)
- ✅ Grouped updates (dev, electron, react)
- ✅ Major version updates ignored (manual review)
- ✅ GitHub Actions ecosystem monitoring

---

## 📈 Metrics

### CI Performance Targets

| Metric                    | Target   | Status |
| ------------------------- | -------- | ------ |
| Lint + Test               | < 2 min  | ✅     |
| Build (single platform)   | < 5 min  | ✅     |
| Package (single platform) | < 10 min | ✅     |
| Full CI (all platforms)   | < 15 min | ✅     |

### Code Quality Gates

| Gate              | Threshold | Enforced |
| ----------------- | --------- | -------- |
| TypeScript strict | Enabled   | ✅       |
| ESLint errors     | 0         | ✅       |
| Test coverage     | 70%       | ✅       |
| No `any` type     | Enforced  | ✅       |

---

## 🚀 Next Steps

After foundation is complete, proceed with **Week 1 remaining tasks**:

1. **OAuth Authentication Flow**
   - Localhost callback server (port 3737)
   - Google, GitHub, Microsoft providers
   - JWT token storage

2. **Basic App Navigation**
   - Tab-based navigation
   - Settings page
   - Empty state components

3. **Encrypted Storage**
   - electron-store integration
   - `~/.agentage/config.json` structure

---

## 📝 Release Process

### Creating a Release

```bash
# 1. Update version in package.json
npm version patch  # or minor, major

# 2. Push with tags
git push && git push --tags

# 3. GitHub Actions automatically:
#    - Builds all platforms
#    - Creates draft release
#    - Uploads artifacts

# 4. Review draft release on GitHub
#    - Edit release notes
#    - Publish when ready
```

### Version Strategy

- **Patch** (0.1.x): Bug fixes, dependency updates
- **Minor** (0.x.0): New features
- **Major** (x.0.0): Breaking changes

---

## ✅ Acceptance Criteria

- [x] CI pipeline runs on all PRs
- [x] Type-check must pass
- [x] Lint must pass (no warnings)
- [x] Tests must pass with 70%+ coverage
- [x] Build succeeds on Linux, macOS, Windows
- [x] Release workflow creates draft releases on tag
- [x] Empty Electron app starts and shows window
- [x] IPC bridge is configured with context isolation
- [x] Dependabot monitors dependencies

---

**Document Status**: Complete  
**Last Updated**: December 7, 2025
