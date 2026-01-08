import chalk from 'chalk';
import Table from 'cli-table3';

/**
 * Format analysis results for console output
 * @param {Object} analysis - Analysis results
 * @returns {string} - Formatted output
 */
export function formatAnalysis(analysis) {
  const lines = [];

  // Header
  lines.push('');
  lines.push(chalk.bold.blue('📊 GitHub Repository Analysis'));
  lines.push(chalk.gray('━'.repeat(50)));
  lines.push('');

  // Repository info
  lines.push(chalk.bold('📁 Repository:') + ` ${chalk.cyan(analysis.repository)}`);
  lines.push(chalk.bold('🌐 URL:') + ` ${chalk.gray(analysis.url)}`);
  lines.push(chalk.bold('🌿 Branch:') + ` ${chalk.yellow(analysis.defaultBranch)}`);

  // Last commit
  if (analysis.lastCommit) {
    const date = new Date(analysis.lastCommit.date).toLocaleString();
    lines.push(chalk.bold('📅 Last Commit:') + ` ${chalk.gray(date)}`);
    lines.push(chalk.bold('✍️  Author:') + ` ${chalk.white(analysis.lastCommit.author)}`);
    lines.push(chalk.bold('💬 Message:') + ` ${chalk.white(analysis.lastCommit.message.substring(0, 60))}${analysis.lastCommit.message.length > 60 ? '...' : ''}`);
  } else {
    lines.push(chalk.bold('📅 Last Commit:') + ` ${chalk.red('No commits')}`);
  }

  lines.push('');

  // Statistics
  lines.push(chalk.bold('📊 Statistics:'));
  lines.push(`  • Total Files: ${chalk.cyan(analysis.totalFiles.toLocaleString())}`);
  lines.push(`  • Total Commits: ${chalk.cyan(analysis.totalCommits.toLocaleString())}`);

  lines.push('');

  // Language distribution
  if (analysis.languages.length > 0) {
    lines.push(chalk.bold('🔤 Language Distribution:'));

    const maxCount = analysis.languages[0].count;

    for (const lang of analysis.languages) {
      const barLength = Math.round((lang.count / maxCount) * 20);
      const bar = '█'.repeat(barLength) + '░'.repeat(20 - barLength);
      const percentage = lang.percentage.toFixed(1).padStart(5);

      lines.push(`  ${chalk.cyan(lang.language.padEnd(12))} ${chalk.green(bar)} ${percentage}%`);
    }
  } else {
    lines.push(chalk.yellow('  No programming languages detected'));
  }

  lines.push('');
  lines.push(chalk.gray('━'.repeat(50)));
  lines.push('');

  return lines.join('\n');
}

/**
 * Format error message
 * @param {string} message - Error message
 * @returns {string} - Formatted error
 */
export function formatError(message) {
  return chalk.red(`✖ Error: ${message}`);
}

/**
 * Format info message
 * @param {string} message - Info message
 * @returns {string} - Formatted info
 */
export function formatInfo(message) {
  return chalk.blue(`ℹ ${message}`);
}

/**
 * Format success message
 * @param {string} message - Success message
 * @returns {string} - Formatted success
 */
export function formatSuccess(message) {
  return chalk.green(`✓ ${message}`);
}

/**
 * Format warning message
 * @param {string} message - Warning message
 * @returns {string} - Formatted warning
 */
export function formatWarning(message) {
  return chalk.yellow(`⚠ ${message}`);
}
