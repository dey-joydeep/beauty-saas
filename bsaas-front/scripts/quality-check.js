#!/usr/bin/env node
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.join(__dirname, '..');
const QUALITY_THRESHOLD = 80; // Minimum acceptable quality score

// Utility functions for consistent logging
const log = {
  step: (message) => console.log(`\n${chalk.blue('→')} ${chalk.bold(message)}`),
  success: (message) => console.log(chalk.green(`✓ ${message}`)),
  error: (message) => console.error(chalk.red(`✗ ${message}`)),
  warn: (message) => console.warn(chalk.yellow(`! ${message}`)),
  info: (message) => console.log(chalk.cyan(`ℹ ${message}`)),
};

// Timeout function to prevent hanging
const withTimeout = (promise, ms, errorMessage = 'Operation timed out') => {
  return Promise.race([promise, new Promise((_, reject) => setTimeout(() => reject(new Error(errorMessage)), ms))]);
};

// Execute a command with timeout and better error handling
const execCommand = async (command, options = {}) => {
  const { timeout = 30000, label = command } = options;
  log.info(`Running: ${chalk.dim(command)}`);

  return new Promise((resolve, reject) => {
    const start = Date.now();
    const [cmd, ...args] = command.split(' ');
    const child = spawn(cmd, args, {
      ...options,
      shell: true,
      cwd: ROOT_DIR,
      stdio: ['inherit', 'pipe', 'pipe'],
      env: process.env,
      windowsHide: true,
    });

    let stdout = '';
    let stderr = '';
    let timeoutId;

    const cleanup = () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (!child.killed) child.kill();
    };

    // Set timeout
    if (timeout > 0) {
      timeoutId = setTimeout(() => {
        cleanup();
        const error = new Error(`Command timed out after ${timeout}ms: ${command}`);
        error.code = 'ETIMEDOUT';
        reject(error);
      }, timeout);
    }

    // Handle output
    child.stdout.on('data', (data) => {
      const str = data.toString();
      process.stdout.write(str);
      stdout += str;
    });

    child.stderr.on('data', (data) => {
      const str = data.toString();
      process.stderr.write(str);
      stderr += str;
    });

    // Handle process completion
    child.on('close', (code) => {
      cleanup();
      const duration = ((Date.now() - start) / 1000).toFixed(2);
      log.info(`Completed in ${duration}s`);

      if (code === 0) {
        resolve({ stdout, stderr });
      } else {
        const error = new Error(`Command failed with code ${code}: ${command}`);
        error.code = code;
        error.stdout = stdout;
        error.stderr = stderr;
        reject(error);
      }
    });

    // Handle process errors
    child.on('error', (error) => {
      cleanup();
      error.stdout = stdout;
      error.stderr = stderr;
      reject(error);
    });
  });
};

async function runQualityChecks() {
  try {
    console.log(chalk.blue.bold('🚀 Starting Quality Checks\n'));

    // 1. Check Node.js version
    log.step('1. Verifying Node.js version');
    const nodeVersion = process.version;
    const requiredVersion = 'v18.0.0';

    if (nodeVersion < requiredVersion) {
      log.error(`Node.js ${requiredVersion}+ is required. Current: ${nodeVersion}`);
      process.exit(1);
    }
    log.success(`Using Node.js ${nodeVersion}`);

    // 2. Check package manager
    log.step('2. Checking package manager');
    try {
      const { stdout: pmVersion } = await execCommand('npm --version', { label: 'npm --version' });
      log.success(`Using npm v${pmVersion.trim()}`);
    } catch (error) {
      log.error('Failed to verify npm installation');
      process.exit(1);
    }

    // 3. Check dependencies
    log.step('3. Checking dependencies');
    try {
      const { stdout: outdated } = await execCommand('npm outdated --json', {
        label: 'npm outdated',
        timeout: 60000, // 60 seconds
      });

      const outdatedPkgs = JSON.parse(outdated || '{}');
      const outdatedCount = Object.keys(outdatedPkgs).length;

      if (outdatedCount > 0) {
        log.warn(`Found ${outdatedCount} outdated dependencies`);
        console.log(JSON.stringify(outdatedPkgs, null, 2));
      } else {
        log.success('All dependencies are up to date');
      }
    } catch (error) {
      log.warn('Failed to check for outdated packages');
    }

    // 4. Run ESLint
    log.step('4. Running ESLint');
    try {
      await execCommand('npx eslint . --max-warnings=0 --no-error-on-unmatched-pattern', {
        label: 'ESLint',
        timeout: 120000, // 2 minutes
      });
      log.success('ESLint passed - No issues found');
    } catch (error) {
      log.error('ESLint found issues');
      process.exit(1);
    }

    // 5. Run tests
    log.step('5. Running tests');
    try {
      await execCommand('npm test -- --watchAll=false --passWithNoTests', {
        label: 'Tests',
        timeout: 300000, // 5 minutes
      });
      log.success('Tests passed');
    } catch (error) {
      log.error('Tests failed');
      process.exit(1);
    }

    // 6. Check test coverage
    log.step('6. Checking test coverage');
    try {
      await execCommand('npx jest --coverage --coverageReporters="json-summary"', {
        label: 'Test Coverage',
        timeout: 300000, // 5 minutes
      });

      const coveragePath = path.join(ROOT_DIR, 'coverage/coverage-summary.json');
      if (fs.existsSync(coveragePath)) {
        const coverage = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
        const { lines, statements, functions, branches } = coverage.total;

        console.log('\n' + chalk.underline('Coverage Summary:'));
        console.log(`Lines: ${chalk.bold(lines.pct)}%`);
        console.log(`Statements: ${statements.pct}%`);
        console.log(`Functions: ${functions.pct}%`);
        console.log(`Branches: ${branches.pct}%`);

        if (lines.pct < QUALITY_THRESHOLD) {
          log.error(`Coverage below threshold (${lines.pct}% < ${QUALITY_THRESHOLD}%)`);
          process.exit(1);
        }

        log.success(`Coverage meets threshold (${QUALITY_THRESHOLD}%+)`);
      } else {
        log.warn('No coverage report found');
      }
    } catch (error) {
      log.error('Coverage check failed');
      process.exit(1);
    }

    // 7. Bundle analysis (only with --analyze flag)
    if (process.argv.includes('--analyze')) {
      log.step('7. Analyzing bundle');
      try {
        // Ensure we have stats file
        if (!fs.existsSync(path.join(ROOT_DIR, 'dist/bsaas-front/stats.json'))) {
          await execCommand('npm run build:analyze -- --no-stats-json', {
            label: 'Build Analysis',
            timeout: 300000, // 5 minutes
          });
        }

        const statsPath = path.join(ROOT_DIR, 'dist/bsaas-front/stats.json');
        if (fs.existsSync(statsPath)) {
          const stats = JSON.parse(fs.readFileSync(statsPath, 'utf8'));
          const mainBundle = stats.assets?.find((a) => a.name.endsWith('.js'));

          if (mainBundle) {
            const sizeMB = (mainBundle.size / 1024 / 1024).toFixed(2);
            console.log('\n' + chalk.underline('Bundle Size:'));
            console.log(`Main bundle: ${chalk.bold(sizeMB)} MB`);

            const MAX_BUNDLE_SIZE = 2 * 1024 * 1024; // 2MB
            if (mainBundle.size > MAX_BUNDLE_SIZE) {
              log.error(`Bundle size exceeds 2MB (${sizeMB} MB)`);
              process.exit(1);
            }

            log.success('Bundle size within limits');
          }
        }
      } catch (error) {
        log.warn('Bundle analysis skipped or failed');
      }
    }

    console.log('\n' + chalk.green.bold('✨ All quality checks passed! ✨'));
  } catch (error) {
    log.error('Quality check failed with error:');
    console.error(error);
    process.exit(1);
  }
}

// Run the checks
runQualityChecks().catch((error) => {
  logError('Unhandled error in quality checks');
  console.error(error);
  process.exit(1);
});
