---
allowed-tools: Bash(bun run generate-pdf:*)
description: Generate PDF documents (resume, cover letter, or both) with automatic validation and theme selection | argument-hint: company-name [resume|cover-letter|both]
---

Generate PDF documents for company: $1

Document type: ${2:-both}

Run PDF generation with company-specific tailored data:

```bash
if [ -z "$1" ]; then
  echo "Error: Company name is required"
  echo "Usage: /generate-pdf company-name [resume|cover-letter|both]"
  exit 1
fi

COMPANY_NAME="$1"
DOCUMENT_TYPE="${2:-both}"

echo "Generating PDF documents for company: $COMPANY_NAME"
echo "Document type: $DOCUMENT_TYPE"

if [ "$DOCUMENT_TYPE" = "both" ]; then
  bun run generate-pdf -C "$COMPANY_NAME"
else
  bun run generate-pdf -C "$COMPANY_NAME" -D "$DOCUMENT_TYPE"
fi
```
