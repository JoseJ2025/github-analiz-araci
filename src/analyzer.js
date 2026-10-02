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
import { detectDevRecipe } from './runnability.js';
import { generateSkeleton } from './skeleton.js';

/**
 * Analyze a GitHub repository or local directory
 * @param {{isLocal?: boolean, owner?: string, repo: string, url: string, path?: string}} parsedUrl
 * @param {string} tempDir - Temporary directory for cloning (if remote)
 * @param {Object} options - Analysis options (e.g. { skeleton: true })
 * @returns {Promise<Object>} - Analysis results
 */
export async function analyzeRepo(parsedUrl, tempDir, options = {}) {
  let clonePath = null;
  const isLocal = Boolean(parsedUrl.isLocal);

  try {
    if (isLocal) {
      clonePath = parsedUrl.path;
    } else {
      // Create temporary directory
      const tempTemplate = join(tempDir || tmpdir(), 'gh-analyze-');
      clonePath = await mkdtemp(tempTemplate);

      // Clone repository (shallow & single branch by default)
      await cloneRepo(parsedUrl.url, clonePath);
    }

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
    const recipe = detectDevRecipe(files, readFileSafely);

    let skeleton = null;
    if (options.skeleton) {
      skeleton = generateSkeleton(`${parsedUrl.owner}/${parsedUrl.repo}`, files, readFileSafely, {
        format: options.format || 'markdown'
      });
    }

    // Build result
    const result = {
      isLocal,
      repository: `${parsedUrl.owner}/${parsedUrl.repo}`,
      url: parsedUrl.url.replace('.git', ''),
      defaultBranch,
      lastCommit,
      totalCommits,
      totalFiles: files.length,
      languages,
      loc,
      stack,
      audit,
      recipe,
      skeleton
    };

    return result;
  } finally {
    // Only cleanup temporary clones, NEVER delete local user directory!
    if (!isLocal && clonePath) {
      await cleanup(clonePath);
    }
  }
}
