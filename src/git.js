import simpleGit from 'simple-git';
import { rm } from 'fs/promises';
import { join, relative } from 'path';
import { readdirSync, statSync } from 'fs';

/**
 * List files recursively as fallback if not a git repository
 * @param {string} dir
 * @param {string} baseDir
 * @returns {string[]}
 */
function getFilesRecursively(dir, baseDir = dir) {
  let results = [];
  try {
    const list = readdirSync(dir);
    for (const item of list) {
      if (item === '.git' || item === 'node_modules' || item === 'dist' || item === 'build' || item === '.next') {
        continue;
      }
      const fullPath = join(dir, item);
      const stat = statSync(fullPath);
      if (stat.isDirectory()) {
        results = results.concat(getFilesRecursively(fullPath, baseDir));
      } else {
        results.push(relative(baseDir, fullPath).replace(/\\/g, '/'));
      }
    }
  } catch {
    // Ignore access errors
  }
  return results;
}

/**
 * Clone a Git repository
 * @param {string} url - Repository URL
 * @param {string} targetPath - Target directory path
 * @param {string[]} options - Clone options
 * @returns {Promise<string>} - Path to cloned repository
 */
export async function cloneRepo(url, targetPath, options = ['--depth', '1', '--single-branch']) {
  try {
    const git = simpleGit();
    await git.clone(url, targetPath, options);
    return targetPath;
  } catch (error) {
    throw new Error(`Failed to clone repository: ${error.message}`);
  }
}

/**
 * Get the last commit from a repository
 * @param {string} repoPath - Path to repository
 * @returns {Promise<{hash: string, date: string, message: string, author: string}|null>}
 */
export async function getLastCommit(repoPath) {
  try {
    const git = simpleGit(repoPath);
    const log = await git.log({ maxCount: 1 });

    if (!log || !log.latest) {
      return null;
    }

    return {
      hash: log.latest.hash,
      date: log.latest.date,
      message: log.latest.message,
      author: log.latest.author_name
    };
  } catch (error) {
    throw new Error(`Failed to get last commit: ${error.message}`);
  }
}

/**
 * Get the total number of commits in a repository
 * @param {string} repoPath - Path to repository
 * @returns {Promise<number>}
 */
export async function getCommitCount(repoPath) {
  try {
    const git = simpleGit(repoPath);
    const log = await git.log();
    return log.total;
  } catch (error) {
    throw new Error(`Failed to get commit count: ${error.message}`);
  }
}

/**
 * Get all tracked files in a repository, with filesystem fallback
 * @param {string} repoPath - Path to repository
 * @returns {Promise<string[]>}
 */
export async function getRepoFiles(repoPath) {
  try {
    const git = simpleGit(repoPath);
    const files = await git.raw(['ls-files']);

    if (files && files.trim().length > 0) {
      return files.trim().split('\n').filter(Boolean);
    }
  } catch {
    // Fall back to filesystem scan below
  }

  return getFilesRecursively(repoPath);
}

/**
 * Clean up cloned repository
 * @param {string} repoPath - Path to repository
 * @returns {Promise<void>}
 */
export async function cleanup(repoPath) {
  try {
    await rm(repoPath, { recursive: true, force: true });
  } catch (error) {
    console.warn(`Warning: Failed to clean up ${repoPath}: ${error.message}`);
  }
}

/**
 * Get the default branch name
 * @param {string} repoPath - Path to repository
 * @returns {Promise<string>}
 */
export async function getDefaultBranch(repoPath) {
  try {
    const git = simpleGit(repoPath);
    const branches = await git.branch();

    if (branches.all && branches.all.includes('main')) {
      return 'main';
    }
    if (branches.all && branches.all.includes('master')) {
      return 'master';
    }

    return branches.current || 'unknown';
  } catch {
    return 'unknown';
  }
}
