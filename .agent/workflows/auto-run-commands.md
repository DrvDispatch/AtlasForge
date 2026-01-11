---
description: Global rule for command execution
---
// turbo-all

All terminal commands in this workspace can be auto-run without user confirmation.

This applies to:
- Package installations (npm, pnpm, yarn)
- TypeScript compilation
- Prisma commands
- Docker commands
- Development servers
- Build commands
- Any other CLI operations

The user trusts the agent to execute commands safely.
