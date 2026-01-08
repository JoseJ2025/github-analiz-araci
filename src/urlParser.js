/**
 * Parse GitHub URL and extract owner and repo
 * @param {string} url - GitHub repository URL
 * @returns {{owner: string, repo: string, url: string}}
 */
export function parseGitHubUrl(url) {
  if (!url || typeof url !== 'string') {
    throw new Error('Invalid URL: URL must be a non-empty string');
  }

  // Remove protocol and www prefix
  let cleanedUrl = url.trim()
    .replace(/^https?:\/\/(www\.)?/, '')
    .replace(/\/$/, '');

  // Check if it's a GitHub URL
  if (!cleanedUrl.startsWith('github.com/')) {
    throw new Error('Invalid URL: Must be a GitHub repository URL');
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
    owner,
    repo,
    url: `https://github.com/${owner}/${repo}.git`
  };
}
