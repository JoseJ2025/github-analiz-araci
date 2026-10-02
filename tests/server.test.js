import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { createServer } from 'http';
import { handleApiRequest } from '../src/server.js';

describe('server API handler', () => {
  it('should handle /api/analyze endpoint with valid target', async () => {
    const mockAnalysis = {
      repository: 'local/test',
      totalFiles: 10,
      loc: { totalCodeLines: 500, estimatedTokens: 2000 }
    };

    const analyzeFn = vi.fn().mockResolvedValue(mockAnalysis);
    const parseFn = vi.fn().mockReturnValue({ isLocal: true, path: '/tmp/test', repo: 'test', owner: 'local' });

    const req = {
      url: '/api/analyze?target=.',
      method: 'GET'
    };

    let responseData = '';
    let responseStatus = 200;
    const res = {
      writeHead: (status, headers) => { responseStatus = status; },
      end: (data) => { responseData = data; }
    };

    await handleApiRequest(req, res, { analyzeRepo: analyzeFn, parseGitHubUrl: parseFn });

    expect(responseStatus).toBe(200);
    const json = JSON.parse(responseData);
    expect(json.success).toBe(true);
    expect(json.data.repository).toBe('local/test');
  });

  it('should return 400 when target parameter is missing', async () => {
    const req = {
      url: '/api/analyze',
      method: 'GET'
    };

    let responseData = '';
    let responseStatus = 200;
    const res = {
      writeHead: (status, headers) => { responseStatus = status; },
      end: (data) => { responseData = data; }
    };

    await handleApiRequest(req, res, {});

    expect(responseStatus).toBe(400);
    const json = JSON.parse(responseData);
    expect(json.success).toBe(false);
    expect(json.error.toLowerCase()).toContain('target');
  });
});
