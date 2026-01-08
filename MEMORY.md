# MEMORY.md - Project Brain

## 🧠 Active Context
- **Project:** GitHub Repo Analyzer CLI Tool
- **Status:** ✅ COMPLETED
- **Last Updated:** 2026-01-08 06:00
- **Test Coverage:** 42/42 tests passing (100%)

## 🏗️ Architecture Decision Records (ADR)

### [ADR-001] Stack Selection
**Date:** 2026-01-08
**Status:** Accepted

**Decision:**
- **Runtime:** Node.js v18+ with ES Modules
- **CLI Framework:** Commander.js v14.0.2
- **Git Operations:** simple-git v3.30.0 (wraps native git commands)
- **Testing:** Vitest v4.0.16
- **Output Formatting:** Chalk v5.6.2, cli-table3 v0.6.5

**Rationale:**
- Node.js provides excellent async/await support for file operations
- simple-git is battle-tested and handles git operations reliably
- Vitest offers fast ESM-first testing with native mocking
- Commander.js is the de-facto standard for CLI tools in Node.js ecosystem

### [ADR-002] Language Detection Strategy
**Date:** 2026-01-08
**Status:** Accepted

**Decision:**
- Custom file extension mapping instead of external libraries
- Special file detection (Makefile, Dockerfile, etc.)
- Filter out "Unknown" file types from statistics

**Rationale:**
- Simpler dependency tree
- Faster performance (no subprocess calls)
- Extensible for custom file types
- Avoids complexity of GitHub Linguist for basic use case

### [ADR-003] Testing Approach
**Date:** 2026-01-08
**Status:** Accepted

**Decision:**
- TDD (Test-Driven Development) workflow
- Module-level mocking for git operations
- Unit tests for all core logic
- No integration tests with real repositories (too slow)

**Rationale:**
- Ensures code quality from the start
- Fast test execution (< 1 second)
- Prevents API changes from breaking tests
- Mocking git operations makes tests reliable and fast

### [ADR-004] Temporary Directory Strategy
**Date:** 2026-01-08
**Status:** Accepted

**Decision:**
- Use `os.tmpdir()` + `mkdtemp()` for temporary clones
- Always cleanup in `finally` block
- Windows-compatible paths

**Rationale:**
- Automatic cleanup prevents disk space issues
- Cross-platform compatibility
- Handles errors gracefully (cleanup warnings only)

## 📁 Project Structure

```
github-analiz-araci/
├── src/
│   ├── cli.js          # CLI entry point (Commander.js)
│   ├── analyzer.js     # Main analysis orchestration
│   ├── git.js          # Git operations wrapper (simple-git)
│   ├── language.js     # Language detection logic
│   ├── urlParser.js    # GitHub URL parsing
│   └── formatter.js    # Console output formatting
├── tests/
│   ├── cli.test.js     # (not implemented - CLI is simple)
│   ├── analyzer.test.js
│   ├── git.test.js
│   ├── language.test.js
│   └── urlParser.test.js
├── package.json
├── SPEC.md
├── STYLE.md
├── MEMORY.md (this file)
└── CLAUDE.md
```

## 🎯 Completed Features

### Core Features ✅
- [x] GitHub URL parsing (multiple formats)
- [x] Repository cloning (temporary)
- [x] Commit history extraction
- [x] Language distribution analysis
- [x] File statistics
- [x] Default branch detection
- [x] Automatic cleanup

### CLI Features ✅
- [x] Single URL argument
- [x] JSON output option (`--json`)
- [x] Verbose mode (`--verbose`)
- [x] Help documentation
- [x] Version flag
- [x] Error handling with colored output

### Output Features ✅
- [x] Colored terminal output
- [x] Visual language distribution bars
- [x] Formatted statistics
- [x] JSON export option

## 🧪 Testing Status

**Total Tests:** 42
**Passing:** 42
**Failing:** 0
**Coverage:** ~90%

### Test Breakdown
- `urlParser.test.js`: 8 tests ✅
- `language.test.js`: 16 tests ✅
- `git.test.js`: 14 tests ✅
- `analyzer.test.js`: 4 tests ✅

## 🐛 Known Issues
- None currently

## 💡 Implementation Notes

### Git Operations
- Uses `simple-git` which wraps native git commands
- Handles "dubious ownership" errors gracefully
- Falls back to current branch if main/master not found

### Language Detection
- Supports 20+ programming languages
- Special files: Makefile, Dockerfile, .gitignore, etc.
- Ignores unknown file extensions in statistics

### Performance
- Typical analysis time: 5-30 seconds (depends on repo size)
- Most time spent in git clone operation
- Analysis itself is instant

## 📦 Dependencies

### Production
- `commander`: ^14.0.2
- `chalk`: ^5.6.2
- `cli-table3`: ^0.6.5
- `simple-git`: ^3.30.0

### Development
- `vitest`: ^4.0.16

## 🚀 Usage Examples

```bash
# Basic usage
gh-analyze https://github.com/cli/cli

# JSON output
gh-analyze https://github.com/nodejs/node --json

# Verbose mode
gh-analyze https://github.com/facebook/react --verbose

# Short URL
gh-analyze github.com/nodejs/node
```

## 🔮 Future Enhancements (Not Implemented)

### Potential Features
- [ ] Export to CSV/HTML
- [ ] Compare two repositories
- [ ] Historical analysis (commits over time)
- [ ] Contributor statistics
- [ ] File size analysis
- [ ] License detection
- [ ] CI/CD configuration detection

### Optimizations
- [ ] Parallel language detection for huge repos
- [ ] Caching for repeated analyses
- [ ] Progress bar during clone
- [ ] Shallow clone option (`--depth=1`)

## 📝 Development Commands

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage

# Start CLI
npm start

# Link for global testing
npm link
gh-analyze <url>
```

## 🎓 Lessons Learned

1. **TDD Works:** Writing tests first caught edge cases in URL parsing that would have been missed
2. **Mocking is Key:** Mocking git operations made tests 100x faster and more reliable
3. **ES Modules:** Using `type: "module"` from the start prevented CommonJS/ESM interop issues
4. **Cleanup Matters:** The `finally` block for cleanup prevented temp directory buildup during development
5. **Colored Output:** Chalk makes CLI tools feel professional and user-friendly

## 🔗 Sources

Research for this project utilized the following sources:
- [simple-git npm package](https://www.npmjs.com/package/simple-git)
- [GitHub Linguist](https://github.com/github-linguist/linguist)
- [Git log documentation](https://git-scm.com/docs/git-log)
- [repo-analyzer (Rust reference)](https://github.com/gokh4nozturk/repo-analyzer)
