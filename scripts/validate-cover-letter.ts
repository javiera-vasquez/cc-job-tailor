import { CoverLetterSchema } from '../src/zod/schemas';
import { parseCompanyArgs } from './shared/cli-args';
import { validateDataFile } from './shared/validator';

const { company: companyName } = parseCompanyArgs();

await validateDataFile({
  companyName,
  fileName: 'cover_letter.yaml',
  extractKey: 'cover_letter',
  schema: CoverLetterSchema,
  displayName: 'Cover letter',
});
