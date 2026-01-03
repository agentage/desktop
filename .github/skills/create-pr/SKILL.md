---
name: create-pr
description: Create a pull request to GitHub for the current branch. Use this skill when the user asks to create a PR, open a pull request, submit changes for review, or push and create a PR. Handles branch naming, commit conventions, and PR templates.
---

# Create Pull Request

## Tools

- **git** - diff, log, push, commit
- **gh** - GitHub CLI for PR operations

## Commands

| Action            | Command                                           |
| ----------------- | ------------------------------------------------- |
| Commits vs master | `git log --oneline origin/master..HEAD`           |
| Diff vs master    | `git diff origin/master...HEAD`                   |
| Changed files     | `git diff --name-only origin/master...HEAD`       |
| Push branch       | `git push -u origin $(git branch --show-current)` |
| Create PR         | `gh pr create --base master`                      |
| Draft PR          | `gh pr create --base master --draft`              |
| View PR           | `gh pr view --web`                                |

## Workflow

1. **Analyze**: `git diff --stat origin/master...HEAD`
2. **Push**: `git push -u origin $(git branch --show-current)`
3. **Create**: `gh pr create --base master`

## Generating Messages

Before commit/PR, analyze changes with `git diff origin/master...HEAD` then:

- **Commit**: Summarize in `type: message` format (feat/fix/chore), max 72 chars
- **PR Title**: Use main change type + concise description
- **PR Body**: List all changed files grouped by purpose, include breaking changes

Create PR with generated message:

```bash
gh pr create --base master --title "feat: Add X" --body "## Summary\n\n## Changes\n- file1\n- file2"
```

## Conventions

- **Branches**: `feature/*`, `bugfix/*`, `hotfix/*`
- **Commits**: `feat:`, `fix:`, `chore:`, `docs:` (max 72 chars)
- **Base**: `master`

## PR Template

```markdown
## Summary

Brief description of changes.

## Changes

- Change 1
- Change 2
```
