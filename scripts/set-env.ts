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
  // Format output similar to tailor-server style
  const data = result.data;
  const fileCount = data.availableFiles?.length || 0;
  const filesList = data.availableFiles?.join(', ') || 'none';

  // Success header with emoji and key info
  loggers.setEnv.success(`Context set • ${data.company} • ${fileCount} file(s)`);

  // Display key details in a compact, scannable format
  loggers.setEnv.info(`   -Path: ${data.path}`);
  loggers.setEnv.info(`   -Position: ${data.position || 'Not specified'}`);
  loggers.setEnv.info(`   -Focus: ${data.primaryFocus || 'Not specified'}`);
  loggers.setEnv.info(`   -Files: ${filesList}`);

  // Display next action
  loggers.setEnv.info('🚀 All good, please start the tailor-server');

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
