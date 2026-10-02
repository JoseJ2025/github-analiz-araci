/**
 * Tech-Stack and Architecture Detector
 * Analyzes manifest, config, and source files to identify frameworks, tools, and monorepos.
 */

const FRAMEWORK_DEPENDENCY_RULES = [
  // Node / Web
  { dep: 'next', name: 'Next.js' },
  { dep: 'react', name: 'React' },
  { dep: 'vue', name: 'Vue' },
  { dep: 'nuxt', name: 'Nuxt' },
  { dep: '@angular/core', name: 'Angular' },
  { dep: 'svelte', name: 'Svelte' },
  { dep: '@sveltejs/kit', name: 'SvelteKit' },
  { dep: 'express', name: 'Express' },
  { dep: '@nestjs/core', name: 'NestJS' },
  { dep: 'fastify', name: 'Fastify' },
  { dep: 'astro', name: 'Astro' },
  { dep: 'hono', name: 'Hono' },
  { dep: 'electron', name: 'Electron' },
  { dep: 'react-native', name: 'React Native' },
  { dep: 'expo', name: 'Expo' },

  // UI & Styling Tools
  { dep: 'tailwindcss', name: 'Tailwind CSS', isTool: true },
  { dep: '@radix-ui/react-primitive', name: 'Radix UI', isTool: true },
  { dep: '@chakra-ui/react', name: 'Chakra UI', isTool: true },
  { dep: '@mui/material', name: 'Material UI', isTool: true },
  { dep: 'styled-components', name: 'Styled Components', isTool: true },

  // Build / Test Tools
  { dep: 'vite', name: 'Vite', isTool: true },
  { dep: 'webpack', name: 'Webpack', isTool: true },
  { dep: 'vitest', name: 'Vitest', isTool: true },
  { dep: 'jest', name: 'Jest', isTool: true },
  { dep: 'turbopack', name: 'Turbopack', isTool: true },
  { dep: 'prisma', name: 'Prisma', isTool: true },
  { dep: 'drizzle-orm', name: 'Drizzle ORM', isTool: true }
];

/**
 * Analyzes repository files to determine the tech stack
 * @param {string[]} files - List of repository file paths
 * @param {Function} readFile - (path) => string
 * @returns {Object} Detected tech stack
 */
export function detectStack(files, readFile) {
  const fileSet = new Set(files.map(f => f.replace(/\\/g, '/')));
  const frameworks = new Set();
  const tools = new Set();
  const languages = new Set();
  let isMonorepo = false;

  // 1. Language file indicators
  if (files.some(f => f.endsWith('.ts') || f.endsWith('.tsx') || f === 'tsconfig.json')) {
    languages.add('TypeScript');
  }
  if (files.some(f => f.endsWith('.js') || f.endsWith('.jsx') || f.endsWith('.mjs'))) {
    languages.add('JavaScript');
  }
  if (files.some(f => f.endsWith('.py') || f === 'requirements.txt' || f === 'pyproject.toml')) {
    languages.add('Python');
  }
  if (files.some(f => f.endsWith('.rs') || f === 'Cargo.toml')) {
    languages.add('Rust');
  }
  if (files.some(f => f.endsWith('.go') || f === 'go.mod')) {
    languages.add('Go');
  }
  if (files.some(f => f.endsWith('.java') || f === 'pom.xml' || f === 'build.gradle')) {
    languages.add('Java');
  }

  // 2. Monorepo detection
  if (fileSet.has('turbo.json')) {
    isMonorepo = true;
    tools.add('Turborepo');
  }
  if (fileSet.has('pnpm-workspace.yaml')) {
    isMonorepo = true;
    tools.add('pnpm Workspace');
  }
  if (fileSet.has('lerna.json')) {
    isMonorepo = true;
    tools.add('Lerna');
  }
  if (fileSet.has('nx.json')) {
    isMonorepo = true;
    tools.add('Nx');
  }

  // 3. DevOps & Container detection
  if (fileSet.has('Dockerfile') || files.some(f => f.endsWith('/Dockerfile'))) {
    tools.add('Docker');
  }
  if (fileSet.has('docker-compose.yml') || fileSet.has('docker-compose.yaml')) {
    tools.add('Docker Compose');
  }
  if (files.some(f => f.startsWith('.github/workflows/'))) {
    tools.add('GitHub Actions');
  }
  if (fileSet.has('Makefile')) {
    tools.add('Make');
  }

  // 4. Node / package.json inspection
  if (fileSet.has('package.json')) {
    try {
      const content = readFile('package.json');
      if (content) {
        const pkg = JSON.parse(content);
        if (pkg.workspaces) {
          isMonorepo = true;
        }

        const allDeps = {
          ...(pkg.dependencies || {}),
          ...(pkg.devDependencies || {}),
          ...(pkg.peerDependencies || {})
        };

        for (const rule of FRAMEWORK_DEPENDENCY_RULES) {
          if (allDeps[rule.dep]) {
            if (rule.isTool) {
              tools.add(rule.name);
            } else {
              frameworks.add(rule.name);
            }
          }
        }
      }
    } catch {
      // Ignore JSON parse errors in malformed package.json
    }
  }

  // 5. Python inspection (requirements.txt / pyproject.toml)
  const pythonReqFile = files.find(f => f === 'requirements.txt' || f.endsWith('/requirements.txt') || f === 'pyproject.toml');
  if (pythonReqFile) {
    try {
      const content = readFile(pythonReqFile) || '';
      const lower = content.toLowerCase();
      if (lower.includes('fastapi')) frameworks.add('FastAPI');
      if (lower.includes('django')) frameworks.add('Django');
      if (lower.includes('flask')) frameworks.add('Flask');
      if (lower.includes('torch') || lower.includes('pytorch')) tools.add('PyTorch');
      if (lower.includes('tensorflow')) tools.add('TensorFlow');
      if (lower.includes('pydantic')) tools.add('Pydantic');
      if (lower.includes('poetry')) tools.add('Poetry');
    } catch {
      // Ignore
    }
  }

  // 6. Rust inspection (Cargo.toml)
  if (fileSet.has('Cargo.toml')) {
    try {
      const content = readFile('Cargo.toml') || '';
      const lower = content.toLowerCase();
      if (lower.includes('axum')) frameworks.add('Axum');
      if (lower.includes('actix')) frameworks.add('Actix Web');
      if (lower.includes('tokio')) tools.add('Tokio');
      if (lower.includes('tauri')) frameworks.add('Tauri');
    } catch {
      // Ignore
    }
  }

  // 7. Go inspection (go.mod)
  if (fileSet.has('go.mod')) {
    try {
      const content = readFile('go.mod') || '';
      if (content.includes('gin-gonic/gin')) frameworks.add('Gin');
      if (content.includes('labstack/echo')) frameworks.add('Echo');
      if (content.includes('gofiber/fiber')) frameworks.add('Fiber');
      if (content.includes('go-chi/chi')) frameworks.add('Chi');
    } catch {
      // Ignore
    }
  }

  return {
    languages: Array.from(languages),
    frameworks: Array.from(frameworks),
    tools: Array.from(tools),
    isMonorepo
  };
}
