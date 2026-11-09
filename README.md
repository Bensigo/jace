# Jace — acceptance and evidence for coding agents

Jace owns human-confirmed Acceptance Contracts, bounded Context Packs, exact-PR-head evidence, correction packets and human decisions. External coding agents implement work. Jace has no implementation or merge authority.

The development workflow is maintained independently at [Bensigo/agentrail](https://github.com/Bensigo/agentrail). This repository runs without an AgentRail server or account.

## Components
- `apps/jace`: conversation, channels, coordination and bounded review workers (Node 24).
- `apps/console`: the trust Console and authenticated API.
- `packages/mcp`: Jace conversation, task-state, correction and bounded context tools.
- `packages/*`: repository-local database/auth/GitHub/UI dependencies.
- `agentrail/`: inherited internal context, verification and migration compatibility code. It is not an AgentRail product installation or a dependency on the other repository.

## Development
Use Node 24, pnpm 9, Python 3.11 and Docker Compose. Copy the documented environment examples to local untracked files. Use a dedicated database, OAuth/GitHub App credentials and deployment project; do not point this repository at AgentRail's database.

```sh
pnpm install --frozen-lockfile
pnpm --filter @agentrail/github-app build
pnpm --filter @agentrail/db-postgres build
# Start local data services and apply migrations as described in deploy/README.md.
pnpm dev
# In a second terminal:
cd apps/jace
npm ci
npm run dev
```

Internal `@agentrail/*` names are retained for source compatibility. Dependencies resolve inside this repository. Jace does not publish the AgentRail CLI; its inherited CLI publish/release automation is removed.

## Authority and evidence
Read [CONTEXT.md](CONTEXT.md), [ADR 0012](docs/adr/0012-jace-owns-the-acceptance-spine.md), the [migration ledger](docs/trust-layer-migration-ledger.md), and the [separation record](docs/repository-separation.md). Historical AgentRail instructions describe inherited infrastructure, not this product's public installation.

Source extraction is not a production cutover. Existing hosted services and open PRs remain on their current source until separately migrated and verified.
