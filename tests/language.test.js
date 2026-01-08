import { describe, it, expect } from 'vitest';
import { detectLanguage, analyzeLanguages } from '../src/language.js';

describe('language', () => {
  describe('detectLanguage', () => {
    it('should detect JavaScript files', () => {
      expect(detectLanguage('app.js')).toBe('JavaScript');
      expect(detectLanguage('component.jsx')).toBe('JavaScript');
    });

    it('should detect TypeScript files', () => {
      expect(detectLanguage('app.ts')).toBe('TypeScript');
      expect(detectLanguage('component.tsx')).toBe('TypeScript');
    });

    it('should detect Python files', () => {
      expect(detectLanguage('script.py')).toBe('Python');
    });

    it('should detect HTML files', () => {
      expect(detectLanguage('index.html')).toBe('HTML');
    });

    it('should detect CSS files', () => {
      expect(detectLanguage('style.css')).toBe('CSS');
    });

    it('should detect JSON files', () => {
      expect(detectLanguage('data.json')).toBe('JSON');
    });

    it('should detect Markdown files', () => {
      expect(detectLanguage('README.md')).toBe('Markdown');
    });

    it('should return Unknown for unsupported extensions', () => {
      expect(detectLanguage('file.xyz')).toBe('Unknown');
    });

    it('should handle files with multiple dots', () => {
      expect(detectLanguage('app.test.js')).toBe('JavaScript');
    });

    it('should handle special files without extension', () => {
      expect(detectLanguage('Makefile')).toBe('Makefile');
      expect(detectLanguage('Dockerfile')).toBe('Dockerfile');
    });
  });

  describe('analyzeLanguages', () => {
    it('should analyze single language directory', () => {
      const files = ['app.js', 'utils.js', 'index.js'];
      const result = analyzeLanguages(files);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        language: 'JavaScript',
        count: 3,
        percentage: 100
      });
    });

    it('should analyze mixed language directory', () => {
      const files = ['app.js', 'utils.ts', 'style.css', 'index.html'];
      const result = analyzeLanguages(files);

      expect(result).toHaveLength(4);
      expect(result[0].percentage).toBe(25);
    });

    it('should filter out unknown files', () => {
      const files = ['app.js', 'file.xyz', 'README.md'];
      const result = analyzeLanguages(files);

      expect(result).toHaveLength(2);
      expect(result.some(r => r.language === 'Unknown')).toBe(false);
    });

    it('should sort by count descending', () => {
      const files = [
        'app.js',
        'utils.js',
        'index.js',
        'app.ts',
        'utils.ts',
        'style.css'
      ];
      const result = analyzeLanguages(files);

      expect(result[0].language).toBe('JavaScript');
      expect(result[0].count).toBe(3);
      expect(result[1].language).toBe('TypeScript');
      expect(result[1].count).toBe(2);
    });

    it('should handle empty array', () => {
      const result = analyzeLanguages([]);
      expect(result).toEqual([]);
    });

    it('should calculate percentages correctly', () => {
      const files = [
        'app.js',
        'utils.js',
        'app.ts',
        'style.css',
        'index.html'
      ];
      const result = analyzeLanguages(files);

      const totalPercentage = result.reduce((sum, r) => sum + r.percentage, 0);
      expect(totalPercentage).toBeCloseTo(100, 1);
    });
  });
});
