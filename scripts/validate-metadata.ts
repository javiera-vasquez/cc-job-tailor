import { MetadataSchema } from '../src/zod/schemas';
import { parseCompanyArgs } from './shared/cli-args';
import { validateDataFile } from './shared/validator';

const { company: companyName } = parseCompanyArgs();

await validateDataFile({
  companyName,
  fileName: 'metadata.yaml',
  schema: MetadataSchema,
  displayName: 'Metadata',
});
