# Contributing to FHIR IQ CQL Builder

Thank you for your interest in contributing to FHIR IQ CQL Builder! This document provides guidelines and instructions for contributing to this project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [How to Contribute](#how-to-contribute)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)

## Code of Conduct

This project adheres to a Code of Conduct that all contributors are expected to follow. Please be respectful, inclusive, and considerate in all interactions.

### Our Standards

- Use welcoming and inclusive language
- Be respectful of differing viewpoints and experiences
- Gracefully accept constructive criticism
- Focus on what is best for the community
- Show empathy towards other community members

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn package manager
- Git
- A code editor (VS Code recommended)

### Development Setup

1. **Fork the repository**

   Click the "Fork" button on GitHub to create your own copy of the repository.

2. **Clone your fork**

   ```bash
   git clone https://github.com/YOUR-USERNAME/s77.git
   cd s77
   ```

3. **Add upstream remote**

   ```bash
   git remote add upstream https://github.com/FHIR-IQ/s77.git
   ```

4. **Install dependencies**

   ```bash
   npm install
   ```

5. **Start the development server**

   ```bash
   npm run dev
   ```

6. **Open in browser**

   Navigate to `http://localhost:3000`

## Project Structure

```text
s77/
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── page.tsx         # Main application page
│   │   ├── docs/            # Documentation page
│   │   ├── faq/             # FAQ page
│   │   └── vision/          # Vision/roadmap page
│   ├── components/          # React components
│   │   ├── ui/              # Shadcn UI components
│   │   └── cql-builder/     # CQL Builder specific components
│   │       ├── code-review.tsx      # Main editor component
│   │       ├── visual-query-builder.tsx  # No-code builder
│   │       └── test-panel.tsx       # Test harness panel
│   └── lib/                 # Utility functions and services
│       ├── cql-translation-service.ts  # CQL to ELM compilation
│       ├── fhir-schema-service.ts      # FHIR resource schemas
│       ├── query-builder-to-cql.ts     # Visual to CQL transformer
│       └── export-service.ts           # FHIR packaging utilities
├── public/                  # Static assets
└── package.json
```

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in [Issues](https://github.com/FHIR-IQ/s77/issues)
2. If not, create a new issue with:
   - Clear, descriptive title
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Screenshots if applicable
   - Browser and OS information

### Suggesting Features

1. Check existing issues for similar suggestions
2. Create a new issue with the `enhancement` label
3. Describe the feature and its use case
4. Explain why it would benefit users

### Contributing Code

1. Find an issue to work on or create one
2. Comment on the issue to let others know you're working on it
3. Create a feature branch
4. Make your changes
5. Submit a pull request

## Pull Request Process

### Branch Naming

Use descriptive branch names:

- `feature/visual-builder-drag-drop`
- `fix/cql-compilation-error`
- `docs/api-reference`

### Commit Messages

Write clear, concise commit messages:

- Use present tense ("Add feature" not "Added feature")
- Use imperative mood ("Move cursor to..." not "Moves cursor to...")
- Reference issues when applicable

Example:

```text
Add FHIR R4 AllergyIntolerance resource schema

- Add field definitions for AllergyIntolerance
- Include clinical status and verification status codes
- Update schema service exports

Closes #42
```

### Pull Request Template

When creating a PR, include:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Refactoring
- [ ] Other (please describe)

## Testing
Describe how you tested these changes

## Screenshots
If applicable, add screenshots

## Checklist
- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review
- [ ] I have added tests if applicable
- [ ] I have updated documentation if needed
```

### Review Process

1. All PRs require at least one review
2. Address reviewer feedback
3. Keep PRs focused and reasonably sized
4. Ensure all checks pass before merging

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Define explicit types (avoid `any`)
- Use interfaces for object shapes
- Export types that may be used elsewhere

```typescript
// Good
interface PatientFilter {
  resourceType: 'Patient';
  field: string;
  operator: ComparisonOperator;
  value: string | number | boolean;
}

// Avoid
const filter: any = { ... };
```

### React Components

- Use functional components with hooks
- Use Shadcn UI components when available
- Follow component naming conventions (PascalCase)
- Keep components focused and reusable

```tsx
// Good
export function PatientSelector({ onSelect }: PatientSelectorProps) {
  // ...
}

// Avoid
export default function patientSelector(props: any) {
  // ...
}
```

### Styling

- Use Tailwind CSS for styling
- Follow existing color conventions (clinical colors defined in tailwind.config)
- Use responsive design patterns
- Keep styles consistent with existing components

### File Organization

- One component per file
- Group related files in directories
- Use index files for clean exports
- Keep utilities in `lib/` directory

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test -- path/to/test.ts
```

### Writing Tests

- Write tests for new functionality
- Test edge cases and error conditions
- Use descriptive test names
- Mock external services appropriately

```typescript
describe('queryBuilderToCQL', () => {
  it('should generate valid CQL for Patient age filter', () => {
    const rules = {
      combinator: 'and',
      rules: [{ field: 'birthDate', operator: '>', value: '18' }]
    };
    const cql = queryBuilderToCQL(rules, 'Patient');
    expect(cql).toContain('AgeInYears() > 18');
  });
});
```

## Documentation

### Code Documentation

- Add JSDoc comments for public functions
- Document complex logic inline
- Keep README up to date

```typescript
/**
 * Generates a FHIR Library resource from CQL and ELM content
 * @param cql - The raw CQL source code
 * @param elm - The compiled ELM JSON (optional)
 * @param options - Library metadata options
 * @returns A FHIR R4 Library resource
 */
export function generateLibraryResource(
  cql: string,
  elm: unknown | null,
  options: ExportOptions
): FhirLibrary {
  // ...
}
```

### User Documentation

- Update docs page for new features
- Add FAQ entries for common questions
- Include screenshots where helpful

## Areas for Contribution

Here are some areas where contributions are especially welcome:

### High Priority

- Additional FHIR resource schemas
- Test case generation improvements
- CQL syntax highlighting enhancements
- Error message clarity improvements

### Feature Requests

- Drag-and-drop rule reordering
- CQL library import/export
- Measure sharing capabilities
- Additional export formats

### Docs and Guides

- Tutorials and guides
- API documentation
- Video walkthroughs
- Internationalization

## Questions?

If you have questions about contributing:

1. Check the [FAQ](/faq) page
2. Open a [Discussion](https://github.com/FHIR-IQ/s77/discussions)
3. Ask in an existing related issue

Thank you for contributing to FHIR IQ CQL Builder!
