import { describe, it, expect } from 'vitest';
import { detectStack } from '../src/stackDetector.js';

describe('stackDetector', () => {
  it('should detect Node.js Next.js + Tailwind + TypeScript stack', () => {
    const files = ['package.json', 'tsconfig.json', 'src/app/page.tsx', 'tailwind.config.js'];
    const fileContents = {
      'package.json': JSON.stringify({
        name: 'my-app',
        dependencies: {
          'next': '^15.0.0',
          'react': '^19.0.0',
          'react-dom': '^19.0.0'
        },
        devDependencies: {
          'typescript': '^5.0.0',
          'tailwindcss': '^3.4.0'
        }
      })
    };

    const readFileMock = (path) => fileContents[path];
    const stack = detectStack(files, readFileMock);

    expect(stack.frameworks).toContain('Next.js');
    expect(stack.frameworks).toContain('React');
    expect(stack.tools).toContain('Tailwind CSS');
    expect(stack.languages).toContain('TypeScript');
    expect(stack.isMonorepo).toBe(false);
  });

  it('should detect Python FastAPI + Docker stack', () => {
    const files = ['requirements.txt', 'Dockerfile', 'main.py'];
    const fileContents = {
      'requirements.txt': 'fastapi==0.110.0\nuvicorn==0.28.0\npydantic>=2.0'
    };

    const readFileMock = (path) => fileContents[path];
    const stack = detectStack(files, readFileMock);

    expect(stack.frameworks).toContain('FastAPI');
    expect(stack.tools).toContain('Docker');
    expect(stack.languages).toContain('Python');
  });

  it('should detect Monorepo setups (Turborepo / pnpm)', () => {
    const files = ['turbo.json', 'pnpm-workspace.yaml', 'package.json'];
    const fileContents = {
      'package.json': JSON.stringify({
        name: 'monorepo-root',
        workspaces: ['packages/*', 'apps/*']
      })
    };

    const readFileMock = (path) => fileContents[path];
    const stack = detectStack(files, readFileMock);

    expect(stack.isMonorepo).toBe(true);
    expect(stack.tools).toContain('Turborepo');
    expect(stack.tools).toContain('pnpm Workspace');
  });

  it('should detect Rust and Go projects', () => {
    const files = ['Cargo.toml', 'go.mod'];
    const fileContents = {
      'Cargo.toml': '[package]\nname = "my-rust-app"\n[dependencies]\ntokio = "1.0"\naxum = "0.7"',
      'go.mod': 'module mygo\ngo 1.22\nrequire github.com/gin-gonic/gin v1.9.1'
    };

    const readFileMock = (path) => fileContents[path];
    const stack = detectStack(files, readFileMock);

    expect(stack.languages).toContain('Rust');
    expect(stack.languages).toContain('Go');
    expect(stack.frameworks).toContain('Axum');
    expect(stack.frameworks).toContain('Gin');
  });
});
