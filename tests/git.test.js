import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { cloneRepo, getLastCommit, getCommitCount, getRepoFiles, cleanup, getDefaultBranch } from '../src/git.js';

// Mock simple-git
vi.mock('simple-git', () => ({
  default: vi.fn(() => ({
    clone: vi.fn(),
    log: vi.fn(),
    raw: vi.fn(),
    branch: vi.fn()
  }))
}));

// Mock fs/promises
vi.mock('fs/promises', () => ({
  rm: vi.fn(),
  mkdtemp: vi.fn()
}));

import simpleGit from 'simple-git';
import { rm, mkdtemp } from 'fs/promises';

describe('git', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('cloneRepo', () => {
    it('should clone repository to temp directory', async () => {
      const mockGit = {
        clone: vi.fn().mockResolvedValue(undefined)
      };
      simpleGit.mockReturnValue(mockGit);

      const result = await cloneRepo('https://github.com/owner/repo.git', '/tmp/test');

      expect(mockGit.clone).toHaveBeenCalledWith(
        'https://github.com/owner/repo.git',
        '/tmp/test',
        ['--depth', '1', '--single-branch']
      );
      expect(result).toBe('/tmp/test');
    });

    it('should clone repository with custom options if provided', async () => {
      const mockGit = {
        clone: vi.fn().mockResolvedValue(undefined)
      };
      simpleGit.mockReturnValue(mockGit);

      const customOptions = ['--depth', '10'];
      const result = await cloneRepo('https://github.com/owner/repo.git', '/tmp/test', customOptions);

      expect(mockGit.clone).toHaveBeenCalledWith(
        'https://github.com/owner/repo.git',
        '/tmp/test',
        customOptions
      );
      expect(result).toBe('/tmp/test');
    });

    it('should handle clone errors', async () => {
      const mockGit = {
        clone: vi.fn().mockRejectedValue(new Error('Clone failed'))
      };
      simpleGit.mockReturnValue(mockGit);

      await expect(
        cloneRepo('https://github.com/owner/repo.git', '/tmp/test')
      ).rejects.toThrow('Failed to clone repository');
    });
  });

  describe('getLastCommit', () => {
    it('should return last commit data', async () => {
      const mockLog = {
        latest: {
          hash: 'abc123',
          date: '2026-01-08T10:30:00Z',
          message: 'Initial commit',
          author_name: 'Test User'
        },
        total: 10
      };

      const mockGit = {
        log: vi.fn().mockResolvedValue(mockLog)
      };
      simpleGit.mockReturnValue(mockGit);

      const result = await getLastCommit('/tmp/test');

      expect(result).toEqual({
        hash: 'abc123',
        date: '2026-01-08T10:30:00Z',
        message: 'Initial commit',
        author: 'Test User'
      });
    });

    it('should handle repository with no commits', async () => {
      const mockGit = {
        log: vi.fn().mockResolvedValue({ total: 0, latest: null })
      };
      simpleGit.mockReturnValue(mockGit);

      const result = await getLastCommit('/tmp/test');

      expect(result).toBeNull();
    });
  });

  describe('getCommitCount', () => {
    it('should return total commit count', async () => {
      const mockGit = {
        log: vi.fn().mockResolvedValue({ total: 42 })
      };
      simpleGit.mockReturnValue(mockGit);

      const result = await getCommitCount('/tmp/test');

      expect(result).toBe(42);
    });

    it('should return 0 for empty repository', async () => {
      const mockGit = {
        log: vi.fn().mockResolvedValue({ total: 0 })
      };
      simpleGit.mockReturnValue(mockGit);

      const result = await getCommitCount('/tmp/test');

      expect(result).toBe(0);
    });
  });

  describe('getRepoFiles', () => {
    it('should return all tracked files', async () => {
      const files = [
        'src/app.js',
        'src/utils.js',
        'tests/app.test.js',
        'package.json',
        'README.md'
      ];

      const mockGit = {
        raw: vi.fn().mockResolvedValue(files.join('\n'))
      };
      simpleGit.mockReturnValue(mockGit);

      const result = await getRepoFiles('/tmp/test');

      expect(result).toEqual(files);
      expect(mockGit.raw).toHaveBeenCalledWith(['ls-files']);
    });

    it('should handle empty repository', async () => {
      const mockGit = {
        raw: vi.fn().mockResolvedValue('')
      };
      simpleGit.mockReturnValue(mockGit);

      const result = await getRepoFiles('/tmp/test');

      expect(result).toEqual([]);
    });
  });

  describe('getDefaultBranch', () => {
    it('should return main branch if available', async () => {
      const mockGit = {
        branch: vi.fn().mockResolvedValue({
          all: ['main', 'develop'],
          current: 'main'
        })
      };
      simpleGit.mockReturnValue(mockGit);

      const result = await getDefaultBranch('/tmp/test');

      expect(result).toBe('main');
    });

    it('should return master branch if main not available', async () => {
      const mockGit = {
        branch: vi.fn().mockResolvedValue({
          all: ['master', 'develop'],
          current: 'master'
        })
      };
      simpleGit.mockReturnValue(mockGit);

      const result = await getDefaultBranch('/tmp/test');

      expect(result).toBe('master');
    });

    it('should return current branch as fallback', async () => {
      const mockGit = {
        branch: vi.fn().mockResolvedValue({
          all: ['develop'],
          current: 'develop'
        })
      };
      simpleGit.mockReturnValue(mockGit);

      const result = await getDefaultBranch('/tmp/test');

      expect(result).toBe('develop');
    });

    it('should return unknown on error', async () => {
      const mockGit = {
        branch: vi.fn().mockRejectedValue(new Error('Git error'))
      };
      simpleGit.mockReturnValue(mockGit);

      const result = await getDefaultBranch('/tmp/test');

      expect(result).toBe('unknown');
    });
  });

  describe('cleanup', () => {
    it('should remove directory', async () => {
      rm.mockResolvedValue(undefined);

      await cleanup('/tmp/test');

      expect(rm).toHaveBeenCalledWith('/tmp/test', {
        recursive: true,
        force: true
      });
    });

    it('should handle cleanup errors gracefully', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      rm.mockRejectedValue(new Error('Permission denied'));

      await cleanup('/tmp/test');

      expect(consoleWarnSpy).toHaveBeenCalled();
      consoleWarnSpy.mockRestore();
    });
  });
});
