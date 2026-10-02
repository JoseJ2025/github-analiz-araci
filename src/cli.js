#!/usr/bin/env node

import { Command } from 'commander';
import { parseGitHubUrl } from './urlParser.js';
import { analyzeRepo } from './analyzer.js';
import { formatAnalysis, formatError, formatInfo, formatSuccess } from './formatter.js';

const program = new Command();

program
  .name('gh-analyze')
  .description('Repo-Lens: Instant token-free GitHub repository diagnostic for developers & AI agents')
  .version('2.0.0')
  .argument('<url>', 'GitHub repository URL')
  .option('-j, --json', 'Output as JSON')
  .option('-v, --verbose', 'Verbose output')
  .action(async (url, options) => {
    try {
      // Parse URL
      const parsedUrl = parseGitHubUrl(url);

      if (options.verbose) {
        console.log(formatInfo(`Cloning repository: ${parsedUrl.owner}/${parsedUrl.repo}...`));
      }

      // Analyze repository
      const analysis = await analyzeRepo(parsedUrl);

      // Output results
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
