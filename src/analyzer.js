import { mkdtemp } from 'fs/promises';
import { readFileSync, existsSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import {
  cloneRepo,
  getLastCommit,
  getCommitCount,
  getRepoFiles,
  cleanup,
  getDefaultBranch
} from './git.js';
import { analyzeLanguages } from './language.js';
import { analyzeLoc } from './locCounter.js';
import { detectStack } from './stackDetector.js';
import { runSecurityAudit } from './securityAudit.js';

/**
 * Analyze a GitHub repository
 * @param {{owner: string, repo: string, url: string}} parsedUrl - Parsed GitHub URL
 * @param {string} tempDir - Temporary directory for cloning
 * @returns {Promise<Object>} - Analysis results
 */
export async function analyzeRepo(parsedUrl, tempDir) {
  let clonePath = null;

  try {
    // Create temporary directory
    const tempTemplate = join(tempDir || tmpdir(), 'gh-analyze-');
    clonePath = await mkdtemp(tempTemplate);

    // Clone repository (shallow & single branch by default)
    await cloneRepo(parsedUrl.url, clonePath);

    // Gather information
    const [lastCommit, totalCommits, files, defaultBranch] = await Promise.all([
      getLastCommit(clonePath),
      getCommitCount(clonePath),
      getRepoFiles(clonePath),
      getDefaultBranch(clonePath)
    ]);

    // Safe file reader bound to clonePath
    const readFileSafely = (relPath) => {
      try {
        const fullPath = join(clonePath, relPath);
        if (existsSync(fullPath)) {
          return readFileSync(fullPath, 'utf-8');
        }
      } catch {
        return '';
      }
      return '';
    };

    // Analyze languages, LOC/tokens, tech stack and security
    const languages = analyzeLanguages(files);
    const loc = analyzeLoc(files, readFileSafely);
    const stack = detectStack(files, readFileSafely);
    const audit = runSecurityAudit(files, readFileSafely, lastCommit?.date);

    // Build result
    const result = {
      repository: `${parsedUrl.owner}/${parsedUrl.repo}`,
      url: parsedUrl.url.replace('.git', ''),
      defaultBranch,
      lastCommit,
      totalCommits,
      totalFiles: files.length,
      languages,
      loc,
      stack,
      audit
    };

    return result;
  } finally {
    // Always clean up, even on error
    if (clonePath) {
      await cleanup(clonePath);
    }
  }
}
