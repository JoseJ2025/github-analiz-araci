#!/usr/bin/env node

import { writeFileSync } from 'fs';
import { Command } from 'commander';
import { parseGitHubUrl } from './urlParser.js';
import { analyzeRepo } from './analyzer.js';
import { formatAnalysis, formatError, formatInfo, formatSuccess } from './formatter.js';
import { compareAnalyses, formatComparisonTable } from './comparator.js';
import { startServer } from './server.js';

const program = new Command();

program
  .name('gh-analyze')
  .description('Repo-Lens: Instant token-free GitHub repository & local project diagnostic for developers & AI agents')
  .version('3.3.0');

// Subcommand: ui
program
  .command('ui')
  .description('Launch interactive local web dashboard')
  .argument('[port]', 'Port to listen on (default: 3000)', '3000')
  .action(async (port) => {
    try {
      const portNum = parseInt(port, 10) || 3000;
      const server = await startServer(portNum);
      const actualPort = server.address().port;
      console.log(formatSuccess(`Repo-Lens Web Studio is running at: http://localhost:${actualPort}`));
      console.log(formatInfo('Press Ctrl+C to stop.'));
    } catch (err) {
      console.error(formatError(`Failed to start UI server: ${err.message}`));
      process.exit(1);
    }
  });

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
  .option('-s, --skeleton', 'Export concise architectural skeleton (signatures & structure) for AI agents')
  .option('-f, --format <format>', 'Skeleton output format: markdown or xml', 'markdown')
  .option('-o, --output <file>', 'Save output to a specific file')
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

      const analysis = await analyzeRepo(parsedUrl, null, {
        skeleton: Boolean(options.skeleton),
        format: options.format || 'markdown'
      });

      if (options.skeleton) {
        if (options.output) {
          writeFileSync(options.output, analysis.skeleton, 'utf-8');
          console.log(formatSuccess(`Architectural skeleton saved to ${options.output}`));
        } else {
          console.log(analysis.skeleton);
        }
        return;
      }

      let outputContent = '';
      if (options.json) {
        outputContent = JSON.stringify(analysis, null, 2);
      } else {
        outputContent = formatAnalysis(analysis);
      }

      if (options.output) {
        writeFileSync(options.output, outputContent, 'utf-8');
        console.log(formatSuccess(`Report saved to ${options.output}`));
      } else {
        console.log(outputContent);
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
