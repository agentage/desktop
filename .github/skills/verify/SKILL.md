---
name: verify
description: Run project verification checks (type-check, lint, test). Use this skill when the user asks to verify the project, run checks, or validate code quality.
---

# Verify Project Skill

## Purpose

Run project verification checks (type-check, lint, test).

## When to Use

- User asks to verify project
- User asks to run checks/tests
- Before committing/pushing changes
- After code changes

## Steps

1. **Run verification**

   ```bash
   npm run type-check && npm run lint && npm run test && npm run build
   ```

2. **Report results**
   - ✅ All passed
   - ❌ Show failures

## Shortcuts

- `npm run verify` - runs all checks
- Individual: `npm run type-check`, `npm run lint`, `npm run test`, `npm run build`
