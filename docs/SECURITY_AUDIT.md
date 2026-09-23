# Dependency audit and SBOM

Reviewed Sept 24, 2026 with `npm audit` (npm 10, Node 22) against `package-lock.json`.

## Production dependencies: clean

`npm audit --omit=dev` reports **0 vulnerabilities**. CI fails the build on any high or critical advisory in production dependencies.

The first CI run failed this gate. Fixes made:

| Advisory source | Fix |
|---|---|
| vite / esbuild pulled into the runtime tree through `@vitejs/plugin-react` listed as a dependency | Moved the plugin to devDependencies (it is build-time only) |
| react-router (high) | Upgraded `react-router-dom` to 7.18.4; full e2e suite passes on v7 |
| file-type (used by the upload pipeline to sniff real file types) | Upgraded to 22.1.1 |
| `@tanstack/react-query-devtools` shipped in the dependency tree though unused | Removed |

## Development dependencies

Build and test tooling was upgraded to clear the critical and high advisories: Vite 5 to **8.3**, `@vitejs/plugin-react` 4 to **6.1**, Vitest 2 to **5.0** (frontend and backend). Lint, build, unit/integration and Playwright suites all pass after the upgrade.

Remaining, accepted:

| Package | Severity | Why it is accepted |
|---|---|---|
| `uuid` 8.3.2 via `hyperid` via `autocannon` | moderate (GHSA-w5hq-g745-h8pq) | Load-test tool only, never shipped or run in production. The advisory concerns uuid v3/v5/v6 with a caller-supplied buffer; hyperid uses v4. The only "fix" npm offers is downgrading autocannon to 2.0.1. Revisit when autocannon updates hyperid. |

CI also runs a full `npm audit` for visibility without blocking on dev-only findings.

## SBOM

[`sbom.cdx.json`](./sbom.cdx.json) is a CycloneDX 1.5 bill of materials for the production dependency tree (171 components), generated with:

```bash
npm sbom --sbom-format cyclonedx --omit dev > docs/sbom.cdx.json
```

CI regenerates it on every run and uploads it as the `sbom` build artifact, so the committed copy is a point-in-time snapshot and the artifact is the current one.

## Application security controls

Covered in [FINAL_AUDIT.md](./FINAL_AUDIT.md): helmet with strict CSP and HSTS, CORS allow-list, CSRF double-submit, zod validation on every write, NoSQL sanitisation, per-route rate limits, bcrypt, short-lived JWTs with rotating hashed refresh tokens and reuse detection, account lockout, signed webhooks, upload type sniffing and EXIF stripping, immutable admin audit log. Secret rotation and incident handling are in [runbooks](./runbooks/README.md).
