import { existsSync, statSync } from 'fs';
import { resolve, basename } from 'path';

/**
 * Parse input string: either a local directory path or GitHub URL
 * @param {string} input - GitHub repository URL or local path
 * @returns {{isLocal: boolean, owner?: string, repo: string, url: string, path?: string}}
 */
export function parseGitHubUrl(input) {
  if (!input || typeof input !== 'string') {
    throw new Error('Invalid Input: Must be a non-empty string');
  }

  const trimmed = input.trim();

  // Check if it's a local directory path (e.g. '.', './dir', '/path')
  try {
    const resolvedPath = resolve(trimmed);
    if (existsSync(resolvedPath)) {
      const stat = statSync(resolvedPath);
      if (stat.isDirectory()) {
        const repoName = basename(resolvedPath) || 'local-repo';
        return {
          isLocal: true,
          owner: 'local',
          repo: repoName,
          path: resolvedPath,
          url: `local://${resolvedPath}`
        };
      }
    }
  } catch {
    // If path check fails, continue to URL parser
  }

  // Remove protocol and www prefix
  let cleanedUrl = trimmed
    .replace(/^https?:\/\/(www\.)?/, '')
    .replace(/\/$/, '');

  // Check if it's a GitHub URL
  if (!cleanedUrl.startsWith('github.com/')) {
    throw new Error('Invalid URL: Must be a GitHub repository URL or valid local directory');
  }

  // Extract owner and repo
  const parts = cleanedUrl.replace('github.com/', '').split('/');

  if (parts.length < 2) {
    throw new Error('Invalid URL: Must include owner and repository name');
  }

  const owner = parts[0];
  const repo = parts[1].replace(/\.git$/, '');

  if (!owner || !repo) {
    throw new Error('Invalid URL: Owner and repository name are required');
  }

  return {
    isLocal: false,
    owner,
    repo,
    url: `https://github.com/${owner}/${repo}.git`
  };
}
