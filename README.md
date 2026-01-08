# GitHub Repo Analyzer

A CLI tool for analyzing GitHub repositories without using the GitHub API.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Tests](https://img.shields.io/badge/tests-42%20passing-success)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-green)

## Features

- 🔍 **No API Required** - Analyze repositories using git commands only
- 📊 **Language Distribution** - Visual breakdown of programming languages
- 📅 **Commit History** - Last commit date, author, and message
- 📈 **Statistics** - Total files, commits, and default branch
- 🎨 **Beautiful Output** - Colored terminal output with visual bars
- 📄 **JSON Export** - Export results as JSON for further processing

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
gh-analyze https://github.com/nodejs/node
```

### Output Options

```bash
# JSON output
gh-analyze https://github.com/facebook/react --json

# Verbose mode
gh-analyze https://github.com/vercel/next.js --verbose

# Short URL format
gh-analyze github.com/cli/cli
```

### Example Output

```
📊 GitHub Repository Analysis
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📁 Repository: cli/cli
🌐 URL: https://github.com/cli/cli
🌿 Branch: trunk
📅 Last Commit: 1/8/2026, 1:11:36 AM
✍️  Author: Babak K. Shandiz
💬 Message: Merge pull request #12440 from cli/babakks/enable-noop-linte...

📊 Statistics:
  • Total Files: 1,316
  • Total Commits: 10,656

🔤 Language Distribution:
  Go           ████████████████████  83.3%
  JSON         ██░░░░░░░░░░░░░░░░░░   7.3%
  Markdown     █░░░░░░░░░░░░░░░░░░░   4.6%
  YAML         █░░░░░░░░░░░░░░░░░░░   2.6%
  Shell        ░░░░░░░░░░░░░░░░░░░░   1.8%

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Supported Languages

The tool detects 20+ programming languages including:

- JavaScript / TypeScript
- Python, Go, Rust
- Java, C, C++, C#
- Ruby, PHP, Swift
- HTML, CSS, JSON
- Markdown, YAML, TOML
- And more...

## How It Works

1. **Clone** - Temporarily clones the repository to a temp directory
2. **Analyze** - Uses git commands to extract:
   - Commit history and statistics
   - File list and extensions
   - Default branch name
3. **Detect** - Analyzes file extensions to determine language distribution
4. **Display** - Formats and displays results in your terminal
5. **Cleanup** - Automatically removes temporary files

## Requirements

- **Node.js** >= 18.0.0
- **Git** - Must be installed and available in PATH
- **Network** - Required for cloning public repositories

## Development

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage
```

### Project Structure

```
github-analiz-araci/
├── src/
│   ├── cli.js          # CLI entry point
│   ├── analyzer.js     # Main analysis logic
│   ├── git.js          # Git operations wrapper
│   ├── language.js     # Language detection
│   ├── urlParser.js    # GitHub URL parsing
│   └── formatter.js    # Output formatting
├── tests/              # Test files
├── SPEC.md             # Technical specification
├── MEMORY.md           # Architecture decisions
└── STYLE.md            # Coding standards
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this tool for any purpose.

## Author

Created by [JoseJ2025](https://github.com/JoseJ2025)

## Acknowledgments

- Built with [simple-git](https://www.npmjs.com/package/simple-git)
- CLI framework by [Commander.js](https://www.npmjs.com/package/commander)
- Testing with [Vitest](https://vitest.dev/)

---

**Note:** This tool works with public GitHub repositories only. Private repositories require authentication which is intentionally not supported to keep the tool simple and API-free.
