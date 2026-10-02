/**
 * Security, License & Repository Health Auditor
 */

const LICENSE_PATTERNS = [
  {
    spdxId: 'MIT',
    type: 'Permissive',
    commercialUseAllowed: true,
    matches: (text) => text.includes('MIT License') || text.includes('Permission is hereby granted, free of charge')
  },
  {
    spdxId: 'Apache-2.0',
    type: 'Permissive',
    commercialUseAllowed: true,
    matches: (text) => text.includes('Apache License') && (text.includes('Version 2.0') || text.includes('v2.0'))
  },
  {
    spdxId: 'GPL-3.0',
    type: 'Copyleft',
    commercialUseAllowed: true, // Allowed but requires open-sourcing derivative work
    matches: (text) => text.includes('GNU GENERAL PUBLIC LICENSE') && (text.includes('Version 3') || text.includes('v3'))
  },
  {
    spdxId: 'GPL-2.0',
    type: 'Copyleft',
    commercialUseAllowed: true,
    matches: (text) => text.includes('GNU GENERAL PUBLIC LICENSE') && (text.includes('Version 2') || text.includes('v2'))
  },
  {
    spdxId: 'BSD-3-Clause',
    type: 'Permissive',
    commercialUseAllowed: true,
    matches: (text) => text.includes('Redistribution and use in source and binary forms') && text.includes('Neither the name')
  },
  {
    spdxId: 'ISC',
    type: 'Permissive',
    commercialUseAllowed: true,
    matches: (text) => text.includes('ISC License') || text.includes('Permission to use, copy, modify, and/or distribute this software')
  }
];

const SENSITIVE_FILENAME_PATTERNS = [
  /^\.env/i,
  /\.pem$/i,
  /\.key$/i,
  /\.pfx$/i,
  /\.p12$/i,
  /^id_rsa/i,
  /^id_ed25519/i,
  /^id_ecdsa/i,
  /service-account.*\.json$/i,
  /credentials.*\.json$/i
];

const SECRET_CONTENT_PATTERNS = [
  { name: 'GitHub Personal Access Token', regex: /(?:ghp|gho|ghu|ghs|ghr)_[a-zA-Z0-9]{36}/ },
  { name: 'OpenAI API Key', regex: /sk-(?:proj-)?[a-zA-Z0-9_-]{32,}/ },
  { name: 'AWS Access Key ID', regex: /AKIA[0-9A-Z]{16}/ },
  { name: 'Private Key Block', regex: /-----BEGIN (?:RSA|EC|DSA|OPENSSH|PRIVATE) KEY-----/ },
  { name: 'Slack Token', regex: /xox[baprs]-[0-9a-zA-Z]{10,48}/ }
];

/**
 * Detects the license from repository files
 * @param {string[]} files - List of file paths
 * @param {Function} readFile - (path) => string
 * @returns {Object} License details
 */
export function detectLicense(files, readFile) {
  const licenseFile = files.find(f => {
    const base = f.split('/').pop().toLowerCase();
    return base === 'license' || base === 'license.md' || base === 'license.txt' || base === 'copying';
  });

  if (!licenseFile) {
    return {
      spdxId: 'NOASSERTION',
      type: 'Unlicensed / Proprietary',
      commercialUseAllowed: false,
      file: null
    };
  }

  let content = '';
  try {
    content = readFile(licenseFile) || '';
  } catch {
    return {
      spdxId: 'UNKNOWN',
      type: 'Unreadable License',
      commercialUseAllowed: false,
      file: licenseFile
    };
  }

  for (const rule of LICENSE_PATTERNS) {
    if (rule.matches(content)) {
      return {
        spdxId: rule.spdxId,
        type: rule.type,
        commercialUseAllowed: rule.commercialUseAllowed,
        file: licenseFile
      };
    }
  }

  return {
    spdxId: 'CUSTOM',
    type: 'Custom License',
    commercialUseAllowed: false,
    file: licenseFile
  };
}

/**
 * Audits repository for accidentally committed secrets or sensitive files
 * @param {string[]} files - List of file paths
 * @param {Function} [readFile] - Optional file reader for content secret scanning
 * @returns {Object} Hygiene report
 */
export function auditHygiene(files, readFile) {
  const sensitiveFiles = [];
  const exposedSecrets = [];

  for (const file of files) {
    const basename = file.split('/').pop();
    for (const pattern of SENSITIVE_FILENAME_PATTERNS) {
      if (pattern.test(basename)) {
        sensitiveFiles.push(file);
        break;
      }
    }

    // Content secret scan on non-binary/non-ignored files
    if (readFile && typeof readFile === 'function') {
      const ext = file.split('.').pop().toLowerCase();
      const scannableExts = ['js', 'ts', 'jsx', 'tsx', 'json', 'py', 'go', 'rs', 'yaml', 'yml', 'env', 'txt', 'toml'];
      if (scannableExts.includes(ext) || file.startsWith('.env')) {
        try {
          const content = readFile(file);
          if (content && typeof content === 'string') {
            for (const sp of SECRET_CONTENT_PATTERNS) {
              if (sp.regex.test(content)) {
                exposedSecrets.push({
                  file,
                  type: sp.name
                });
                break;
              }
            }
          }
        } catch {
          // Ignore unreadable
        }
      }
    }
  }

  return {
    hasIssues: sensitiveFiles.length > 0 || exposedSecrets.length > 0,
    sensitiveFiles,
    exposedSecrets
  };
}

/**
 * Evaluates repository maintenance activity based on the last commit date
 * @param {string} lastCommitDate - ISO date string
 * @returns {Object} Maintenance status
 */
export function evaluateMaintenanceHealth(lastCommitDate) {
  if (!lastCommitDate) {
    return {
      status: 'Unknown',
      daysSinceLastCommit: null,
      description: 'Commit tarihi alınamadı'
    };
  }

  const commitTime = new Date(lastCommitDate).getTime();
  if (isNaN(commitTime)) {
    return {
      status: 'Unknown',
      daysSinceLastCommit: null,
      description: 'Geçersiz commit tarihi'
    };
  }

  const now = Date.now();
  const diffDays = Math.max(0, Math.floor((now - commitTime) / (1000 * 60 * 60 * 24)));

  if (diffDays <= 90) {
    return {
      status: 'Active',
      daysSinceLastCommit: diffDays,
      description: `Aktif bakım yapılıyor (${diffDays} gün önce commit)`
    };
  } else if (diffDays <= 365) {
    return {
      status: 'Stale',
      daysSinceLastCommit: diffDays,
      description: `Durgun/Yavaş (${diffDays} gündür commit yok)`
    };
  } else {
    return {
      status: 'Abandoned',
      daysSinceLastCommit: diffDays,
      description: `Terk edilmiş/Arşivlik (${Math.floor(diffDays / 365)} yıldan uzun süredir commit yok)`
    };
  }
}

/**
 * Runs unified security, license, and hygiene audit
 * @param {string[]} files
 * @param {Function} readFile
 * @param {string} lastCommitDate
 * @returns {Object} Complete audit report
 */
export function runSecurityAudit(files, readFile, lastCommitDate) {
  const license = detectLicense(files, readFile);
  const hygiene = auditHygiene(files, readFile);
  const health = evaluateMaintenanceHealth(lastCommitDate);

  return {
    license,
    hygiene,
    health
  };
}
