#!/usr/bin/env node

/**
 * Collective Consciousness Field Generator - Validation Runner
 *
 * This script executes the complete validation framework and outputs results.
 *
 * Usage:
 *   node run-validation.js
 *   node run-validation.js --export-json
 *   node run-validation.js --export-csv
 *   node run-validation.js --export-pdf
 */

import { runCompleteValidation, generateValidationCharts, exportValidationPDF } from './src/utils/runValidation.ts';
import { globalValidationFramework } from './src/utils/validationFramework.ts';
import * as fs from 'fs';

const args = process.argv.slice(2);

async function main() {
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║   COLLECTIVE CONSCIOUSNESS FIELD VALIDATION PROTOCOL v1.0      ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  // Run complete validation
  const report = await runCompleteValidation();

  // Handle export options
  if (args.includes('--export-json')) {
    const json = globalValidationFramework.exportToJSON();
    const filename = `validation-report-${Date.now()}.json`;
    fs.writeFileSync(filename, json);
    console.log(`✓ JSON report exported to: ${filename}`);
  }

  if (args.includes('--export-csv')) {
    const csvData = globalValidationFramework.exportToCSV();
    Object.entries(csvData).forEach(([name, data]) => {
      const filename = `validation-${name}-${Date.now()}.csv`;
      fs.writeFileSync(filename, data);
      console.log(`✓ CSV exported to: ${filename}`);
    });
  }

  if (args.includes('--export-pdf')) {
    const markdown = exportValidationPDF(report);
    const filename = `validation-report-${Date.now()}.md`;
    fs.writeFileSync(filename, markdown);
    console.log(`✓ Markdown report (PDF-ready) exported to: ${filename}`);
    console.log('  Convert to PDF with: pandoc ' + filename + ' -o report.pdf');
  }

  // Generate charts data
  const charts = generateValidationCharts(report);
  console.log('\n=== VALIDATION CHARTS DATA ===');
  console.log(JSON.stringify(charts, null, 2));

  console.log('\n=== NEXT STEPS ===\n');
  console.log('1. Review the validation report above');
  console.log('2. Address any failed tests');
  console.log('3. Update documentation to use recommended reframings');
  console.log('4. Export data for peer review (use --export-json or --export-csv)');
  console.log('5. See VERIFICATION_PROTOCOL.md for detailed methodology\n');

  console.log('For independent verification, all raw data is available in the exports.');
  console.log('Questions? See documentation or contact the development team.\n');
}

main().catch(console.error);
