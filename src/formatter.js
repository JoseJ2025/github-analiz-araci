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
    const commitDate = new Date(analysis.lastCommit.date).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    const healthStatus = analysis.audit?.health?.status;
    let healthBadge = chalk.green('● Aktif');
    if (healthStatus === 'Stale') healthBadge = chalk.yellow('▲ Durgun');
    if (healthStatus === 'Abandoned') healthBadge = chalk.red('■ Terk Edilmiş');

    lines.push(`${chalk.bold('📅 Son Aktivite:')}   ${chalk.white(commitDate)} (${healthBadge})`);
    lines.push(`${chalk.bold('✍️  Yazar:')}          ${chalk.gray(analysis.lastCommit.author)}`);
    lines.push(`${chalk.bold('💬 Son Commit:')}     ${chalk.gray(analysis.lastCommit.message.substring(0, 60))}${analysis.lastCommit.message.length > 60 ? '...' : ''}`);
  }

  lines.push(chalk.gray('─'.repeat(54)));

  // Tech Stack & Architecture
  if (analysis.stack) {
    const fwList = analysis.stack.frameworks.length > 0
      ? analysis.stack.frameworks.map(f => chalk.bgBlue.black(` ${f} `)).join(' ')
      : chalk.gray('Tespit Edilemedi');
    const toolsList = analysis.stack.tools.length > 0
      ? analysis.stack.tools.map(t => chalk.bgGray.white(` ${t} `)).join(' ')
      : chalk.gray('Standart');
    const archType = analysis.stack.isMonorepo ? chalk.magenta.bold('Monorepo (Multi-package)') : chalk.gray('Tekil Uygulama (Standalone)');

    lines.push(`${chalk.bold('⚙️  Frameworks:')}    ${fwList}`);
    lines.push(`${chalk.bold('🛠️  Tools/DevOps:')}   ${toolsList}`);
    lines.push(`${chalk.bold('🏗️  Mimari:')}         ${archType}`);
    lines.push(chalk.gray('─'.repeat(54)));
  }

  // Security, License & Hygiene
  if (analysis.audit) {
    const lic = analysis.audit.license;
    const licColor = lic.commercialUseAllowed ? chalk.green.bold : chalk.yellow.bold;
    lines.push(`${chalk.bold('⚖️  Lisans:')}         ${licColor(lic.spdxId)} ${chalk.gray(`(${lic.type})`)}`);

    if (analysis.audit.hygiene.hasIssues) {
      lines.push(`${chalk.bold('⚠️  Hijyen Uyarısı:')} ${chalk.red.bold(`Dikkat! Sızdırılmış olabilecek dosyalar: ${analysis.audit.hygiene.sensitiveFiles.join(', ')}`)}`);
    } else {
      lines.push(`${chalk.bold('🔒 Güvenlik:')}       ${chalk.green('Temiz')} ${chalk.gray('(Açıkta hassas config/key dosyası bulunamadı)')}`);
    }
    lines.push(chalk.gray('─'.repeat(54)));
  }

  // Scale & LLM Context Budget
  if (analysis.loc) {
    const totalLines = analysis.loc.totalLines.toLocaleString();
    const codeLines = analysis.loc.totalCodeLines.toLocaleString();
    const tokens = analysis.loc.estimatedTokens.toLocaleString();

    let tokenVerdict = chalk.green('✓ 128k LLM bağlamına rahatlıkla sığar');
    if (analysis.loc.estimatedTokens > 100000 && analysis.loc.estimatedTokens <= 200000) {
      tokenVerdict = chalk.yellow('▲ 128k bütçesini zorlayabilir, 200k model önerilir');
    } else if (analysis.loc.estimatedTokens > 200000) {
      tokenVerdict = chalk.red('■ Çok büyük repo — Parçalı/Modüler özetleme gerekir');
    }

    lines.push(`${chalk.bold('📊 Hacim & Bütçe:')}`);
    lines.push(`  • Toplam Satır:   ${chalk.cyan(totalLines)} ${chalk.gray(`(Salt Kod: ${codeLines})`)}`);
    lines.push(`  • Takip Edilen:   ${chalk.cyan(analysis.totalFiles.toLocaleString())} dosya`);
    lines.push(`  • LLM Token Yükü: ~${chalk.yellow.bold(tokens)} token ${chalk.gray('(' + tokenVerdict + ')')}`);
    lines.push(chalk.gray('─'.repeat(54)));
  }

  // Language Distribution
  if (analysis.languages && analysis.languages.length > 0) {
    lines.push(chalk.bold('🔤 Dil Dağılımı:'));

    const maxCount = analysis.languages[0].count;

    for (const lang of analysis.languages.slice(0, 8)) {
      const barLength = Math.max(1, Math.round((lang.count / maxCount) * 20));
      const bar = '█'.repeat(barLength) + '░'.repeat(20 - barLength);
      const percentage = lang.percentage.toFixed(1).padStart(5);

      lines.push(`  ${chalk.cyan(lang.language.padEnd(14))} ${chalk.green(bar)} ${percentage}%`);
    }
  } else {
    lines.push(chalk.yellow('  Programlama dili tespit edilemedi'));
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
  return chalk.red(`✖ Hata: ${message}`);
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
