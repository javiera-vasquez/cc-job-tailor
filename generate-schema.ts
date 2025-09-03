import * as TJS from 'ts-json-schema-generator';
import { writeFileSync } from 'fs';

/**
 * Generates a JSON schema from TypeScript types using ts-json-schema-generator
 */
function generateSchemaFromTypes() {
  try {
    // Configure the schema generator
    const config = {
      path: './src/types.ts',
      tsconfig: './tsconfig.json',
      type: 'Schemas', // Generate schema for the Schemas type
    };

    // Create the generator and generate the schema
    const generator = TJS.createGenerator(config);
    const schema = generator.createSchema(config.type);

    // Convert to JSON string with proper formatting
    const schemaString = JSON.stringify(schema, null, 2);
    
    // Write the schema to file
    writeFileSync('./data/schema.json', schemaString, 'utf8');
    
    console.log('✅ JSON Schema generated successfully at ./schema.json');
    console.log('📝 Generated from TypeScript types in ./src/types.ts');
    
    return schema;
  } catch (error) {
    console.error('❌ Error generating schema:', error);
    throw error;
  }
}

// Run the schema generation if this file is executed directly
if (import.meta.main) {
  generateSchemaFromTypes();
}

export { generateSchemaFromTypes };