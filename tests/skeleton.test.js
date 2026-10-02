import { describe, it, expect } from 'vitest';
import { extractSignatures, generateSkeleton } from '../src/skeleton.js';

describe('skeleton', () => {
  describe('extractSignatures', () => {
    it('should extract JS/TS exported functions, classes, and interfaces', () => {
      const code = `
export interface User { id: string; name: string; }
export class UserService {
  constructor() {}
  getUser(id: string) {}
}
export function createUser(data: User): boolean {
  return true;
}
const internal = 123;
`;
      const sigs = extractSignatures('user.ts', code);
      expect(sigs.some(s => s.includes('interface User'))).toBe(true);
      expect(sigs.some(s => s.includes('class UserService'))).toBe(true);
      expect(sigs.some(s => s.includes('function createUser'))).toBe(true);
      expect(sigs.some(s => s.includes('const internal'))).toBe(false);
    });

    it('should extract Python classes and functions', () => {
      const code = `
class DatabaseClient:
    def __init__(self, url):
        self.url = url

def connect_db(url: str) -> bool:
    return True
`;
      const sigs = extractSignatures('db.py', code);
      expect(sigs.some(s => s.includes('class DatabaseClient'))).toBe(true);
      expect(sigs.some(s => s.includes('def connect_db'))).toBe(true);
    });
  });

  describe('generateSkeleton', () => {
    it('should generate complete architectural markdown skeleton', () => {
      const mockFiles = ['src/user.ts', 'src/db.py', 'package.json', 'node_modules/x.js'];
      const fileContents = {
        'src/user.ts': 'export function login() {}',
        'src/db.py': 'def connect() -> None:\n    pass',
        'package.json': '{"name": "demo"}'
      };

      const readFile = (p) => fileContents[p];
      const skeleton = generateSkeleton('my-org/demo-repo', mockFiles, readFile);

      expect(skeleton).toContain('# ARCHITECTURE SKELETON: my-org/demo-repo');
      expect(skeleton).toContain('src/user.ts');
      expect(skeleton).toContain('export function login');
      expect(skeleton).toContain('src/db.py');
      expect(skeleton).toContain('def connect');
      expect(skeleton).not.toContain('node_modules');
    });

    it('should generate XML formatted skeleton when format is xml', () => {
      const mockFiles = ['src/user.ts', 'package.json'];
      const fileContents = {
        'src/user.ts': 'export function login() {}',
        'package.json': '{"name": "demo"}'
      };

      const readFile = (p) => fileContents[p];
      const skeletonXml = generateSkeleton('my-org/demo-repo', mockFiles, readFile, { format: 'xml' });

      expect(skeletonXml).toContain('<codebase repository="my-org/demo-repo">');
      expect(skeletonXml).toContain('<file_tree>');
      expect(skeletonXml).toContain('<file path="src/user.ts" />');
      expect(skeletonXml).toContain('export function login');
      expect(skeletonXml).toContain('</codebase>');
    });
  });
});
