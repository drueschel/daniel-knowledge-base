# Agent Instructions

## Package Manager
Use **npm**: `npm install`, `npm run dev`

## Commit Attribution
AI commits MUST include:
```
Co-Authored-By: Claude <noreply@anthropic.com>
```

## Architecture: Agentic Content Engine (The 7 Gods)
This is our multi-agent architecture for the automated E2E pipeline:

| Agent | Role | Domain |
|-------|------|--------|
| **Zeus** | Orchestrator / CEO | Workflow routing, resolves disputes between QA and Creative. |
| **Prometheus** | Head of Data & Knowledge | YouTube ingestion, RAG search in Obsidian. |
| **Athena** | Head of Strategy & Growth | Pre-creation formatting, post-creation analytics. |
| **Calliope** | Creative Director | Writes script and 3 A/B Hooks. |
| **Themis** | Chief Editor (QA) | Strict rule enforcer, rejects bad scripts back to Zeus. |
| **Hephaistos**| Head of Production | Generates Voice (Orpheus), Visuals (Iris), creates cut JSON. |
| **Aphrodite** | Community & Sales | Interacts in comments, funnels leads to DMs. |

## File-Scoped Commands
| Task | Command |
|------|---------|
| Backend Start | `npx tsx watch src/index.ts` (in `backend/`) |
| UI Start | `npm run dev -- --port 3001` (in `agentic-cockpit/`) |
| Generate SVGs | `npx tsx backend/generate_svgs.ts` |

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
