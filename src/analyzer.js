import { mkdtemp } from 'fs/promises';
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

    // Clone repository
    await cloneRepo(parsedUrl.url, clonePath);

    // Gather information
    const [lastCommit, totalCommits, files, defaultBranch] = await Promise.all([
      getLastCommit(clonePath),
      getCommitCount(clonePath),
      getRepoFiles(clonePath),
      getDefaultBranch(clonePath)
    ]);

    // Analyze languages
    const languages = analyzeLanguages(files);

    // Build result
    const result = {
      repository: `${parsedUrl.owner}/${parsedUrl.repo}`,
      url: parsedUrl.url.replace('.git', ''),
      defaultBranch,
      lastCommit,
      totalCommits,
      totalFiles: files.length,
      languages
    };

    return result;
  } finally {
    // Always clean up, even on error
    if (clonePath) {
      await cleanup(clonePath);
    }
  }
}
