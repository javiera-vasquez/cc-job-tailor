import { parseArgs } from 'util';
import {
  CoverLetterSchema,
  JobAnalysisSchema,
  MetadataSchema,
  ResumeSchema,
} from '../src/zod/schemas';
import { validateDataFile } from './shared/validator';

type ValidationType = 'metadata' | 'resume' | 'job-analysis' | 'cover-letter';

interface ValidationConfig {
  fileName: string;
  schema: any;
  displayName: string;
  extractKey?: string;
}

const validationConfigs: Record<ValidationType, ValidationConfig> = {
  metadata: {
    fileName: 'metadata.yaml',
    schema: MetadataSchema,
    displayName: 'Metadata',
  },
  resume: {
    fileName: 'resume.yaml',
    schema: ResumeSchema,
    displayName: 'Resume',
    extractKey: 'resume',
  },
  'job-analysis': {
    fileName: 'job_analysis.yaml',
    schema: JobAnalysisSchema,
    displayName: 'Job analysis',
    extractKey: 'job_analysis',
  },
  'cover-letter': {
    fileName: 'cover_letter.yaml',
    schema: CoverLetterSchema,
    displayName: 'Cover letter',
    extractKey: 'cover_letter',
  },
};

// Parse arguments: first positional is validation type, -C flag for company
const { values, positionals } = parseArgs({
  args: Bun.argv.slice(2),
  options: {
    company: {
      type: 'string',
      short: 'C',
      multiple: false,
    },
  },
  strict: true,
  allowPositionals: true,
});

const validationType = positionals[0] as ValidationType;

if (!validationType || !validationConfigs[validationType]) {
  console.error(
    `Invalid validation type: ${validationType}\nValid types: ${Object.keys(validationConfigs).join(', ')}`
  );
  process.exit(1);
}

const companyName = values.company;
const config = validationConfigs[validationType];

await validateDataFile({
  companyName,
  fileName: config.fileName,
  schema: config.schema,
  displayName: config.displayName,
  ...(config.extractKey && { extractKey: config.extractKey }),
});
