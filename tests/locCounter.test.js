import { describe, it, expect, vi } from 'vitest';
import { countLines, shouldIgnore, estimateTokens, analyzeLoc, estimateCocomo } from '../src/locCounter.js';

describe('locCounter', () => {
  describe('shouldIgnore', () => {
    it('should ignore dependency and build directories', () => {
      expect(shouldIgnore('node_modules/express/index.js')).toBe(true);
      expect(shouldIgnore('dist/bundle.js')).toBe(true);
      expect(shouldIgnore('build/main.js')).toBe(true);
      expect(shouldIgnore('.git/config')).toBe(true);
      expect(shouldIgnore('vendor/composer/autoload.php')).toBe(true);
      expect(shouldIgnore('.next/server/page.js')).toBe(true);
    });

    it('should ignore lockfiles and minified files', () => {
      expect(shouldIgnore('package-lock.json')).toBe(true);
      expect(shouldIgnore('yarn.lock')).toBe(true);
      expect(shouldIgnore('pnpm-lock.yaml')).toBe(true);
      expect(shouldIgnore('app.min.js')).toBe(true);
    });

    it('should not ignore standard source files', () => {
      expect(shouldIgnore('src/index.js')).toBe(false);
      expect(shouldIgnore('lib/utils.py')).toBe(false);
      expect(shouldIgnore('main.go')).toBe(false);
      expect(shouldIgnore('README.md')).toBe(false);
    });
  });

  describe('estimateTokens', () => {
    it('should estimate tokens based on character count (~4 chars per token)', () => {
      expect(estimateTokens(400)).toBe(100);
      expect(estimateTokens(0)).toBe(0);
      expect(estimateTokens(15)).toBe(4);
    });
  });

  describe('countLines', () => {
    it('should count total, blank, and code lines correctly', () => {
      const content = `// Title
function add(a, b) {
  return a + b;
}

// End`;
      const stats = countLines(content);
      expect(stats.total).toBe(6);
      expect(stats.blank).toBe(1);
      expect(stats.code).toBe(5);
      expect(stats.chars).toBe(content.length);
    });
  });

  describe('analyzeLoc', () => {
    it('should aggregate LOC and token metrics across files', () => {
      const mockFiles = ['src/index.js', 'src/style.css', 'package-lock.json'];
      const fileContents = {
        'src/index.js': 'const x = 1;\n\nconsole.log(x);',
        'src/style.css': 'body {\n  margin: 0;\n}'
      };

      const readFileMock = (filePath) => fileContents[filePath];

      const result = analyzeLoc(mockFiles, readFileMock);

      expect(result.scannedFiles).toBe(2);
      expect(result.ignoredFiles).toBe(1);
      expect(result.totalLines).toBe(6); // 3 + 3
      expect(result.totalCodeLines).toBe(5); // 2 + 3
      expect(result.totalBlankLines).toBe(1);
      expect(result.estimatedTokens).toBeGreaterThan(0);
      expect(result.byLanguage['JavaScript']).toBeDefined();
      expect(result.byLanguage['JavaScript'].codeLines).toBe(2);
      expect(result.byLanguage['CSS'].codeLines).toBe(3);
      expect(result.cocomo).toBeDefined();
      expect(result.cocomo.effortMonths).toBeGreaterThan(0);
    });
  });

  describe('estimateCocomo', () => {
    it('should compute effort months and estimated development cost', () => {
      const cocomo = estimateCocomo(10000);
      expect(cocomo.effortMonths).toBeGreaterThan(0);
      expect(cocomo.estimatedCost).toBeGreaterThan(0);
      expect(cocomo.formattedCost).toContain('$');
    });

    it('should handle zero lines cleanly', () => {
      const cocomo = estimateCocomo(0);
      expect(cocomo.effortMonths).toBe(0);
      expect(cocomo.estimatedCost).toBe(0);
      expect(cocomo.formattedCost).toBe('$0');
    });
  });
});
