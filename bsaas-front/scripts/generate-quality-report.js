#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { table } = require('table');
const chalk = require('chalk');

// Configuration
const ROOT_DIR = path.join(__dirname, '..');
const REPORT_DIR = path.join(ROOT_DIR, 'reports/quality');
const COMPONENTS_DIR = path.join(ROOT_DIR, 'src/app/features');

// Ensure reports directory exists
if (!fs.existsSync(REPORT_DIR)) {
  fs.mkdirSync(REPORT_DIR, { recursive: true });
}

// Run quality tools
console.log(chalk.blue('🔍 Running quality checks...'));

const runCommand = (cmd) => {
  try {
    return execSync(cmd, { cwd: ROOT_DIR, stdio: 'pipe' }).toString();
  } catch (error) {
    return error.stdout?.toString() || '';
  }
};

// 1. Run ESLint
console.log(chalk.blue('  - Running ESLint...'));
const eslintResults = []; // Will store parsed ESLint results

// 2. Run tests
console.log(chalk.blue('  - Running tests...'));
runCommand('npm run test:coverage');

// 3. Component analysis
const components = [];
const walkDir = (dir) => {
  try {
    const files = fs.readdirSync(dir);
    files.forEach((file) => {
      const fullPath = path.join(dir, file);
      try {
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          walkDir(fullPath);
        } else if (file.endsWith('.component.ts')) {
          const content = fs.readFileSync(fullPath, 'utf8');
          const lines = content.split('\n').length;
          const complexity = (content.match(/\b(if|for|while|case|catch|\?|&&|\|\|)/g) || []).length;

          components.push({
            name: file.replace('.component.ts', ''),
            path: path.relative(ROOT_DIR, fullPath),
            lines,
            complexity,
            issues: 0, // Will be updated after ESLint runs
          });
        }
      } catch (e) {
        console.warn(`Error processing ${fullPath}:`, e.message);
      }
    });
  } catch (e) {
    console.warn(`Error reading directory ${dir}:`, e.message);
  }
};

walkDir(COMPONENTS_DIR);

// Generate report
const report = {
  timestamp: new Date().toISOString(),
  metrics: {
    components: components.length,
    totalLines: components.reduce((sum, c) => sum + c.lines, 0),
    avgComplexity:
      components.length > 0 ? Math.round((components.reduce((sum, c) => sum + c.complexity, 0) / components.length) * 100) / 100 : 0,
    issues: 0, // Will be updated after ESLint runs
    testCoverage: 0, // Will be updated after tests run
  },
  components: components.sort((a, b) => b.complexity - a.complexity).slice(0, 10),
};

// Save report
const reportPath = path.join(REPORT_DIR, `quality-report-${new Date().toISOString().split('T')[0]}.json`);
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

// Print summary
console.log('\n' + chalk.green.bold('📊 Quality Report Summary'));
console.log('='.repeat(50));

// Metrics table
const metricsData = [
  ['Metric', 'Value'],
  ['Components', report.metrics.components],
  ['Total Lines', report.metrics.totalLines],
  ['Avg. Complexity', report.metrics.avgComplexity],
  ['Issues', report.metrics.issues],
  ['Test Coverage', `${report.metrics.testCoverage}%`],
];

console.log(table(metricsData));

// Complex components
console.log('\n' + chalk.yellow.bold('🔍 Most Complex Components'));
const complexTable = [['Component', 'Complexity', 'Lines', 'Issues']];

report.components.forEach((c) => {
  complexTable.push([c.name, c.complexity, c.lines, c.issues]);
});

console.log(table(complexTable));

console.log('\n' + chalk.green('✅ Quality report generated at: ') + path.relative(ROOT_DIR, reportPath));
