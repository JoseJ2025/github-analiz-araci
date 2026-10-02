import { createServer } from 'http';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { parseGitHubUrl } from './urlParser.js';
import { analyzeRepo } from './analyzer.js';
import { compareAnalyses } from './comparator.js';
import { generateSkeleton } from './skeleton.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const UI_INDEX_PATH = join(__dirname, 'ui', 'index.html');

/**
 * Handle API requests and static UI serving
 */
export async function handleApiRequest(req, res, overrides = {}) {
  const parseFn = overrides.parseGitHubUrl || parseGitHubUrl;
  const analyzeFn = overrides.analyzeRepo || analyzeRepo;
  const compareFn = overrides.compareAnalyses || compareAnalyses;

  const urlObj = new URL(req.url, 'http://localhost');
  const pathname = urlObj.pathname;

  // Set default JSON headers
  const sendJson = (statusCode, data) => {
    res.writeHead(statusCode, {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(JSON.stringify(data));
  };

  // 1. /api/analyze?target=<target>
  if (pathname === '/api/analyze') {
    const target = urlObj.searchParams.get('target');
    if (!target) {
      return sendJson(400, { success: false, error: 'Target parameter is required' });
    }

    try {
      const parsed = parseFn(target);
      const analysis = await analyzeFn(parsed, null, {
        skeleton: urlObj.searchParams.get('skeleton') === 'true'
      });
      return sendJson(200, { success: true, data: analysis });
    } catch (err) {
      return sendJson(500, { success: false, error: err.message });
    }
  }

  // 2. /api/compare?targetA=<A>&targetB=<B>
  if (pathname === '/api/compare') {
    const targetA = urlObj.searchParams.get('targetA');
    const targetB = urlObj.searchParams.get('targetB');

    if (!targetA || !targetB) {
      return sendJson(400, { success: false, error: 'targetA and targetB parameters are required' });
    }

    try {
      const parsedA = parseFn(targetA);
      const parsedB = parseFn(targetB);

      const [analysisA, analysisB] = await Promise.all([
        analyzeFn(parsedA),
        analyzeFn(parsedB)
      ]);

      const diff = compareFn(analysisA, analysisB);
      return sendJson(200, {
        success: true,
        data: {
          repoA: analysisA,
          repoB: analysisB,
          comparison: diff
        }
      });
    } catch (err) {
      return sendJson(500, { success: false, error: err.message });
    }
  }

  // 3. /api/skeleton?target=<target>
  if (pathname === '/api/skeleton') {
    const target = urlObj.searchParams.get('target');
    if (!target) {
      return sendJson(400, { success: false, error: 'Target parameter is required' });
    }

    try {
      const parsed = parseFn(target);
      const analysis = await analyzeFn(parsed, null, { skeleton: true });
      return sendJson(200, { success: true, skeleton: analysis.skeleton });
    } catch (err) {
      return sendJson(500, { success: false, error: err.message });
    }
  }

  // 4. Static UI serving
  if (pathname === '/' || pathname === '/index.html') {
    try {
      if (existsSync(UI_INDEX_PATH)) {
        const html = readFileSync(UI_INDEX_PATH, 'utf-8');
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(html);
        return;
      }
    } catch {
      // Fallback
    }
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('UI index.html not found');
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Not found');
}

/**
 * Starts the local Repo-Lens Web UI server
 * @param {number} port
 * @returns {Promise<import('http').Server>}
 */
export function startServer(port = 3000) {
  return new Promise((resolve, reject) => {
    const server = createServer(async (req, res) => {
      try {
        await handleApiRequest(req, res);
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end(`Internal Server Error: ${err.message}`);
      }
    });

    server.listen(port, () => {
      resolve(server);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        // Try next port
        startServer(port + 1).then(resolve).catch(reject);
      } else {
        reject(err);
      }
    });
  });
}
