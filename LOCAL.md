# Run Jace locally

This is an Apache-2.0 open-source project. No hosted AgentRail or Jace account is required. Node 24, pnpm 9, Python 3.11+ and Docker Compose are the local prerequisites.

```sh
pnpm install --frozen-lockfile
pnpm local:up
```

The first start installs the Python CLI in `.venv`, builds shared packages, starts private data containers, applies migrations and opens a local operator session. The Console and workers run on your host for faster startup and source changes; PostgreSQL, ClickHouse and artifact storage run in Docker. Data survives `pnpm local:down`. To sign in again, run `pnpm local:open`. Its single-use code expires after two minutes; it is issued through your local database and cannot be used on Vercel. `LOCAL_OPERATOR_LOGIN` is enabled only by the local launcher. Its services bind to loopback; keep this development setup private.

Configuration and generated passwords are stored in the ignored, permission-restricted `.local/env`. To change ports or add optional GitHub credentials, edit that file and rerun `pnpm local:up`. No shared database or runtime connection to the other product is configured.

| Service | Local port |
| --- | --- |
| Console | 3001 |
| PostgreSQL | 25432 |
| ClickHouse HTTP | 28123 |
| Artifact store | 29000 |
| Artifact store administration | 29001 |

## Local model and workers

Install/start Ollama, then download the default small local model once:

```sh
ollama pull qwen3:4b
```

The coordinator uses `http://127.0.0.1:11434/v1` with `JACE_MODEL_ID=qwen3:4b` and an explicit context budget. All three values are configurable in `.local/env`; the API key is optional for local inference. This is a portable local configuration, not a quality endorsement or acceptance benchmark for that model.

The Console starts on port 3001 and the coordinator on port 2001. The review and Context Pack regeneration workers run as separate local processes. The regeneration worker receives only its dedicated credential. External chat platforms and GitHub actions require their own credentials if you enable them. Browser-driven criterion verification also requires the documented isolated browser/preview setup; unavailable proof must stay not_testable/not_proven.

## Build and verify a local release

From a clean checkout of the merged commit, run `JACE_LOCAL_RELEASE=1 pnpm local:up`. The Console serves the production build on the configured local port. Read the compiled commit from `/api/release`.

The AgentRail verifier in `scripts/verify-jace-release.mjs` uses an authenticated Jace fixture workspace with two Acceptance Records linked to different issue numbers. Point `JACE_RELEASE_FIXTURE_FILE` to a private JSON file with the Console `url`, `workspaceId`, `matchRecordId`, `otherRecordId`, numeric `issueNumber`, and the fixture session `cookie` as a single name=value pair. Keep the file outside Git and restrict its permissions. The verifier checks the running build and both list states using the session only on the pinned Console URL.

## Troubleshooting

Use `pnpm local:status`. Application logs are in `.local/*.log`; data-service logs are available with `docker compose --env-file .local/env -f compose.local-data.yml logs <service>`. If a port is occupied, change its value in `.local/env`; do not stop another project. A failed migration prevents the Console from starting. Do not delete volumes to hide the failure.

Vercel is the intended later hosting target. Railway files are inherited historical deployment material; they are not used by this local profile.

The launcher uses `compose.local-data.yml` for data services and host processes for applications.

The verified qwen3:4b cold turn took several minutes and retried once while filling its prompt cache. Later turns were faster. Local model quality and latency depend on your machine and model; this is a connectivity proof, not an acceptance-quality benchmark.

ClickHouse has a 1536M local memory limit by default. Its earlier 768M limit could reject migrations after the server cache grew. Override `CLICKHOUSE_MEMORY_LIMIT` in `.local/env` if your workload needs more headroom; rerunning `pnpm local:up` preserves the data volume.
