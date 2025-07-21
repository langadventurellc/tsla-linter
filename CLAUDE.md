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

---

## Clean‑Code Charter

> **Purpose**  Guide large‑language‑model (LLM) coding agents toward the simplest **working** solution, written in the style of seasoned engineers (Kent Beck, Robert Martin, et al.).
> The charter is language‑agnostic but assumes most code is authored in **Python**.

### 1  Guiding Maxims (agents must echo these before coding)

| Maxim                                  | Practical test                                                      |
| -------------------------------------- | ------------------------------------------------------------------- |
| **KISS** – _Keep It Super Simple_      | Could a junior dev explain the design to a peer in ≤ 2 min?         |
| **YAGNI** – _You Aren’t Gonna Need It_ | Is the abstraction used < 3 times? If so, inline it.                |
| **SRP / small units**                  | One concept per function; ≤ 20 logical LOC; cyclomatic ≤ 5.         |
| **DRY** – _Don’t Repeat Yourself_      | Is the code repeated in ≥ 2 places? If so, extract it.              |
| **Simplicity**                         | Is the code simpler than the alternative? If not, refactor it.      |
| **Explicit is better than implicit**   | Is the code self‑documenting? If not, add comments.                 |
| **Fail fast**                          | Does the code handle errors gracefully? If not, add error handling. |

### 2  Architecture Heuristics

#### 2.1 File‑ & package‑level

- **≤ 400 LOC per file** (logical lines).
- No **“util” or “helpers” dumping grounds** – every module owns a domain noun/verb.

#### 2.2 Module decomposition & dependency rules _(new)_

1. **Domain‑oriented modules.** Each module encapsulates **one** coherent business concept (noun) or service (verb).
2. **Explicit public surface.** Export `index.ts` only what callers need; everything else is private.
3. **Acyclic dependency graph.** Imports must not form cycles; prefer dependency‑inversion interfaces to break loops.
4. **Shallow import depth ≤ 3.** Deep chains signal hidden coupling.
5. **Rule of three for new layers.** Add a new package level only after three modules share the same concern.
6. **Composition over inheritance** unless ≥ 2 concrete subclasses are already required.
7. **Ports & Adapters pattern** for I/O: keep domain logic free of external frameworks (DB, HTTP, UI).
8. **Naming convention:** _package/module = noun_, _class = noun_, _function = verb + noun_.

### 3  Testing Policy

- **Goldilocks rule.** Exactly **one** happy‑path unit test per public function _unless_ complexity > 5.
- **Integration tests only at seams.** Use fakes/mocks internally.
- **Performance tests gated.** Only generate when the target class/function bears a `@PerfTest` attribute.

### 4  Agent Self‑Review Checklist (before emitting code)

1. Could this be **one function simpler**?
2. Did I introduce an abstraction used **only once**?
3. Did I write a **performance test without** a `@PerfTest` attribute?
4. Can a junior dev grok each file in **< 5 min**?

---

## 🤔 When You’re Unsure

1. **Stop** and ask a clear, single question.
2. Offer options (A / B / C) if helpful.
3. Wait for user guidance before proceeding.

## Troubleshooting

If you encounter issues:

- Check the documentation in `docs/`
- Use the context7 MCP tool for up-to-date library documentation
- Use web for research (the current year is 2025)
- If you need clarification, ask specific questions with options
