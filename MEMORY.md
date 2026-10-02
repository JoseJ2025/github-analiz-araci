# MEMORY.md - Project Brain

## 🧠 Active Context
- **Project:** Repo-Lens (GitHub Repo Analyzer v2.0.0)
- **Status:** ✅ COMPLETED & AUDITED
- **Last Updated:** 2026-10-02
- **Test Coverage:** 64/64 tests passing (100%)

## 🏗️ Architecture Decision Records (ADR)

### [ADR-001] Stack Selection
- **Runtime:** Node.js v18+ with ES Modules
- **CLI Framework:** Commander.js v14.0.2
- **Git Operations:** simple-git v3.30.0
- **Testing:** Vitest v4.0.16
- **Formatting:** Chalk v5.6.2, cli-table3 v0.6.5

### [ADR-002] Shallow Clone Strategy (v2.0.0)
- Default clone parameters: `['--depth', '1', '--single-branch']`
- Reduces clone time from 45s+ to 2-3s for large repositories.

### [ADR-003] LOC & Token Budget Engine (v2.0.0)
- Physical source line counting (SLOC) instead of simple file counts.
- Token load estimation (~4 chars/token) for LLM context planning.
- Intelligent exclusions: `node_modules`, `dist`, `build`, `.git`, `.next`, lockfiles, minified bundles.

### [ADR-004] Tech-Stack & Architecture Detector (v2.0.0)
- Scans `package.json`, `Cargo.toml`, `go.mod`, `requirements.txt`, `Dockerfile`, `turbo.json`.
- Detects major web/backend frameworks, build tools, and Monorepo setups.

### [ADR-005] Security, License & Hygiene Audit (v2.0.0)
- Detects SPDX licenses (MIT, Apache-2.0, GPL, BSD, etc.) and commercial usage rights.
- Audits repository for accidental secret leaks (`.env`, `.key`, `id_rsa`, certificates).
- Evaluates maintenance activity status based on the latest commit timestamp.

## 📁 Project Structure

```
github-analiz-araci/
├── src/
│   ├── cli.js            # CLI entry point (Commander.js)
│   ├── analyzer.js       # Main analysis orchestration
│   ├── git.js            # Git wrapper (optimized shallow clone)
│   ├── locCounter.js     # Physical LOC & token counter
│   ├── stackDetector.js  # Tech-stack & monorepo detector
│   ├── securityAudit.js  # License & security hygiene auditor
│   ├── language.js       # Language extension mapper
│   ├── urlParser.js      # GitHub URL parsing
│   └── formatter.js      # Beautiful CLI dashboard & error formatting
├── tests/
│   ├── analyzer.test.js
│   ├── formatter.test.js
│   ├── git.test.js
│   ├── language.test.js
│   ├── locCounter.test.js
│   ├── securityAudit.test.js
│   ├── stackDetector.test.js
│   └── urlParser.test.js
├── package.json
├── README.md
├── SPEC.md
└── MEMORY.md
```

## 🧪 Testing Status

**Total Tests:** 64
**Passing:** 64
**Failing:** 0
**Coverage:** >92%
