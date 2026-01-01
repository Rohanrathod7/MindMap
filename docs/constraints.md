# Development Constraints

These rules exist to keep the codebase simple, maintainable, and focused.

---

## Technology

- **No backend.** This is a frontend-only project.
- **No database.** Data lives in a static JSON file.
- **No build-time dependencies beyond the chosen framework.** Keep `package.json` minimal.
- **No CSS frameworks like Tailwind or Bootstrap.** Use vanilla CSS.
- **No state management libraries (Redux, Zustand, etc.).** React state or framework-native state is sufficient.

---

## Architecture

- **Single data source.** One JSON file drives the entire UI.
- **No prop drilling beyond 2 levels.** If passing props deeper, refactor or use context.
- **No utility files unless reused in 3+ places.** Avoid premature abstraction.
- **No "utils", "helpers", or "common" folders.** Name things by what they do.
- **Maximum 200 lines per component file.** Split if larger.

---

## State Management

- **UI state derives from data.** The JSON is the source of truth.
- **Local component state only for UI concerns.** Hover, collapse, selection—nothing more.
- **No global state stores.** Pass data down, events up.
- **Edits update the data structure directly.** Don't maintain parallel state.

---

## Rendering

- **Recursive rendering from data.** One component renders a node and its children.
- **No hardcoded nodes, labels, or relationships.** Everything comes from JSON.
- **No conditional rendering based on node IDs.** Treat all nodes uniformly.
- **Layout computed from data structure.** Position derives from hierarchy, not manual coordinates.

---

## Code Style

- **No dead code.** Delete unused functions, components, and imports.
- **No commented-out code.** Use version control for history.
- **No TODOs in submitted code.** Either fix it or document it as a known limitation.
- **Descriptive names over comments.** If you need a comment, the name is probably wrong.
- **No abbreviations in variable names.** `selectedNode`, not `selNode`.

---

## Forbidden Patterns

- ❌ Over-abstraction (factories, providers, wrappers without clear need)
- ❌ Premature optimization
- ❌ Multiple sources of truth for the same data
- ❌ Event buses or pub/sub patterns
- ❌ Dynamic imports or code splitting (not needed at this scale)
- ❌ TypeScript `any` type (if using TypeScript)

---

## What "Done" Looks Like

- A reviewer can read the code top-to-bottom and understand it
- Changing the JSON file changes the UI—nothing else needed
- No feature requires more than 3 files to understand
- The entire codebase fits in your head
