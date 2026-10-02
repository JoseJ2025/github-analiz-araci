import { describe, it, expect } from 'vitest';
import { parseGitHubUrl } from '../src/urlParser.js';

describe('urlParser', () => {
  describe('parseGitHubUrl', () => {
    it('should parse standard GitHub URL', () => {
      const result = parseGitHubUrl('https://github.com/owner/repo');
      expect(result).toEqual({
        isLocal: false,
        owner: 'owner',
        repo: 'repo',
        url: 'https://github.com/owner/repo.git'
      });
    });

    it('should parse GitHub URL with www prefix', () => {
      const result = parseGitHubUrl('https://www.github.com/owner/repo');
      expect(result).toEqual({
        isLocal: false,
        owner: 'owner',
        repo: 'repo',
        url: 'https://github.com/owner/repo.git'
      });
    });

    it('should parse GitHub URL without protocol', () => {
      const result = parseGitHubUrl('github.com/owner/repo');
      expect(result).toEqual({
        isLocal: false,
        owner: 'owner',
        repo: 'repo',
        url: 'https://github.com/owner/repo.git'
      });
    });

    it('should parse GitHub URL with .git extension', () => {
      const result = parseGitHubUrl('https://github.com/owner/repo.git');
      expect(result).toEqual({
        isLocal: false,
        owner: 'owner',
        repo: 'repo',
        url: 'https://github.com/owner/repo.git'
      });
    });

    it('should throw error for invalid URL', () => {
      expect(() => parseGitHubUrl('invalid-url')).toThrow();
    });

    it('should throw error for empty string', () => {
      expect(() => parseGitHubUrl('')).toThrow();
    });

    it('should throw error for non-GitHub URL', () => {
      expect(() => parseGitHubUrl('https://gitlab.com/owner/repo')).toThrow();
    });

    it('should handle URL with trailing slash', () => {
      const result = parseGitHubUrl('https://github.com/owner/repo/');
      expect(result).toEqual({
        isLocal: false,
        owner: 'owner',
        repo: 'repo',
        url: 'https://github.com/owner/repo.git'
      });
    });

    it('should detect local directory when given . or a valid path', () => {
      const result = parseGitHubUrl('.');
      expect(result.isLocal).toBe(true);
      expect(typeof result.path).toBe('string');
      expect(typeof result.repo).toBe('string');
      expect(result.url.startsWith('local://')).toBe(true);
    });

    it('should parse shorthand owner/repo format', () => {
      const result = parseGitHubUrl('expressjs/express');
      expect(result).toEqual({
        isLocal: false,
        owner: 'expressjs',
        repo: 'express',
        url: 'https://github.com/expressjs/express.git'
      });
    });
  });
});
