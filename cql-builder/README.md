# CQL Builder

**Natural Language LLM-based Clinical Quality Language (CQL) Code Builder**

Generate production-ready CQL code using natural language. Based on [HL7 CQL v1.5.3](https://cql.hl7.org/) specification and [CQF Measures Implementation Guide](https://build.fhir.org/ig/HL7/cqf-measures/).

## Features

- **AI-Powered Generation**: Describe your measure in plain English and get compliant CQL code
- **Guided Workflow**: Step-by-step conversational flow covering:
  - A. Purpose of the measure
  - B. Problem being solved
  - C. Measure type (Clinical Quality, Operational, Population Health, etc.)
  - D. Value set selection with VSAC OIDs
  - E. Clinical evidence references
- **CQL Compilation**: Compile CQL to ELM using the [CQL Translation Service](https://github.com/cqframework/cql-translation-service)
- **CQL Execution**: Execute CQL against FHIR patient data using [cql-execution](https://github.com/cqframework/cql-execution)
- **VSAC Integration**: Value set resolution with [cql-exec-vsac](https://github.com/cqframework/cql-exec-vsac)
- **FHIR R4 Support**: Full FHIR R4 data model support with [cql-exec-fhir](https://github.com/cqframework/cql-exec-fhir)
- **VS Code Compatible**: Generated code works with [CQL Language Support extension](https://marketplace.visualstudio.com/items?itemName=cqframework.cql)
- **Synthea Testing**: Configuration for testing against synthetic patient data

## CQL Framework Integration

This project uses the official CQL Framework npm packages:

| Package | Version | Purpose |
|---------|---------|---------|
| [cql-execution](https://www.npmjs.com/package/cql-execution) | 3.0.1 | Core CQL execution engine |
| [cql-exec-fhir](https://www.npmjs.com/package/cql-exec-fhir) | 2.1.4 | FHIR R4 patient data source |
| [cql-exec-vsac](https://www.npmjs.com/package/cql-exec-vsac) | 2.2.0 | VSAC value set resolution |

## Supported Measure Types

| Type | Description |
|------|-------------|
| Clinical Quality (eCQM) | CMS/MIPS quality reporting measures |
| Operational | Process efficiency and utilization |
| Population Health | Outcomes across patient populations |
| Consumer Insight | Patient experience and engagement |
| Decision Support | Real-time clinical alerts and recommendations |

## Scoring Methodologies

- **Proportion**: Numerator/Denominator percentage
- **Ratio**: Two related but distinct populations
- **Continuous Variable**: Numeric values (mean, median)
- **Cohort**: Population identification

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Anthropic API key (for AI generation)
- UMLS API key (for VSAC value set resolution, optional)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-repo/cql-builder.git
cd cql-builder

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local and add your ANTHROPIC_API_KEY

# Start development server
npm run dev
```

### CLI Scripts

```bash
# Compile CQL to ELM
npm run cql:compile -- path/to/measure.cql

# Compile with custom output
npm run cql:compile -- measure.cql --output ./output/measure.json

# Execute CQL against FHIR patient bundles
npm run cql:execute -- --elm measure.json --patients ./synthea_output/fhir/

# Execute with VSAC value sets (requires UMLS_API_KEY)
UMLS_API_KEY=your_key npm run cql:execute -- --elm measure.json --patients ./bundles/
```

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# ANTHROPIC_API_KEY=your_key_here
```

## Architecture

```
cql-builder/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/
│   │   │   ├── generate/       # AI CQL generation endpoint
│   │   │   ├── compile/        # CQL-to-ELM compilation
│   │   │   ├── execute/        # CQL execution endpoint
│   │   │   ├── validate/       # CQL validation endpoint
│   │   │   └── vsac/           # Value set search
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── cql-builder/        # Main application components
│   │   │   ├── welcome-screen.tsx
│   │   │   ├── conversation-flow.tsx
│   │   │   ├── code-generator.tsx
│   │   │   ├── code-review.tsx
│   │   │   └── step-indicator.tsx
│   │   └── ui/                 # Reusable UI components
│   ├── lib/
│   │   ├── cql-knowledge-base.ts    # CQL patterns & templates
│   │   ├── cql-execution-service.ts # CQL execution integration
│   │   ├── cql-generator.ts         # LLM generation utilities
│   │   ├── store.ts                 # Zustand state management
│   │   └── utils.ts
│   └── types/
│       └── cql.ts              # TypeScript definitions
├── scripts/
│   ├── compile-cql.js          # CLI CQL compiler
│   └── execute-cql.js          # CLI CQL executor
├── examples/                   # Reference CQL libraries
├── sandbox/                    # Synthea testing config
└── public/
```

## API Endpoints

### POST /api/generate

Generate CQL from natural language requirements.

```json
{
  "requirements": {
    "purpose": "Measure diabetes HbA1c control",
    "problemStatement": "Poor glycemic control leads to complications",
    "measureType": "clinical-quality",
    "scoringType": "proportion",
    "valueSets": [
      {
        "name": "Diabetes",
        "oid": "2.16.840.1.113883.3.464.1003.103.12.1001"
      }
    ]
  }
}
```

### POST /api/compile

Compile CQL to ELM using the CQL Translation Service.

```json
{
  "cql": "library Test version '1.0.0'...",
  "options": {
    "useLocalTranslator": false
  }
}
```

Response includes compiled ELM, errors, warnings, and library metadata.

### POST /api/validate

Validate CQL with structural checks and full compilation.

```json
{
  "cql": "library Test version '1.0.0'...",
  "fullValidation": true
}
```

### POST /api/execute

Execute CQL/ELM against FHIR patient data.

```json
{
  "elm": { ... },
  "patients": [ ... FHIR Bundles ... ],
  "options": {
    "measurementPeriodStart": "2024-01-01",
    "measurementPeriodEnd": "2025-01-01"
  }
}
```

### GET /api/vsac

Search value sets by name, OID, or clinical domain.

```
GET /api/vsac?q=diabetes&domain=chronic-disease&limit=10
```

## Testing with Synthea

See [sandbox/README.md](sandbox/README.md) for detailed instructions.

```bash
# Download Synthea
curl -L -o synthea-with-dependencies.jar \
  https://github.com/synthetichealth/synthea/releases/download/master-branch-latest/synthea-with-dependencies.jar

# Generate test patients
java -jar synthea-with-dependencies.jar -p 100 Massachusetts

# Start HAPI FHIR server
docker run -p 8080:8080 hapiproject/hapi:latest

# Execute CQL against generated patients
npm run cql:execute -- --elm ./examples/DiabetesHbA1cControl.json --patients ./output/fhir/
```

## Local CQL Translation Service

For faster compilation, run the translation service locally:

```bash
docker run -d -p 8080:8080 cqframework/cql-translation-service:latest
```

Then use `--local` flag or set `useLocalTranslator: true` in API calls.

## CQL Resources

### Official Specifications

- [HL7 CQL Specification v1.5.3](https://cql.hl7.org/)
- [CQL Authors Guide](https://cql.hl7.org/02-authorsguide.html)
- [CQL Reference](https://cql.hl7.org/09-b-cqlreference.html)
- [CQF Measures IG](https://build.fhir.org/ig/HL7/cqf-measures/)
- [Using CQL with FHIR](https://build.fhir.org/ig/HL7/cql-ig/)

### CQL Framework Tools

- [CQL Playground](https://cqframework.org/clinical_quality_language/playground/)
- [cql-execution](https://github.com/cqframework/cql-execution)
- [cql-exec-fhir](https://github.com/cqframework/cql-exec-fhir)
- [cql-exec-vsac](https://github.com/cqframework/cql-exec-vsac)
- [cql-translation-service](https://github.com/cqframework/cql-translation-service)
- [VS Code CQL Extension](https://marketplace.visualstudio.com/items?itemName=cqframework.cql)

### Value Sets & Terminology

- [VSAC - Value Set Authority Center](https://vsac.nlm.nih.gov/)
- [NLM UMLS](https://uts.nlm.nih.gov/) (for API key)

## Example Measures

The `examples/` directory contains reference implementations:

- `DiabetesHbA1cControl.cql` - Based on CMS122 Diabetes HbA1c Poor Control
- `ColorectalCancerScreening.cql` - Based on CMS130 Colorectal Cancer Screening

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | Yes | Anthropic API key for AI generation |
| `UMLS_API_KEY` | No | UMLS API key for VSAC value set downloads |
| `VSAC_API_KEY` | No | Alternative VSAC API key |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see [LICENSE](../LICENSE)

## Acknowledgments

- [HL7 International](https://www.hl7.org/) for the CQL specification
- [CQFramework](https://github.com/cqframework) for CQL tooling and npm packages
- [Synthea](https://synthetichealth.github.io/synthea/) for synthetic patient data
- [Anthropic](https://www.anthropic.com/) for Claude AI
