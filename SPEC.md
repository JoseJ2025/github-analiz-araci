# SPEC.md - GitHub Repo Analyzer Specification

## 🎯 Project Overview
**Name:** GitHub Repo Analyzer
**Type:** CLI Tool
**Purpose:** Analyze GitHub repositories and display key metrics without using GitHub API

## 📋 Functional Requirements

### Input
- Accept GitHub repository URL as command-line argument
- Supported formats:
  - `https://github.com/owner/repo`
  - `https://www.github.com/owner/repo`
  - `github.com/owner/repo`

### Core Features
1. **Repository Clone/Read**
   - Clone repository temporarily to analyze
   - Use git commands or filesystem analysis
   - Clean up temporary data after analysis

2. **Language Distribution**
   - Analyze file extensions
   - Calculate percentage breakdown
   - Display top languages

3. **Commit History**
   - Last commit date
   - Total commit count
   - Latest commit message
   - Top contributors (if accessible)

4. **Repository Metadata**
   - Repository name
   - Default branch name
   - Total file count
   - Total lines of code (optional)

5. **Output Display**
   - Clean console output with formatting
   - JSON export option (optional)

### Output Format
```
📊 GitHub Repository Analysis
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📁 Repository: owner/repo
🌐 URL: https://github.com/owner/repo
📅 Last Commit: 2026-01-08 10:30:15

🔤 Language Distribution:
  JavaScript  ████████████░░░░ 45.2%
  TypeScript  ██████░░░░░░░░░░ 30.1%
  CSS         ████░░░░░░░░░░░░ 15.5%
  HTML        ██░░░░░░░░░░░░░░  9.2%

📊 Statistics:
  • Total Files: 142
  • Total Commits: 1,234
  • Default Branch: main
```

## 🏗️ Technical Architecture

### Technology Stack
- **Runtime:** Node.js (v18+)
- **Language:** JavaScript (ES Modules)
- **CLI Framework:** Commander.js
- **Git Operations:** Simple Git (simple-git) or child_process
- **File Analysis:** fs/promises
- **Output Formatting:** Chalk (colors), Cli-table3

### Project Structure
```
github-analiz-araci/
├── src/
│   ├── cli.js           # CLI entry point
│   ├── analyzer.js      # Core analysis logic
│   ├── git.js           # Git operations wrapper
│   ├── language.js      # Language detection
│   └── formatter.js     # Output formatting
├── tests/
│   ├── analyzer.test.js
│   ├── git.test.js
│   └── language.test.js
├── package.json
├── SPEC.md
├── STYLE.md
├── MEMORY.md
└── CLAUDE.md
```

## 🔬 Non-Functional Requirements

### Performance
- Clone and analyze within 30 seconds for medium repos
- Memory efficient for large repositories

### Reliability
- Handle invalid URLs gracefully
- Handle network errors
- Handle permission errors (private repos)

### Usability
- Clear error messages
- Help command available
- Progress indicators for long operations

## 🚫 Constraints
- No GitHub API usage (no authentication required)
- Git must be installed on system
- Network access for cloning public repos
- No persistent storage required

## 📝 Implementation Phases

### Phase 1: Foundation
- [ ] Initialize Node.js project
- [ ] Set up test framework (Jest or Vitest)
- [ ] Create basic CLI structure

### Phase 2: Core Logic
- [ ] URL parser
- [ ] Git clone operations
- [ ] File system traversal
- [ ] Language detection

### Phase 3: Analysis
- [ ] Commit history extraction
- [ ] Statistics calculation
- [ ] Language distribution

### Phase 4: Output
- [ ] Console formatting
- [ ] Error handling
- [ ] Help documentation

## 🧪 Testing Strategy
- Unit tests for each module
- Integration tests for full flow
- Mock git operations for tests
- Test with real repositories

## 📦 Dependencies
```json
{
  "commander": "^11.1.0",
  "chalk": "^5.3.0",
  "cli-table3": "^0.6.3",
  "simple-git": "^3.20.0"
}
```

## 🎯 Success Criteria
- [ ] Successfully analyzes public GitHub repos
- [ ] Displays all required metrics
- [ ] Handles errors gracefully
- [ ] Clean and readable output
- [ ] Test coverage > 80%
