# Contributing to BotGrocer

Thanks for your interest. This project is open to contributions from anyone —
you do not need to be added as a collaborator.

## How to contribute

1. **Fork** this repository.
2. Create a branch with a descriptive name:
   `feat/agent-search`, `fix/order-null-check`, `docs/setup-guide`.
3. Make your change and verify it locally (see below).
4. Open a **pull request** against `main`. Describe what changed and why.

Small, focused pull requests are reviewed much faster than large ones.

## Development setup

Requires [Bun](https://bun.sh) 1.3+ and PostgreSQL.

```bash
bun install
cp .env.example .env   # then fill in your database credentials
bun run build
```

## Verifying your change

Please run these before opening a pull request:

```bash
bun run build        # must pass
bun run type-check   # see note below
```

> **Known issue:** `bun run type-check` currently fails with pre-existing
errors (roughly 60, across `src/components`, `src/db`, `src/mcp`,
`src/utils`). These are not caused by your change. The `build` step passes
because Bun's bundler does not type-check. If your pull request touches one of
these areas, fixing the errors along the way is very welcome — but please keep
unrelated fixes in a separate pull request.

### Missing dependencies

`src/db/schema.ts` imports `drizzle-zod` and `src/mcp/index.ts` imports
`@modelcontextprotocol/sdk`, but neither is listed in `package.json`. Any work
on MCP or schema validation will need these added first.

## What we are looking for

- Bug fixes with a clear reproduction
- Filling in the unfinished MCP server implementation in `src/mcp/`
- Type-safety fixes in the files listed above
- Documentation improvements
- Tests (`bun test`) — there is very little coverage today

## What to avoid

- Large unexplained refactors. If you want to restructure something
  significant, open an issue first so we can agree on the approach.
- Formatting-only changes across many files; they are hard to review.
- Committing `.env` files or any real credentials.

## Code style

Formatting and linting are handled by [Biome](https://biomejs.dev):

```bash
bun run lint
bun run format
```

## Licensing

By contributing, you agree that your contributions are licensed under the
MIT License (see `LICENSE`).
