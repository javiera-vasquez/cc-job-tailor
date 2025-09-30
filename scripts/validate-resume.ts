import { ResumeSchema } from '../src/zod/schemas';
import { parseCompanyArgs } from './shared/cli-args';
import { validateDataFile } from './shared/validator';

const { company: companyName } = parseCompanyArgs();

await validateDataFile({
  companyName,
  fileName: 'resume.yaml',
  extractKey: 'resume',
  schema: ResumeSchema,
  displayName: 'Resume',
});
