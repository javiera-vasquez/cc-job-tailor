#!/usr/bin/env bun

import { parseArgs } from 'util';
import { setTailorContext } from './utils/tailor-context';
import { loggers } from './shared/logger';

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
  loggers.setEnv.error('Company name required');
  loggers.setEnv.info('Usage: bun run set-env -C company-name');
  process.exit(1);
}

// Execute context setup
const result = setTailorContext(companyName);

if (result.success) {
  // Success: use logger (respects LOG_FORMAT for JSON/human output)
  loggers.setEnv.info('Tailor context set successfully', result.data);
  process.exit(0);
} else {
  // Failure: log error with details
  loggers.setEnv.error(
    result.error,
    null,
    result.details ? { details: result.details } : undefined,
  );
  process.exit(1);
}
