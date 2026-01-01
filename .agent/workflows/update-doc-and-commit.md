---
description: A conservative workflow that keeps documentation synchronized with actual code changes. Ensures architecture, progress, and history reflect the current state of the system.
---

**What it does:**
- Analyses git changes (status + diff)
- Updates `docs/changelog.md` for new features or fixes
- Updates `docs/architecture.md` **only if** structural changes occurred
- Updates `docs/project_status.md` to reflect current progress
- Updates `docs/reference/` feature level deep dive only when core, major feature is implemented successfully 
- Stages and commits code and documentation together

**Rules (Agent Must Follow):**
- Use this workflow for architectural changes, milestones, or major additions
- Do not update documentation unless code changes justify it

**Notes:**
- Conservative by design — only updates docs that genuinely need changes