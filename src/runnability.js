/**
 * Runnability & Dev-Recipe Inspector
 * Infers execution recipes, package managers, test scripts, and entrypoints.
 */

const COMMON_ENTRYPOINTS = [
  'src/index.ts',
  'src/index.js',
  'src/main.ts',
  'src/main.js',
  'src/app.ts',
  'src/app.js',
  'src/main.rs',
  'src/lib.rs',
  'main.go',
  'main.py',
  'app/main.py',
  'app.py',
  'index.js',
  'index.html'
];

/**
 * Detects how to install, develop, build, and run the project
 * @param {string[]} files - List of repository relative file paths
 * @param {Function} readFile - (path) => string
 * @returns {Object} Dev recipe
 */
export function detectDevRecipe(files, readFile) {
  const fileSet = new Set(files.map(f => f.replace(/\\/g, '/')));

  let runtime = 'Unknown';
  let installCommand = null;
  let devCommand = null;
  let buildCommand = null;
  let testCommand = null;
  let entrypoint = null;

  // 1. Entrypoint detection
  for (const ep of COMMON_ENTRYPOINTS) {
    if (fileSet.has(ep)) {
      entrypoint = ep;
      break;
    }
  }

  // 2. Node.js Ecosystem
  if (fileSet.has('package.json')) {
    runtime = 'Node.js';
    let pkgManager = 'npm';

    if (fileSet.has('pnpm-lock.yaml')) {
      pkgManager = 'pnpm';
    } else if (fileSet.has('yarn.lock')) {
      pkgManager = 'yarn';
    } else if (fileSet.has('bun.lockb') || fileSet.has('bun.lock')) {
      pkgManager = 'bun';
    }

    installCommand = `${pkgManager} install`;

    try {
      const content = readFile('package.json');
      if (content) {
        const pkg = JSON.parse(content);
        const scripts = pkg.scripts || {};

        if (pkg.main && !entrypoint) {
          entrypoint = pkg.main;
        }

        if (scripts.dev) {
          devCommand = `${pkgManager} run dev`;
        } else if (scripts.start) {
          devCommand = `${pkgManager} run start`;
        }

        if (scripts.build) {
          buildCommand = `${pkgManager} run build`;
        }

        if (scripts.test) {
          testCommand = `${pkgManager} test`;
        }

        if (pkg.engines?.node) {
          runtime = `Node.js (${pkg.engines.node})`;
        }
      }
    } catch {
      // Ignore
    }
    return {
      runtime,
      installCommand,
      devCommand,
      buildCommand,
      testCommand,
      entrypoint
    };
  }

  // 3. Rust Ecosystem
  if (fileSet.has('Cargo.toml')) {
    runtime = 'Rust';
    installCommand = 'cargo build';
    devCommand = 'cargo run';
    buildCommand = 'cargo build --release';
    testCommand = 'cargo test';
    if (!entrypoint && fileSet.has('src/main.rs')) entrypoint = 'src/main.rs';
    if (!entrypoint && fileSet.has('src/lib.rs')) entrypoint = 'src/lib.rs';

    return {
      runtime,
      installCommand,
      devCommand,
      buildCommand,
      testCommand,
      entrypoint
    };
  }

  // 4. Go Ecosystem
  if (fileSet.has('go.mod')) {
    runtime = 'Go';
    installCommand = 'go mod download';
    devCommand = 'go run .';
    buildCommand = 'go build';
    testCommand = 'go test ./...';
    if (!entrypoint && fileSet.has('main.go')) entrypoint = 'main.go';

    return {
      runtime,
      installCommand,
      devCommand,
      buildCommand,
      testCommand,
      entrypoint
    };
  }

  // 5. Python Ecosystem
  if (fileSet.has('pyproject.toml') || fileSet.has('requirements.txt')) {
    runtime = 'Python';
    if (fileSet.has('pyproject.toml')) {
      const content = readFile('pyproject.toml') || '';
      if (content.includes('[tool.poetry]')) {
        installCommand = 'poetry install';
        devCommand = 'poetry run python main.py';
        testCommand = 'poetry run pytest';
      } else if (content.includes('[tool.uv]')) {
        installCommand = 'uv sync';
        devCommand = 'uv run main.py';
        testCommand = 'uv run pytest';
      } else {
        installCommand = 'pip install .';
      }
    } else {
      installCommand = 'pip install -r requirements.txt';
    }

    if (!devCommand && entrypoint) {
      devCommand = `python ${entrypoint}`;
    }
    if (!testCommand && files.some(f => f.includes('test_') || f.includes('_test.py') || f.startsWith('tests/'))) {
      testCommand = 'pytest';
    }

    return {
      runtime,
      installCommand,
      devCommand,
      buildCommand,
      testCommand,
      entrypoint
    };
  }

  return {
    runtime,
    installCommand,
    devCommand,
    buildCommand,
    testCommand,
    entrypoint
  };
}
