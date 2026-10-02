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
      chalk.white.bold('Boyut / Metrik'),
      chalk.cyan.bold(a.repository),
      chalk.yellow.bold(b.repository)
    ],
    colWidths: [22, 22, 22],
    wordWrap: true
  });

  // Scale / Code
  const slocAStr = `${(a.loc?.totalCodeLines || 0).toLocaleString()} satır`;
  const slocBStr = `${(b.loc?.totalCodeLines || 0).toLocaleString()} satır`;
  table.push(['Kod Satırı (SLOC)', slocAStr, slocBStr]);

  const filesAStr = `${(a.totalFiles || 0).toLocaleString()} dosya`;
  const filesBStr = `${(b.totalFiles || 0).toLocaleString()} dosya`;
  table.push(['Dosya Sayısı', filesAStr, filesBStr]);

  const tokensAStr = `~${(a.loc?.estimatedTokens || 0).toLocaleString()}`;
  const tokensBStr = `~${(b.loc?.estimatedTokens || 0).toLocaleString()}`;
  table.push(['LLM Token Bütçesi', tokensAStr, tokensBStr]);

  // Stack & Monorepo
  const fwA = (a.stack?.frameworks || []).join(', ') || 'Standart';
  const fwB = (b.stack?.frameworks || []).join(', ') || 'Standart';
  table.push(['Frameworks', fwA, fwB]);

  const monoA = a.stack?.isMonorepo ? 'Evet (Monorepo)' : 'Hayır (Tekil)';
  const monoB = b.stack?.isMonorepo ? 'Evet (Monorepo)' : 'Hayır (Tekil)';
  table.push(['Monorepo', monoA, monoB]);

  // Governance & Health
  const licA = a.audit?.license?.spdxId || 'Bilinmiyor';
  const licB = b.audit?.license?.spdxId || 'Bilinmiyor';
  table.push(['Lisans', licA, licB]);

  const healthA = a.audit?.health?.status || 'Unknown';
  const healthB = b.audit?.health?.status || 'Unknown';
  table.push(['Bakım Durumu', healthA, healthB]);

  lines.push(table.toString());

  // Verdict footer
  lines.push('');
  if (diff.smallerRepo) {
    const winner = diff.smallerRepo;
    const loser = winner === a.repository ? b.repository : a.repository;
    const savedLines = Math.abs(diff.slocDiff).toLocaleString();
    lines.push(chalk.green.bold(`💡 Karar Özeti: ${chalk.underline(winner)}, ${loser} projesine kıyasla ${savedLines} satır daha hafif.`));
  } else {
    lines.push(chalk.cyan('💡 Karar Özeti: İki repo benzer kod hacmine sahip.'));
  }
  lines.push(chalk.gray('━'.repeat(66)));
  lines.push('');

  return lines.join('\n');
}
