import chalk from 'chalk';

/**
 * Format analysis results for console output
 * @param {Object} analysis - Analysis results
 * @returns {string} - Formatted output
 */
export function formatAnalysis(analysis) {
  const lines = [];

  // Header
  lines.push('');
  lines.push(chalk.bold.cyan('🔭 REPO LENS — Repository Diagnostic Report'));
  lines.push(chalk.gray('━'.repeat(54)));

  // Core Identity
  lines.push(`${chalk.bold('📁 Repository:')}   ${chalk.white.bold(analysis.repository)}`);
  lines.push(`${chalk.bold('🌐 URL:')}          ${chalk.gray(analysis.url)}`);
  lines.push(`${chalk.bold('🌿 Default Branch:')} ${chalk.yellow(analysis.defaultBranch || 'unknown')}`);

  // Last commit & health
  if (analysis.lastCommit) {
    const commitDate = new Date(analysis.lastCommit.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    const healthStatus = analysis.audit?.health?.status;
    let healthBadge = chalk.green('● Active');
    if (healthStatus === 'Stale') healthBadge = chalk.yellow('▲ Stale');
    if (healthStatus === 'Abandoned') healthBadge = chalk.red('■ Abandoned');

    lines.push(`${chalk.bold('📅 Last Activity:')}   ${chalk.white(commitDate)} (${healthBadge})`);
    lines.push(`${chalk.bold('✍️  Author:')}          ${chalk.gray(analysis.lastCommit.author)}`);
    lines.push(`${chalk.bold('💬 Latest Commit:')}  ${chalk.gray(analysis.lastCommit.message.substring(0, 60))}${analysis.lastCommit.message.length > 60 ? '...' : ''}`);
  }

  lines.push(chalk.gray('─'.repeat(54)));

  // Tech Stack & Architecture
  if (analysis.stack) {
    const fwList = analysis.stack.frameworks.length > 0
      ? analysis.stack.frameworks.map(f => chalk.bgBlue.black(` ${f} `)).join(' ')
      : chalk.gray('None detected');
    const toolsList = analysis.stack.tools.length > 0
      ? analysis.stack.tools.map(t => chalk.bgGray.white(` ${t} `)).join(' ')
      : chalk.gray('Standard');
    const archType = analysis.stack.isMonorepo ? chalk.magenta.bold('Monorepo (Multi-package)') : chalk.gray('Standalone Application');

    lines.push(`${chalk.bold('⚙️  Frameworks:')}    ${fwList}`);
    lines.push(`${chalk.bold('🛠️  Tools/DevOps:')}   ${toolsList}`);
    lines.push(`${chalk.bold('🏗️  Architecture:')}   ${archType}`);
    lines.push(chalk.gray('─'.repeat(54)));
  }

  // Dev Recipe / Runnability
  if (analysis.recipe && (analysis.recipe.runtime !== 'Unknown' || analysis.recipe.installCommand)) {
    lines.push(chalk.bold.magenta('🚀 RUNNABILITY & DEV RECIPE'));
    if (analysis.recipe.runtime && analysis.recipe.runtime !== 'Unknown') {
      lines.push(`  • Runtime:        ${chalk.white(analysis.recipe.runtime)}`);
    }
    if (analysis.recipe.entrypoint) {
      lines.push(`  • Entrypoint:     ${chalk.cyan(analysis.recipe.entrypoint)}`);
    }
    if (analysis.recipe.installCommand) {
      lines.push(`  • Dependencies:   ${chalk.green(analysis.recipe.installCommand)}`);
    }
    if (analysis.recipe.devCommand) {
      lines.push(`  • Development:    ${chalk.green(analysis.recipe.devCommand)}`);
    }
    if (analysis.recipe.buildCommand) {
      lines.push(`  • Build:          ${chalk.green(analysis.recipe.buildCommand)}`);
    }
    if (analysis.recipe.testCommand) {
      lines.push(`  • Test:           ${chalk.green(analysis.recipe.testCommand)}`);
    }
    lines.push(chalk.gray('─'.repeat(54)));
  }

  // Security, License & Hygiene
  if (analysis.audit) {
    const lic = analysis.audit.license;
    const licColor = lic.commercialUseAllowed ? chalk.green.bold : chalk.yellow.bold;
    lines.push(`${chalk.bold('⚖️  License:')}        ${licColor(lic.spdxId)} ${chalk.gray(`(${lic.type})`)}`);

    if (analysis.audit.hygiene.hasIssues) {
      lines.push(`${chalk.bold('⚠️  Hygiene Alert:')} ${chalk.red.bold(`Warning! Potentially exposed sensitive files: ${analysis.audit.hygiene.sensitiveFiles.join(', ')}`)}`);
    } else {
      lines.push(`${chalk.bold('🔒 Security:')}       ${chalk.green('Clean')} ${chalk.gray('(No sensitive credentials or keys exposed)')}`);
    }
    lines.push(chalk.gray('─'.repeat(54)));
  }

  // Scale & LLM Context Budget
  if (analysis.loc) {
    const totalLines = analysis.loc.totalLines.toLocaleString();
    const codeLines = analysis.loc.totalCodeLines.toLocaleString();
    const tokens = analysis.loc.estimatedTokens.toLocaleString();

    let tokenVerdict = chalk.green('✓ Comfortably fits within 128k LLM context');
    if (analysis.loc.estimatedTokens > 100000 && analysis.loc.estimatedTokens <= 200000) {
      tokenVerdict = chalk.yellow('▲ Tight for 128k, 200k model recommended');
    } else if (analysis.loc.estimatedTokens > 200000) {
      tokenVerdict = chalk.red('■ Large repository — Modular skeleton/summarization recommended');
    }

    lines.push(`${chalk.bold('📊 Code Scale & LLM Budget:')}`);
    lines.push(`  • Total Lines:    ${chalk.cyan(totalLines)} ${chalk.gray(`(Source Code: ${codeLines})`)}`);
    lines.push(`  • Tracked Files:  ${chalk.cyan(analysis.totalFiles.toLocaleString())} files`);
    lines.push(`  • LLM Context:    ~${chalk.yellow.bold(tokens)} tokens ${chalk.gray('(' + tokenVerdict + ')')}`);
    lines.push(chalk.gray('─'.repeat(54)));
  }

  // Language Distribution
  if (analysis.languages && analysis.languages.length > 0) {
    lines.push(chalk.bold('🔤 Language Breakdown:'));

    const maxCount = analysis.languages[0].count;

    for (const lang of analysis.languages.slice(0, 8)) {
      const barLength = Math.max(1, Math.round((lang.count / maxCount) * 20));
      const bar = '█'.repeat(barLength) + '░'.repeat(20 - barLength);
      const percentage = lang.percentage.toFixed(1).padStart(5);

      lines.push(`  ${chalk.cyan(lang.language.padEnd(14))} ${chalk.green(bar)} ${percentage}%`);
    }
  } else {
    lines.push(chalk.yellow('  No programming languages detected'));
  }

  lines.push(chalk.gray('━'.repeat(54)));
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
