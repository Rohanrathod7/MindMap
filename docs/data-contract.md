# Data Contract: Mindmap JSON Schema

## Overview

The mindmap UI is entirely data-driven. Every node, label, connection, and piece of metadata comes from a single JSON file. The UI code contains zero hardcoded content—it simply reads the data and renders it recursively.

**The rule is simple**: if it's not in the JSON, it doesn't appear on screen.

---

## Node Schema

Each node in the mindmap follows this structure:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique identifier for the node |
| `label` | string | Yes | Display text shown on the node |
| `summary` | string | No | Short text shown on hover |
| `description` | string | No | Full content shown in side panel |
| `metadata` | object | No | Additional key-value pairs (tags, dates, etc.) |
| `children` | array | No | Nested child nodes (same structure, recursive) |

### Field Details

- **id**: Must be unique across the entire tree. Used for selection state and editing.
- **label**: Keep it short (1-4 words). This is what users see at a glance.
- **summary**: One sentence max. Appears in hover tooltip.
- **description**: Can be longer. Displayed in the detail panel when node is selected.
- **metadata**: Flexible object for any extra info. UI will display all key-value pairs.
- **children**: An array of nodes. Each child follows the exact same schema. This is what makes the structure recursive.

---

## Conceptual JSON Structure

```json
{
  "id": "root",
  "label": "Project Overview",
  "summary": "The main project node",
  "description": "This is the root of the mindmap. All topics branch from here.",
  "metadata": {
    "author": "Rohan",
    "lastUpdated": "2026-01-01"
  },
  "children": [
    {
      "id": "topic-1",
      "label": "First Topic",
      "summary": "Introduction to the first topic",
      "description": "Detailed explanation of the first topic goes here.",
      "children": [
        {
          "id": "subtopic-1a",
          "label": "Subtopic A",
          "summary": "A deeper point",
          "description": "Even more detail about subtopic A."
        },
        {
          "id": "subtopic-1b",
          "label": "Subtopic B",
          "summary": "Another angle",
          "description": "Exploring subtopic B in depth."
        }
      ]
    },
    {
      "id": "topic-2",
      "label": "Second Topic",
      "summary": "Overview of the second area",
      "description": "Full description of the second topic.",
      "children": []
    }
  ]
}
```

---

## Rendering Rules

The UI follows these rules when processing the JSON:

1. **Start at root**: The top-level object is the central node of the mindmap.

2. **Recurse through children**: For each node, render it, then render all its children. Repeat until no more children exist.

3. **Draw connections**: Every child connects back to its parent with a visual edge.

4. **No children = leaf node**: Nodes without a `children` array (or with an empty array) are endpoints. They have no expand/collapse behavior.

5. **Missing optional fields**: If `summary`, `description`, or `metadata` are missing, the UI simply shows nothing for those—no errors, no placeholders.

6. **Order matters**: Children render in array order. First item in the array appears first in the layout.

### What Happens When You Change the JSON

| Change | Result |
|--------|--------|
| Add a node to `children` | New node appears in the mindmap |
| Remove a node | Node and all its descendants disappear |
| Edit `label` | Node text updates |
| Edit `summary` | Hover tooltip updates |
| Edit `description` | Side panel content updates |
| Rearrange `children` order | Visual order changes |
| Add nested `children` | Deeper hierarchy levels appear |

The UI never needs modification. Data in, visuals out.
