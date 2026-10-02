import { describe, it, expect } from 'vitest';
import { detectDevRecipe } from '../src/runnability.js';

describe('runnability', () => {
  it('should detect Node.js package.json dev scripts and entrypoint', () => {
    const files = ['package.json', 'src/index.ts'];
    const fileContents = {
      'package.json': JSON.stringify({
        name: 'web-app',
        scripts: {
          dev: 'next dev',
          build: 'next build',
          test: 'vitest'
        },
        main: 'src/index.ts',
        engines: {
          node: '>=20.0.0'
        }
      })
    };

    const readFile = (p) => fileContents[p];
    const recipe = detectDevRecipe(files, readFile);

    expect(recipe.runtime).toContain('Node.js');
    expect(recipe.installCommand).toBe('npm install');
    expect(recipe.devCommand).toBe('npm run dev');
    expect(recipe.testCommand).toBe('npm test');
    expect(recipe.entrypoint).toBe('src/index.ts');
  });

  it('should prefer pnpm or yarn when lockfiles exist', () => {
    const files = ['package.json', 'pnpm-lock.yaml'];
    const fileContents = {
      'package.json': JSON.stringify({
        scripts: { dev: 'vite' }
      })
    };

    const readFile = (p) => fileContents[p];
    const recipe = detectDevRecipe(files, readFile);

    expect(recipe.installCommand).toBe('pnpm install');
    expect(recipe.devCommand).toBe('pnpm run dev');
  });

  it('should detect Python project recipe', () => {
    const files = ['pyproject.toml', 'app/main.py'];
    const fileContents = {
      'pyproject.toml': '[tool.poetry]\nname = "api"\n[tool.poetry.dependencies]\npython = "^3.12"'
    };

    const readFile = (p) => fileContents[p];
    const recipe = detectDevRecipe(files, readFile);

    expect(recipe.runtime).toContain('Python');
    expect(recipe.installCommand).toBe('poetry install');
    expect(recipe.entrypoint).toBe('app/main.py');
  });

  it('should detect Rust project recipe', () => {
    const files = ['Cargo.toml', 'src/main.rs'];
    const fileContents = {
      'Cargo.toml': '[package]\nname = "rust-tool"'
    };

    const readFile = (p) => fileContents[p];
    const recipe = detectDevRecipe(files, readFile);

    expect(recipe.runtime).toBe('Rust');
    expect(recipe.installCommand).toBe('cargo build');
    expect(recipe.testCommand).toBe('cargo test');
    expect(recipe.devCommand).toBe('cargo run');
    expect(recipe.entrypoint).toBe('src/main.rs');
  });
});
