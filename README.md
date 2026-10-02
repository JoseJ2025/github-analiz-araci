# Repo-Lens (GitHub Repository Analyzer v2.0.0)

A lightning-fast CLI diagnostic tool for analyzing GitHub repositories without using the GitHub API or tokens. Built for developers and AI agents.

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![Tests](https://img.shields.io/badge/tests-64%20passing-success)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-green)
![Speed](https://img.shields.io/badge/clone-shallow%20%26%20treeless-orange)

## ✨ New in v2.0.0 (Repo-Lens)

- ⚡ **Ultra-Fast Shallow & Treeless Clone** — Uses `--depth 1 --single-branch` to analyze even giant repositories in 2-4 seconds.
- ⚙️ **Tech-Stack & Framework DNA** — Auto-detects Next.js, React, Vue, FastAPI, Django, Gin, Axum, Tailwind, Docker, and Monorepo setups.
- 📊 **LOC & LLM Token Budget** — Counts physical lines of code (SLOC) and estimates context token load (~4 chars/token) for AI agents (Claude, Gemini, GPT).
- 🔒 **Security & License Audit** — Identifies SPDX licenses (MIT, Apache, GPL, BSD), commercial use safety, accidentally committed secrets (`.env`, `.key`), and repository maintenance health.
- 🎨 **Redesigned Terminal UI & JSON Output** — Clean dashboard view for terminal users and structured schema for AI agent pipelines (`--json`).

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
node src/cli.js <url>
```

## Usage

### Basic Usage

```bash
gh-analyze https://github.com/facebook/react
```

### Output Options

```bash
# JSON output (ideal for AI agents & CI pipelines)
gh-analyze https://github.com/vercel/next.js --json

# Verbose mode
gh-analyze https://github.com/cli/cli --verbose

# Short URL format
gh-analyze github.com/fastapi/fastapi
```

## Requirements

- **Node.js** >= 18.0.0
- **Git** - Must be installed and available in PATH
- **Network** - Required for shallow cloning public repositories

## Development

```bash
# Run all 64 tests
npm test

# Run tests with coverage
npm run test:coverage
```

## License

MIT License — feel free to use this tool for any purpose.

## Author

Created by [JoseJ2025](https://github.com/JoseJ2025)
