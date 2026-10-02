import { describe, it, expect, vi, beforeEach } from 'vitest';
import { analyzeRepo } from '../src/analyzer.js';

// Mock all dependencies at module level
vi.mock('fs/promises', () => ({
  mkdtemp: vi.fn(),
  rm: vi.fn()
}));

vi.mock('os', () => ({
  tmpdir: vi.fn(() => '/tmp')
}));

vi.mock('../src/git.js', () => ({
  cloneRepo: vi.fn(),
  getLastCommit: vi.fn(),
  getCommitCount: vi.fn(),
  getRepoFiles: vi.fn(),
  cleanup: vi.fn(),
  getDefaultBranch: vi.fn()
}));

vi.mock('../src/language.js', () => ({
  analyzeLanguages: vi.fn(),
  detectLanguage: vi.fn(() => 'JavaScript')
}));

import { mkdtemp } from 'fs/promises';
import * as gitUtils from '../src/git.js';
import { analyzeLanguages } from '../src/language.js';

describe('analyzer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Setup default mocks
    mkdtemp.mockResolvedValue('/tmp/gh-analyze-abc123');
  });

  describe('analyzeRepo', () => {
    it('should return complete analysis', async () => {
      const mockUrl = {
        owner: 'testowner',
        repo: 'testrepo',
        url: 'https://github.com/testowner/testrepo.git'
      };

      gitUtils.cloneRepo.mockResolvedValue('/tmp/gh-analyze-abc123');
      gitUtils.getLastCommit.mockResolvedValue({
        hash: 'abc123',
        date: '2026-01-08T10:30:00Z',
        message: 'Test commit',
        author: 'Test User'
      });
      gitUtils.getCommitCount.mockResolvedValue(42);
      gitUtils.getRepoFiles.mockResolvedValue([
        'src/app.js',
        'src/utils.ts',
        'tests/app.test.js',
        'package.json',
        'README.md'
      ]);
      gitUtils.getDefaultBranch.mockResolvedValue('main');
      gitUtils.cleanup.mockResolvedValue(undefined);

      const mockLanguages = [
        { language: 'JavaScript', count: 3, percentage: 60 },
        { language: 'TypeScript', count: 2, percentage: 40 }
      ];
      analyzeLanguages.mockReturnValue(mockLanguages);

      const result = await analyzeRepo(mockUrl);

      expect(result).toMatchObject({
        repository: 'testowner/testrepo',
        url: 'https://github.com/testowner/testrepo',
        defaultBranch: 'main',
        lastCommit: {
          hash: 'abc123',
          date: '2026-01-08T10:30:00Z',
          message: 'Test commit',
          author: 'Test User'
        },
        totalCommits: 42,
        totalFiles: 5,
        languages: mockLanguages
      });
    });

    it('should handle clone errors', async () => {
      const mockUrl = {
        owner: 'testowner',
        repo: 'testrepo',
        url: 'https://github.com/testowner/testrepo.git'
      };

      gitUtils.cloneRepo.mockRejectedValue(new Error('Clone failed'));

      await expect(analyzeRepo(mockUrl)).rejects.toThrow('Clone failed');
    });

    it('should handle repository with no commits', async () => {
      const mockUrl = {
        owner: 'testowner',
        repo: 'testrepo',
        url: 'https://github.com/testowner/testrepo.git'
      };

      gitUtils.cloneRepo.mockResolvedValue('/tmp/gh-analyze-abc123');
      gitUtils.getLastCommit.mockResolvedValue(null);
      gitUtils.getCommitCount.mockResolvedValue(0);
      gitUtils.getRepoFiles.mockResolvedValue([]);
      gitUtils.getDefaultBranch.mockResolvedValue('main');
      gitUtils.cleanup.mockResolvedValue(undefined);

      analyzeLanguages.mockReturnValue([]);

      const result = await analyzeRepo(mockUrl);

      expect(result.lastCommit).toBeNull();
      expect(result.totalCommits).toBe(0);
      expect(result.totalFiles).toBe(0);
      expect(result.languages).toEqual([]);
    });

    it('should call cleanup even on error', async () => {
      const mockUrl = {
        owner: 'testowner',
        repo: 'testrepo',
        url: 'https://github.com/testowner/testrepo.git'
      };

      gitUtils.cloneRepo.mockResolvedValue('/tmp/gh-analyze-abc123');
      gitUtils.getLastCommit.mockRejectedValue(new Error('Analysis failed'));
      gitUtils.cleanup.mockResolvedValue(undefined);

      await expect(analyzeRepo(mockUrl)).rejects.toThrow('Analysis failed');
      expect(gitUtils.cleanup).toHaveBeenCalledWith('/tmp/gh-analyze-abc123');
    });

    it('should analyze local repository without cloning and without deleting local directory', async () => {
      const mockLocalInput = {
        isLocal: true,
        owner: 'local',
        repo: 'my-local-project',
        path: '/home/user/my-local-project',
        url: 'local:///home/user/my-local-project'
      };

      gitUtils.getLastCommit.mockResolvedValue({
        hash: 'local123',
        date: '2026-10-02T12:00:00Z',
        message: 'Local work',
        author: 'Local Dev'
      });
      gitUtils.getCommitCount.mockResolvedValue(5);
      gitUtils.getRepoFiles.mockResolvedValue(['index.js']);
      gitUtils.getDefaultBranch.mockResolvedValue('main');
      analyzeLanguages.mockReturnValue([{ language: 'JavaScript', count: 1, percentage: 100 }]);

      const result = await analyzeRepo(mockLocalInput);

      expect(gitUtils.cloneRepo).not.toHaveBeenCalled();
      expect(gitUtils.cleanup).not.toHaveBeenCalled();
      expect(result.repository).toBe('local/my-local-project');
      expect(result.url).toBe('local:///home/user/my-local-project');
      expect(result.totalFiles).toBe(1);
    });
  });
});
