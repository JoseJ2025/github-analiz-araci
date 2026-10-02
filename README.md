# Repo-Lens (GitHub Repository Analyzer v3.0.0)

A lightning-fast CLI diagnostic tool for analyzing GitHub repositories and local projects without using the GitHub API or tokens. Built for developers and AI coding agents.

![Version](https://img.shields.io/badge/version-3.0.0-blue)
![Tests](https://img.shields.io/badge/tests-75%20passing-success)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-green)
![Speed](https://img.shields.io/badge/speed-%3C2s%20shallow%20scan-orange)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Core Capabilities

- ⚡ **Ultra-Fast Shallow & Treeless Clone** — Uses `--depth 1 --single-branch` to analyze even giant repositories in 2-4 seconds.
- 🎯 **Shorthand Repo Names (`owner/repo`)** — No need to type full URLs; run `gh-analyze expressjs/express` directly.
- 💻 **Local Directory Diagnostics (`gh-analyze .`)** — Instantly scan local directories and workspaces without cloning.
- 🚀 **Runnability & Dev-Recipe Inspector** — Automatically detects runtime requirements, package managers, dev commands (`npm run dev`, `poetry run`, `cargo run`), test commands, and entrypoints.
- ⚖️ **Side-by-Side Comparison (`gh-analyze compare`)** — Compare two libraries or projects head-to-head in an elegant terminal matrix table.
- 🧩 **AI Architecture Skeleton (Markdown & XML)** — Extracts visual file trees, class hierarchies, and exported signatures into compact markdown or Claude-ready XML (`-f xml`).
- ⚙️ **Tech-Stack & Framework DNA** — Auto-detects Next.js, React, Vue, FastAPI, Django, Gin, Axum, Tailwind, Docker, Vitest, and Monorepo setups.
- 📊 **LOC & LLM Token Budget** — Counts physical lines of code (SLOC) and estimates context token load (~4 chars/token) for AI agents (Claude, Gemini, GPT).
- 🔒 **Deep Security, License & Secret Audit** — Identifies SPDX licenses, commercial use safety, accidentally committed secret files (`.env`, `.key`), AND regex-scans files for embedded API tokens (`ghp_`, `sk-`, `AKIA`).

## Installation

### Global Installation (Recommended)

```bash
# Clone the repository
git clone https://github.com/JoseJ2025/github-analiz-araci.git
cd github-analiz-araci

# Install dependencies
npm install

# Link globally
npm link
```

### Local Installation

```bash
npm install
node src/cli.js <target>
```

## Usage

### 1. Basic Repository Scan

```bash
gh-analyze https://github.com/facebook/react
```

### 2. Interactive Web Dashboard (Studio UI)

Launch the self-contained, dark-mode visual web dashboard:

```bash
gh-analyze ui
# Or specify a port: gh-analyze ui 3000
```

### 3. Local Directory Scan

```bash
cd my-project
gh-analyze .
```

### 3. Side-by-Side Library Comparison

```bash
gh-analyze compare pmndrs/zustand pmndrs/jotai
```

### 4. AI Architecture Skeleton Export

```bash
# Print to console
gh-analyze https://github.com/expressjs/express --skeleton

# Save to file for LLM prompting
gh-analyze . --skeleton -o SKELETON.md
```

### 5. Structured JSON Output (For CI & Agents)

```bash
gh-analyze https://github.com/vercel/next.js --json
```

## Development

```bash
# Run all 75 tests
npm test

# Run tests with coverage
npm run test:coverage
```

## License

MIT License — feel free to use this tool for any purpose.

## Author

Created by [JoseJ2025](https://github.com/JoseJ2025)
