/**
 * Language extension mapping
 */
const LANGUAGE_MAP = {
  // JavaScript
  'js': 'JavaScript',
  'jsx': 'JavaScript',
  'mjs': 'JavaScript',
  'cjs': 'JavaScript',

  // TypeScript
  'ts': 'TypeScript',
  'tsx': 'TypeScript',

  // Python
  'py': 'Python',
  'pyw': 'Python',

  // Web
  'html': 'HTML',
  'htm': 'HTML',
  'css': 'CSS',
  'scss': 'SCSS',
  'sass': 'Sass',
  'less': 'Less',

  // Data
  'json': 'JSON',
  'xml': 'XML',
  'yaml': 'YAML',
  'yml': 'YAML',

  // Documentation
  'md': 'Markdown',
  'rst': 'reStructuredText',

  // Config
  'toml': 'TOML',
  'ini': 'INI',

  // Shell
  'sh': 'Shell',
  'bash': 'Bash',
  'zsh': 'Zsh',

  // Other
  'java': 'Java',
  'c': 'C',
  'cpp': 'C++',
  'cc': 'C++',
  'cxx': 'C++',
  'h': 'C',
  'hpp': 'C++',
  'cs': 'C#',
  'go': 'Go',
  'rs': 'Rust',
  'rb': 'Ruby',
  'php': 'PHP',
  'swift': 'Swift',
  'kt': 'Kotlin',
  'scala': 'Scala',
  'dart': 'Dart',
  'lua': 'Lua',
  'r': 'R',
  'sql': 'SQL',
};

/**
 * Special files without extensions
 */
const SPECIAL_FILES = {
  'Dockerfile': 'Dockerfile',
  'Makefile': 'Makefile',
  'docker-compose.yml': 'Docker Compose',
  'docker-compose.yaml': 'Docker Compose',
  'package.json': 'JSON',
  'package-lock.json': 'JSON',
  'tsconfig.json': 'JSON',
  '.gitignore': 'Git Ignore',
  '.env': 'Environment',
};

/**
 * Detect programming language from filename
 * @param {string} filename - File name or path
 * @returns {string} - Detected language
 */
export function detectLanguage(filename) {
  if (!filename || typeof filename !== 'string') {
    return 'Unknown';
  }

  // Check special files first
  const basename = filename.split('/').pop().split('\\').pop();
  if (SPECIAL_FILES[basename]) {
    return SPECIAL_FILES[basename];
  }

  // Extract extension
  const parts = basename.split('.');
  if (parts.length < 2) {
    return 'Unknown';
  }

  const extension = parts[parts.length - 1].toLowerCase();

  return LANGUAGE_MAP[extension] || 'Unknown';
}

/**
 * Analyze languages from file list
 * @param {string[]} files - Array of file paths
 * @returns {{language: string, count: number, percentage: number}[]}
 */
export function analyzeLanguages(files) {
  if (!Array.isArray(files) || files.length === 0) {
    return [];
  }

  // Count languages
  const languageCounts = {};

  for (const file of files) {
    const language = detectLanguage(file);

    if (language !== 'Unknown') {
      languageCounts[language] = (languageCounts[language] || 0) + 1;
    }
  }

  // Convert to array and calculate percentages
  const totalKnownFiles = Object.values(languageCounts).reduce((sum, count) => sum + count, 0);

  if (totalKnownFiles === 0) {
    return [];
  }

  const result = Object.entries(languageCounts)
    .map(([language, count]) => ({
      language,
      count,
      percentage: Math.round((count / totalKnownFiles) * 1000) / 10
    }))
    .sort((a, b) => b.count - a.count);

  return result;
}
