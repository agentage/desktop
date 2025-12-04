# Agentage Desktop

> Electron desktop client for Agentage — run, edit and manage agents locally.

[![Build](https://github.com/agentage/desktop/actions/workflows/ci.yml/badge.svg)](https://github.com/agentage/desktop/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-linux%20%7C%20macos%20%7C%20windows-lightgrey)](https://github.com/agentage/desktop/releases)

---

## Why?

Lightweight desktop app to:

- Run local agents for development and testing
- Edit and validate agent definitions
- Manage local agent installs and registry connections
- Quick access to dev.agentage.io when configured

---

## MVP Goals

1. Electron + React + TypeScript scaffold (strict TS)
2. Agent list UI (load from local folder)
3. Agent editor (with Zod validation)
4. Run agent: spawn CLI `run` command and stream output
5. Config UI: set registry URL, API token, and dev site URL
6. Packaging: cross-platform builds (Linux, Mac, Windows)

---

## Tech Stack

- **Electron** — main process
- **Vite** — bundling
- **React + TypeScript** — strict mode
- **Tailwind CSS** — styling
- **Zod** — schema validation
- **Node child_process** — call CLI (embed runtime later)
- **Playwright** — E2E tests
- **GitHub Actions** — CI and artifact publishing

---

## Repository Layout

```
.
├── src/
│   ├── main/                # Electron main process (IPC handlers, app lifecycle)
│   ├── renderer/            # React app (UI)
│   └── shared/              # Shared types, utils (zod schemas, agent types)
├── public/                  # Static assets
├── scripts/                 # Packaging and helper scripts
├── tests/                   # E2E + unit tests
├── .github/
│   └── workflows/           # CI
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## Quickstart

### Install dependencies

```bash
npm install
```

### Start dev (renderer + main)

```bash
npm run dev
```

### Build production packages

```bash
npm run build
npm run package
```

---

## Configuration

Config file location: `~/.agentage/config.json`

```json
{
  "registryUrl": "https://agentage.io/api",
  "apiToken": "<your-token>",
  "devUrl": "https://dev.agentage.io",
  "telemetryEnabled": false
}
```

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start renderer + main in dev |
| `npm run lint` | Run ESLint |
| `npm run format` | Run Prettier |
| `npm run build` | Production build |
| `npm run package` | Cross-platform packaging |
| `npm run test` | Run unit tests |
| `npm run e2e` | Run Playwright tests |

---

## Security

- Do not store secrets in repo
- OS keyring integration for tokens (post-MVP)
- Validate all user input with Zod before execution

---

## Testing

- **Unit tests**: Jest
- **E2E**: Playwright (test flows: open agent, run agent, stream output)
- Add `data-testid` attributes for E2E selectors

---

## Contributing

1. Fork the repo
2. Create `feature/*` branch
3. Follow conventions (named exports, no `any`, <200 lines/file)
4. Open PR

---

## Coding Conventions

- Named exports only
- No `any`
- Functions over classes
- Explicit return types
- Files <200 lines, functions <20 lines

---

## Links

- [Agentage](https://agentage.io)
- [Requirements](https://github.com/agentage/requirements)
- [CLI](https://github.com/agentage/cli)
- [AgentKit](https://github.com/agentage/agentkit)

---

**MIT © 2025**
