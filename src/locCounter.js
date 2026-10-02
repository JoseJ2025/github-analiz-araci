import { detectLanguage } from './language.js';

const IGNORED_DIRS = [
  'node_modules/',
  'dist/',
  'build/',
  '.git/',
  'vendor/',
  '.next/',
  '.nuxt/',
  'target/',
  'coverage/',
  '.cache/'
];

const IGNORED_FILES = [
  'package-lock.json',
  'yarn.lock',
  'pnpm-lock.yaml',
  'composer.lock',
  'Cargo.lock',
  'Gemfile.lock',
  'poetry.lock'
];

/**
 * Checks whether a given relative file path should be ignored from LOC / token analysis
 * @param {string} filePath
 * @returns {boolean}
 */
export function shouldIgnore(filePath) {
  if (!filePath || typeof filePath !== 'string') return true;

  const normalized = filePath.replace(/\\/g, '/');

  // Check directory prefixes or segments
  for (const dir of IGNORED_DIRS) {
    if (normalized.startsWith(dir) || normalized.includes(`/${dir}`)) {
      return true;
    }
  }

  // Check minified extensions
  if (normalized.endsWith('.min.js') || normalized.endsWith('.min.css') || normalized.endsWith('.bundle.js')) {
    return true;
  }

  // Check lockfiles
  const basename = normalized.split('/').pop();
  if (IGNORED_FILES.includes(basename)) {
    return true;
  }

  return false;
}

/**
 * Estimates token count from total characters
 * Standard heuristic: 1 token ~= 4 characters in English/code
 * @param {number} chars
 * @returns {number}
 */
export function estimateTokens(chars) {
  if (!chars || chars <= 0) return 0;
  return Math.ceil(chars / 4);
}

/**
 * Counts total, blank, and code lines for string content
 * @param {string} content
 * @returns {{total: number, blank: number, code: number, chars: number}}
 */
export function countLines(content) {
  if (!content || typeof content !== 'string') {
    return { total: 0, blank: 0, code: 0, chars: 0 };
  }

  const lines = content.split('\n');
  let blank = 0;
  let code = 0;

  for (const line of lines) {
    if (line.trim().length === 0) {
      blank++;
    } else {
      code++;
    }
  }

  return {
    total: lines.length,
    blank,
    code,
    chars: content.length
  };
}

/**
 * Analyzes LOC and estimated tokens across repository files
 * @param {string[]} files - List of relative file paths
 * @param {Function} readFileContent - Function (path) => string
 * @returns {Object} LOC metrics
 */
export function analyzeLoc(files, readFileContent) {
  const result = {
    scannedFiles: 0,
    ignoredFiles: 0,
    totalLines: 0,
    totalCodeLines: 0,
    totalBlankLines: 0,
    totalChars: 0,
    estimatedTokens: 0,
    byLanguage: {}
  };

  if (!Array.isArray(files)) return result;

  for (const file of files) {
    if (shouldIgnore(file)) {
      result.ignoredFiles++;
      continue;
    }

    let content = '';
    try {
      content = readFileContent(file) || '';
    } catch {
      result.ignoredFiles++;
      continue;
    }

    result.scannedFiles++;
    const counts = countLines(content);
    result.totalLines += counts.total;
    result.totalCodeLines += counts.code;
    result.totalBlankLines += counts.blank;
    result.totalChars += counts.chars;

    const lang = detectLanguage(file);
    if (!result.byLanguage[lang]) {
      result.byLanguage[lang] = {
        codeLines: 0,
        totalLines: 0,
        files: 0,
        chars: 0
      };
    }

    result.byLanguage[lang].codeLines += counts.code;
    result.byLanguage[lang].totalLines += counts.total;
    result.byLanguage[lang].files += 1;
    result.byLanguage[lang].chars += counts.chars;
  }

  result.estimatedTokens = estimateTokens(result.totalChars);
  result.cocomo = estimateCocomo(result.totalCodeLines);

  return result;
}

/**
 * Calculates COCOMO-based effort and estimated development value
 * Standard Organic Model: Effort = 2.4 * (KSLOC)^1.05
 * @param {number} codeLines - Total physical source code lines
 * @param {number} [averageMonthlySalary=4500] - USD
 * @returns {{ effortMonths: number, scheduleMonths: number, estimatedCost: number, formattedCost: string }}
 */
export function estimateCocomo(codeLines, averageMonthlySalary = 4500) {
  if (!codeLines || codeLines <= 0) {
    return { effortMonths: 0, scheduleMonths: 0, estimatedCost: 0, formattedCost: '$0' };
  }
  const ksloc = codeLines / 1000;
  const effortMonths = Math.max(0.1, Number((2.4 * Math.pow(ksloc, 1.05)).toFixed(1)));
  const scheduleMonths = Math.max(0.1, Number((2.5 * Math.pow(effortMonths, 0.38)).toFixed(1)));
  const estimatedCost = Math.round(effortMonths * averageMonthlySalary);

  return {
    effortMonths,
    scheduleMonths,
    estimatedCost,
    formattedCost: `$${estimatedCost.toLocaleString()}`
  };
}
