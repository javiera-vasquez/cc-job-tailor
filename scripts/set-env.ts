#!/usr/bin/env bun

import { parseArgs } from 'util';
import { setTailorContext } from './utils/tailor-context';

/**
 * CLI script to set tailor environment context
 * Usage: bun run set-env -C company-name
 *
 * Exit codes:
 * 0 - Success (stdout contains JSON data)
 * 1 - Failure (stderr contains error message)
 */

// Parse command-line arguments
const { values } = parseArgs({
  options: {
    C: {
      type: 'string',
      short: 'C',
    },
  },
});

const companyName = values.C;

// Validate company name argument
if (!companyName) {
  console.error('Error: Company name required');
  console.error('Usage: bun run set-env -C company-name');
  process.exit(1);
}

// Execute context setup
const result = setTailorContext(companyName);

if (result.success) {
  // Success: output JSON to stdout for Claude to parse
  console.log(JSON.stringify(result.data, null, 2));
  process.exit(0);
} else {
  // Failure: output error to stderr
  console.error(`Error: ${result.error}`);
  if (result.details) {
    console.error(`\nDetails:\n${result.details}`);
  }
  process.exit(1);
}
