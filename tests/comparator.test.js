import { describe, it, expect } from 'vitest';
import { compareAnalyses, formatComparisonTable } from '../src/comparator.js';

describe('comparator', () => {
  const analysisA = {
    repository: 'pmndrs/zustand',
    url: 'https://github.com/pmndrs/zustand',
    loc: {
      totalCodeLines: 3400,
      totalLines: 4000,
      estimatedTokens: 14000
    },
    totalFiles: 42,
    stack: {
      frameworks: ['React'],
      tools: ['TypeScript'],
      isMonorepo: false
    },
    audit: {
      license: { spdxId: 'MIT', commercialUseAllowed: true },
      health: { status: 'Active', daysSinceLastCommit: 2 }
    }
  };

  const analysisB = {
    repository: 'pmndrs/jotai',
    url: 'https://github.com/pmndrs/jotai',
    loc: {
      totalCodeLines: 6800,
      totalLines: 8000,
      estimatedTokens: 28000
    },
    totalFiles: 86,
    stack: {
      frameworks: ['React'],
      tools: ['TypeScript'],
      isMonorepo: true
    },
    audit: {
      license: { spdxId: 'MIT', commercialUseAllowed: true },
      health: { status: 'Active', daysSinceLastCommit: 4 }
    }
  };

  it('should compare two analysis objects and compute differences', () => {
    const diff = compareAnalyses(analysisA, analysisB);

    expect(diff.repoA.name).toBe('pmndrs/zustand');
    expect(diff.repoB.name).toBe('pmndrs/jotai');
    expect(diff.slocDiff).toBe(-3400); // A has 3400 fewer lines
    expect(diff.tokenDiff).toBe(-14000);
    expect(diff.smallerRepo).toBe('pmndrs/zustand');
  });

  it('should format side-by-side comparison table without error', () => {
    const tableStr = formatComparisonTable(analysisA, analysisB);

    expect(tableStr).toContain('pmndrs/zustand');
    expect(tableStr).toContain('pmndrs/jotai');
    expect(tableStr).toContain('MIT');
    expect(tableStr).toContain('3,400');
    expect(tableStr).toContain('6,800');
  });
});
