# Test Program

## Commands
- `pnpm test:unit`: Vitest unit + integration with coverage.
- `pnpm test:unit:watch`: Vitest watch mode.
- `pnpm test:e2e`: Playwright Chromium end-to-end suite.
- `pnpm test:all`: Runs unit/integration then E2E.
- `pnpm test:ci`: CI aggregate command (migrate, seed, run all tests).

## Coverage Thresholds
Vitest coverage thresholds are enforced in `vitest.config.mts`:
- Lines: `70%`
- Statements: `70%`
- Functions: `70%`
- Branches: `60%`

## Legacy Tests
If a legacy `__tests__/` script suite exists in your branch, keep it non-gating.
CI and pre-push enforcement should gate only on Vitest + Playwright (`test:all`).
