# BotGrocer v3 — Agent-native marketplace refactor

Status: implementation plan; no production cutover authorized.

## Product boundary
BotGrocer is a marketplace where agents discover, compare, purchase, and invoke third-party goods and services. A listing is not an executable capability until its provider has passed verification. Humans retain control of spending, consent and disputes.

## Architectural rules
1. Modular monolith first: Bun + TypeScript + Hono + PostgreSQL/Drizzle. Split services only after measured scaling or isolation needs.
2. Every external integration is an adapter behind a versioned contract. Plugin registration is explicit, typed, permission-scoped and reversible. No plugin imports application internals.
3. Separate catalog, identity, pricing, checkout, orders, fulfillment, payments and provider integrations. Domain logic must not import HTTP handlers, database clients or vendor SDKs.
4. All external side effects require idempotency keys, bounded retries, timeouts, audit events and correlation IDs. Never retry a payment blindly.
5. Agent authentication uses scoped credentials and delegated user consent. Enforce spending limits and human approval for purchases; do not expose provider secrets to agents.
6. Store prices as integer minor units plus ISO currency, record immutable price quotes with expiry and provider attribution; recalculate server-side before checkout.
7. Use transactional order state transitions and an outbox for events; webhook signatures, replay protection and reconciliation are mandatory.
8. Expose REST/OpenAPI for humans and agents. MCP is an optional protocol adapter over the same application services, never a parallel business-logic implementation.
9. Design UI mobile-first and responsive, with accessible navigation, keyboard support, reduced-motion and dark mode. Preserve the existing brand until redesign approval.
10. No production deployment, destructive migration, secret rotation or deletion of legacy data without explicit approval and rollback evidence.

## Proposed boundaries
- `src/domain/`: value objects, invariants and domain events
- `src/application/`: use cases and ports
- `src/infrastructure/`: PostgreSQL repositories, outbox, payment and provider adapters
- `src/interfaces/http/`: Hono routes, validation, OpenAPI
- `src/interfaces/mcp/`: MCP discovery and invocation adapter
- `src/plugins/`: registry, manifests, permission checks, lifecycle
- `src/ui/`: responsive human-facing experience

## Migration sequence
- Phase 0: inventory current routes, schema, secrets handling, deployments and test coverage; capture baseline behavior.
- Phase 1: enforce CI (typecheck, lint, tests), central config validation, error handling, structured logs and health probes.
- Phase 2: extract domain/application boundaries and repository ports without changing existing API behavior.
- Phase 3: add plugin manifest + registry + contract tests and a reference catalog provider.
- Phase 4: add delegated agent identity, catalog search, quotes, approvals, orders and payment integration behind feature flags.
- Phase 5: MCP adapter, provider verification, observability, responsive UI and staged migration.

## Acceptance gates
- Existing documented endpoints retain compatible behavior or publish a versioned migration path.
- Tests cover authorization, tenant isolation, quote expiry, spending limits, idempotency, webhook replay and order transitions.
- CI is green on a clean checkout; database migrations support backup and rollback strategy.
- Sandbox payment and fulfillment are exercised end-to-end before enabling live checkout.
- Production rollout uses feature flags, metrics and a documented rollback procedure.
