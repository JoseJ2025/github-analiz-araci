import { describe, it, expect } from 'vitest';
import { formatAnalysis, formatError, formatInfo, formatSuccess, formatWarning } from '../src/formatter.js';

describe('formatter', () => {
  const sampleAnalysis = {
    repository: 'facebook/react',
    url: 'https://github.com/facebook/react',
    defaultBranch: 'main',
    lastCommit: {
      hash: 'abc123',
      date: '2026-01-08T10:30:00Z',
      author: 'Dan Abramov',
      message: 'Fix hydration error'
    },
    totalCommits: 15000,
    totalFiles: 1200,
    languages: [
      { language: 'JavaScript', count: 800, percentage: 66.7 },
      { language: 'TypeScript', count: 400, percentage: 33.3 }
    ],
    loc: {
      totalLines: 150000,
      totalCodeLines: 120000,
      totalBlankLines: 30000,
      estimatedTokens: 350000
    },
    stack: {
      frameworks: ['React'],
      tools: ['Jest', 'Rollup'],
      isMonorepo: true
    },
    audit: {
      license: {
        spdxId: 'MIT',
        type: 'Permissive',
        commercialUseAllowed: true
      },
      hygiene: {
        hasIssues: false,
        sensitiveFiles: []
      },
      health: {
        status: 'Active',
        daysSinceLastCommit: 2
      }
    }
  };

  it('should format full analysis report cleanly', () => {
    const output = formatAnalysis(sampleAnalysis);

    expect(output).toContain('REPO LENS');
    expect(output).toContain('facebook/react');
    expect(output).toContain('React');
    expect(output).toContain('MIT');
    expect(output).toContain('Monorepo');
    expect(output).toContain('Dan Abramov');
    expect(output).toContain('JavaScript');
  });

  it('should format helper messages', () => {
    expect(formatError('fail')).toContain('fail');
    expect(formatInfo('info')).toContain('info');
    expect(formatSuccess('ok')).toContain('ok');
    expect(formatWarning('warn')).toContain('warn');
  });
});
