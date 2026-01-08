import simpleGit from 'simple-git';
import { rm } from 'fs/promises';
import { join } from 'path';

/**
 * Clone a Git repository
 * @param {string} url - Repository URL
 * @param {string} targetPath - Target directory path
 * @returns {Promise<string>} - Path to cloned repository
 */
export async function cloneRepo(url, targetPath) {
  try {
    const git = simpleGit();
    await git.clone(url, targetPath);
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

    if (!log.latest) {
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
 * Get all tracked files in a repository
 * @param {string} repoPath - Path to repository
 * @returns {Promise<string[]>}
 */
export async function getRepoFiles(repoPath) {
  try {
    const git = simpleGit(repoPath);
    const files = await git.raw(['ls-files']);

    if (!files) {
      return [];
    }

    return files.trim().split('\n').filter(Boolean);
  } catch (error) {
    throw new Error(`Failed to get repository files: ${error.message}`);
  }
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
    // Log but don't throw - cleanup failures are not critical
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

    // Try to find main or master
    if (branches.all.includes('main')) {
      return 'main';
    }
    if (branches.all.includes('master')) {
      return 'master';
    }

    // Return current branch as fallback
    return branches.current || 'unknown';
  } catch (error) {
    return 'unknown';
  }
}
