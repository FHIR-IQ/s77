# CQL Sandbox - Testing with Synthea

This directory contains configuration and instructions for testing your generated CQL against synthetic patient data.

## Quick Start

### 1. Download Synthea

```bash
# Download Synthea
curl -L -o synthea-with-dependencies.jar https://github.com/synthetichealth/synthea/releases/download/master-branch-latest/synthea-with-dependencies.jar
```

### 2. Generate Test Patients

```bash
# Generate 100 patients in Massachusetts
java -jar synthea-with-dependencies.jar -p 100 Massachusetts

# Generate patients with specific conditions
java -jar synthea-with-dependencies.jar -p 100 -m diabetes Massachusetts
```

### 3. Start HAPI FHIR Server

```bash
# Using Docker
docker run -p 8080:8080 hapiproject/hapi:latest
```

### 4. Load Patient Data

```bash
# Load FHIR bundles into HAPI
for f in output/fhir/*.json; do
  curl -X POST http://localhost:8080/fhir -H "Content-Type: application/fhir+json" -d @$f
done
```

### 5. Install CQL VS Code Extension

1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "Clinical Quality Language"
4. Install the extension by CQ Framework

### 6. Execute CQL

1. Open your `.cql` file in VS Code
2. Configure the extension to point to `http://localhost:8080/fhir`
3. Right-click in the editor and select "Execute CQL"

## Measure-Specific Test Data

### Diabetes HbA1c Control

```bash
java -jar synthea-with-dependencies.jar -p 500 -m diabetes -s 12345 Massachusetts Boston
```

Expected: ~75 patients with diabetes, various HbA1c levels

### Colorectal Cancer Screening

```bash
java -jar synthea-with-dependencies.jar -p 500 -s 12345 Massachusetts Boston
```

Expected: ~175 patients aged 45-75

### Breast Cancer Screening

```bash
java -jar synthea-with-dependencies.jar -p 500 -g F -s 12345 Massachusetts Boston
```

Expected: ~100 women aged 50-74

## Configuration Options

See `synthea-config.json` for detailed configuration options.

## Resources

- [Synthea GitHub](https://github.com/synthetichealth/synthea)
- [Synthea Wiki](https://github.com/synthetichealth/synthea/wiki)
- [HAPI FHIR](https://hapifhir.io/)
- [CQL VS Code Extension](https://marketplace.visualstudio.com/items?itemName=cqframework.cql)
- [CQL Execution Service](https://github.com/DBCG/cql_execution_service)
