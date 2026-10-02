#!/usr/bin/env node

import { Command } from 'commander';
import { parseGitHubUrl } from './urlParser.js';
import { analyzeRepo } from './analyzer.js';
import { formatAnalysis, formatError, formatInfo, formatSuccess } from './formatter.js';
import { compareAnalyses, formatComparisonTable } from './comparator.js';

const program = new Command();

program
  .name('gh-analyze')
  .description('Repo-Lens: Instant token-free GitHub repository & local project diagnostic for developers & AI agents')
  .version('2.3.0');

// Subcommand: compare
program
  .command('compare')
  .description('Compare two repositories or directories side-by-side')
  .argument('<targetA>', 'First GitHub URL or local path')
  .argument('<targetB>', 'Second GitHub URL or local path')
  .option('-j, --json', 'Output comparison as JSON')
  .action(async (targetA, targetB, options) => {
    try {
      const parsedA = parseGitHubUrl(targetA);
      const parsedB = parseGitHubUrl(targetB);

      const [analysisA, analysisB] = await Promise.all([
        analyzeRepo(parsedA),
        analyzeRepo(parsedB)
      ]);

      if (options.json) {
        const diff = compareAnalyses(analysisA, analysisB);
        console.log(JSON.stringify({ repoA: analysisA, repoB: analysisB, comparison: diff }, null, 2));
      } else {
        console.log(formatComparisonTable(analysisA, analysisB));
      }
    } catch (error) {
      console.error(formatError(error.message));
      process.exit(1);
    }
  });

// Default scan command
program
  .argument('[target]', 'GitHub repository URL or local directory path (.)')
  .option('-j, --json', 'Output as JSON')
  .option('-v, --verbose', 'Verbose output')
  .action(async (target, options) => {
    if (!target) {
      program.help();
      return;
    }

    try {
      const parsedUrl = parseGitHubUrl(target);

      if (options.verbose) {
        console.log(formatInfo(`Analyzing target: ${parsedUrl.repo}...`));
      }

      const analysis = await analyzeRepo(parsedUrl);

      if (options.json) {
        console.log(JSON.stringify(analysis, null, 2));
      } else {
        console.log(formatAnalysis(analysis));
      }

      if (options.verbose) {
        console.log(formatSuccess('Analysis complete!'));
      }
    } catch (error) {
      console.error(formatError(error.message));
      process.exit(1);
    }
  });

program.parse();
