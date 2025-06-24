# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Vault UI Web - Development Guide

<rules>
  <critical>NEVER bypass git pre-commit hooks, unit tests or quality checks.</critical>
  <critical>NEVER finish a task with failing unit tests or quality checks.</critical>
  <critical>NEVER, NEVER commit code with failing unit tests or quality checks.</critical>
  <critical>Execute only the next single incomplete task from $ARGUMENTS. Complete the task, update the task list, then STOP immediately for user review.</critical>
</rules>

## Overview

A collection of ESLint plugins for custom linting tools.

## Core Principles

1. **Strict Scope Management**: Implement exactly what's requested. Report additional discovered work at task completion.

2. **Documentation First**: Use `context7` MCP tool for up-to-date third-party library documentation.

3. **Quality Pipeline**: Run before finishing every task:

   ```bash
   npm run lint && npm run format && npm test && npm run build && npm run type-check
   ```

4. **File Organization**:
   - One export per file (exceptions require user approval)
   - Barrel files (`index.ts`) are allowed
   - Follow existing naming: PascalCase for components, camelCase for utilities

5. **Code Quality**:
   - Functions < 25 statements, classes < 200 statements

6. **User Confirmation Required For**:
   - Circular dependencies
   - Ambiguous requirements
   - Security concerns

## Tech Stack

- **Core**: TypeScript 5.x (strict)
- **Testing**: Jest + Testing Library

## Project Structure

- **`src/linters/`** - Custom ESLint plugins
- **`src/__tests__/`** - Jest test suites organized by feature area

## Development Commands

```bash
npm run build        # Build the project
npm run lint         # ESLint
npm run lint:fix     # ESLint auto-fix
npm run format       # Prettier
npm test             # Jest tests
npm run type-check   # TypeScript type checking
```

## Key Patterns

## Git Workflow

Branch naming: `feature/kebab-case-description`

- `feature/add-user-authentication`
- `feature/implement-deck-suggestions`

## Security

- **Never hardcode secrets**: Use environment variables or secure vaults
- Environment variables only

## Standard Task Flow

1. **Understand** - Read task and referenced files
2. **Check** - Review package.json, conventions, tests
3. **Plan** - Identify files, libraries, tests needed
4. **Implement** - Follow patterns and conventions
5. **Quality** - Run full pipeline until green
6. **Summarize** - List changes and discovered work

## Quality Standards

### Coding Standards

- Document and test all code
- Functions should be small and focused (max 50 lines)
  - Refactor large functions into smaller ones
- Classes should have a single responsibility and be small (max 200 lines)
  - Use composition over inheritance where possible
  - Refactor large classes into smaller ones
- One exported item (class, function, etc.) per file (exceptions require user approval)
- Write tests for behaviors and edge cases, not for style or formatting
- If exceptions are required, **STOP and ask for approval** before proceeding
- **Do not** do unrequested work
  - For example, do not add retry logic unless explicitly requested
  - If you think something is missing, **ask for approval** before adding it
- **ASK QUESTIONS** if you are unsure about anything
  - If you are not sure how to implement something, ask for clarification
  - If you are not sure if something is needed, ask for approval

### Testing

Write unit tests for all API endpoints and business logic. Use the `src/__tests__/` directory to organize tests by module.

### Quality Tools

**Always run these tools before completing a task:**

- `npm run lint` - Check for code style issues
- `npm run format` - Format code with Prettier
- `npm test` - Run unit tests
- `npm run build` - Build the project to ensure no errors
- **NEVER skip these steps** - they ensure code quality and consistency

**NEVER ALLOW FAILING QUALITY CHECKS**

- Fix them
- If you cannot fix them, ask for help - **do not ignore them**
- It does not matter if the code works or if the failures are unrelated to your changes: **DO NOT COMPLETE THE TASK UNTIL ALL QUALITY CHECKS PASS**

## Third-Party Library Documentation

When working with third-party libraries, use the context7 MCP tool to get up-to-date documentation and examples. This ensures you have access to the latest API changes and best practices for libraries like FastAPI, Pydantic, LangChain, Firebase, Google Cloud services, and others used in this project.

## Asking Questions

- **Ask one question at a time**
- **Provide options for each question**

_Example question_

```
In case of multiple variations, should metadata be generated for all variations or only the first one?
- **Options:**
  - A) Generate metadata for all variations
  - B) Generate metadata only for the first variation
  - C) Do not generate metadata at all
```

**Remember to ask one question at a time and provide options for each question.**

## Prohibited Actions

- ❌ Shared "kitchen-sink" modules
- ❌ Hardcoded secrets (including file paths outside project root)
- ❌ Scope expansion without approval

<rules>
  <critical>NEVER bypass git pre-commit hooks, unit tests or quality checks.</critical>
  <critical>NEVER finish a task with failing unit tests or quality checks.</critical>
  <critical>NEVER, NEVER commit code with failing unit tests or quality checks.</critical>
  <critical>Write tests for new or modified functionality. Do not write tests for style or formatting.</critical>
  <critical>Never hardcode secrets or environment values, including file paths outside project root.</critical>
  <critical>Ensure all quality checks pass before marking a task complete. Do not proceed if any checks or tests fail.</critical>
  <important>Each "public" class or function should be in its own file, unless otherwise approved.</important>
  <important>Use context7 MCP tool to get up-to-date documentation and best practices for all third-party libraries.</important>
  <important>Ask questions for implementation details, clarifications, or when requirements are ambiguous.</important>
  <rule>Do not write comments for obvious code. Use meaningful variable and function names instead.</rule>
</rules>
