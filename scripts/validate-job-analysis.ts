import { JobAnalysisSchema } from '../src/zod/schemas';
import { parseCompanyArgs } from './shared/cli-args';
import { validateDataFile } from './shared/validator';

const { company: companyName } = parseCompanyArgs();

await validateDataFile({
  companyName,
  fileName: 'job_analysis.yaml',
  extractKey: 'job_analysis',
  schema: JobAnalysisSchema,
  displayName: 'Job analysis',
});
