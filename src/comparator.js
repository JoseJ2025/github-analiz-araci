import chalk from 'chalk';
import Table from 'cli-table3';

/**
 * Computes delta and metrics between two repository analyses
 * @param {Object} a - First analysis object
 * @param {Object} b - Second analysis object
 * @returns {Object} Comparison data
 */
export function compareAnalyses(a, b) {
  const slocA = a.loc?.totalCodeLines || 0;
  const slocB = b.loc?.totalCodeLines || 0;
  const tokensA = a.loc?.estimatedTokens || 0;
  const tokensB = b.loc?.estimatedTokens || 0;
  const filesA = a.totalFiles || 0;
  const filesB = b.totalFiles || 0;

  const slocDiff = slocA - slocB;
  const tokenDiff = tokensA - tokensB;

  let smallerRepo = null;
  if (slocA < slocB) smallerRepo = a.repository;
  else if (slocB < slocA) smallerRepo = b.repository;

  return {
    repoA: {
      name: a.repository,
      sloc: slocA,
      tokens: tokensA,
      files: filesA,
      license: a.audit?.license?.spdxId || 'N/A',
      health: a.audit?.health?.status || 'Unknown'
    },
    repoB: {
      name: b.repository,
      sloc: slocB,
      tokens: tokensB,
      files: filesB,
      license: b.audit?.license?.spdxId || 'N/A',
      health: b.audit?.health?.status || 'Unknown'
    },
    slocDiff,
    tokenDiff,
    smallerRepo
  };
}

/**
 * Formats a clean side-by-side terminal comparison table
 * @param {Object} a - First analysis object
 * @param {Object} b - Second analysis object
 * @returns {string} Formatted CLI output
 */
export function formatComparisonTable(a, b) {
  const diff = compareAnalyses(a, b);
  const lines = [];

  lines.push('');
  lines.push(chalk.bold.cyan('⚖️  REPO LENS — HEAD-TO-HEAD COMPARISON'));
  lines.push(chalk.gray('━'.repeat(66)));

  const table = new Table({
    head: [
      chalk.white.bold('Dimension / Metric'),
      chalk.cyan.bold(a.repository),
      chalk.yellow.bold(b.repository)
    ],
    colWidths: [22, 22, 22],
    wordWrap: true
  });

  // Scale / Code
  const slocAStr = `${(a.loc?.totalCodeLines || 0).toLocaleString()} lines`;
  const slocBStr = `${(b.loc?.totalCodeLines || 0).toLocaleString()} lines`;
  table.push(['Source Lines (SLOC)', slocAStr, slocBStr]);

  const filesAStr = `${(a.totalFiles || 0).toLocaleString()} files`;
  const filesBStr = `${(b.totalFiles || 0).toLocaleString()} files`;
  table.push(['File Count', filesAStr, filesBStr]);

  const tokensAStr = `~${(a.loc?.estimatedTokens || 0).toLocaleString()}`;
  const tokensBStr = `~${(b.loc?.estimatedTokens || 0).toLocaleString()}`;
  table.push(['LLM Token Budget', tokensAStr, tokensBStr]);

  const cocomoA = a.loc?.cocomo ? `~${a.loc.cocomo.effortMonths} mo (${a.loc.cocomo.formattedCost})` : 'N/A';
  const cocomoB = b.loc?.cocomo ? `~${b.loc.cocomo.effortMonths} mo (${b.loc.cocomo.formattedCost})` : 'N/A';
  table.push(['Dev Effort (COCOMO)', cocomoA, cocomoB]);

  // Stack & Monorepo
  const fwA = (a.stack?.frameworks || []).join(', ') || 'Standard';
  const fwB = (b.stack?.frameworks || []).join(', ') || 'Standard';
  table.push(['Frameworks', fwA, fwB]);

  const monoA = a.stack?.isMonorepo ? 'Yes (Monorepo)' : 'No (Standalone)';
  const monoB = b.stack?.isMonorepo ? 'Yes (Monorepo)' : 'No (Standalone)';
  table.push(['Monorepo', monoA, monoB]);

  // Governance & Health
  const licA = a.audit?.license?.spdxId || 'Unknown';
  const licB = b.audit?.license?.spdxId || 'Unknown';
  table.push(['License', licA, licB]);

  const healthA = a.audit?.health?.status || 'Unknown';
  const healthB = b.audit?.health?.status || 'Unknown';
  table.push(['Maintenance Health', healthA, healthB]);

  lines.push(table.toString());

  // Verdict footer
  lines.push('');
  if (diff.smallerRepo) {
    const winner = diff.smallerRepo;
    const loser = winner === a.repository ? b.repository : a.repository;
    const savedLines = Math.abs(diff.slocDiff).toLocaleString();
    lines.push(chalk.green.bold(`💡 Verdict: ${chalk.underline(winner)} is ${savedLines} lines leaner than ${loser}.`));
  } else {
    lines.push(chalk.cyan('💡 Verdict: Both repositories have comparable code scale.'));
  }
  lines.push(chalk.gray('━'.repeat(66)));
  lines.push('');

  return lines.join('\n');
}
