# Engineering Design: Mindmap UI

## Architecture Overview

The application follows a unidirectional data flow with three main layers:

```
┌─────────────────────────────────────────────────────────┐
│                      DATA LAYER                         │
│                  (JSON file → parsed tree)              │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                     STATE LAYER                         │
│     (UI state: selection, expansion, hover, edits)      │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                      VIEW LAYER                         │
│         (Canvas + Side Panel + Controls)                │
└─────────────────────────────────────────────────────────┘
```

**Key principle**: Data flows down, events flow up. The JSON is the single source of truth.

---

## Component Responsibilities

### App (Root)
- Loads the JSON data on mount
- Holds all application state
- Passes data and callbacks to child components

### MindmapCanvas
- Renders the visual mindmap (nodes + edges)
- Handles pan and zoom interactions
- Delegates node rendering to recursive children

### MindmapNode (Recursive)
- Renders a single node
- Renders its children by calling itself recursively
- Handles hover and click events for that node
- Draws the connecting edge to its parent

### DetailPanel
- Displays full information for the selected node
- Shows label, description, and metadata
- Contains the edit form when editing is active

### Toolbar
- Fit-to-view button
- Reset view button
- Any future controls (export, etc.)

### EditForm
- Input fields for editing node content
- Save and cancel actions
- Updates the data structure on save

---

## Data Flow

### Initial Load
```
JSON file → fetch/import → parse → store in App state → render tree
```

### User Selects a Node
```
Click event on MindmapNode
    → calls onSelect(nodeId) passed from App
    → App updates selectedNodeId state
    → DetailPanel re-renders with new node data
    → MindmapNode re-renders with highlight styling
```

### User Expands/Collapses a Node
```
Click event on expand/collapse toggle
    → calls onToggle(nodeId) passed from App
    → App updates expandedNodeIds set (add or remove)
    → MindmapCanvas re-renders
    → Collapsed node's children are not rendered
```

### User Hovers a Node
```
Mouse enter on MindmapNode
    → calls onHover(nodeId) passed from App
    → App updates hoveredNodeId state
    → Tooltip appears near cursor with summary
Mouse leave → clears hoveredNodeId → tooltip disappears
```

### User Edits a Node
```
Click edit button in DetailPanel
    → App sets editingNodeId state
    → EditForm appears with current values
    → User modifies and clicks save
    → App updates the node in the data tree
    → All components re-render with new data
```

---

## State Management

### State Variables

| State | Type | Purpose |
|-------|------|---------|
| `mindmapData` | Object (tree) | The entire parsed JSON structure |
| `selectedNodeId` | String or null | Currently selected node for detail view |
| `hoveredNodeId` | String or null | Node currently under cursor |
| `expandedNodeIds` | Set of strings | Which nodes have children visible |
| `editingNodeId` | String or null | Node currently being edited |
| `viewTransform` | Object | Pan offset and zoom level |

### State Ownership

All state lives in the **App** component. Child components receive:
- Data they need to render (read-only)
- Callbacks to request state changes

No child component holds its own copy of the data. This prevents state synchronization bugs.

### Computed Values

Some values are derived, not stored:

- **Selected node object**: Look up `selectedNodeId` in the tree
- **Is node expanded**: Check if `nodeId` exists in `expandedNodeIds`
- **Node positions**: Calculated from tree structure during render

---

## Interaction Patterns

### Selection
- Single selection only (one node at a time)
- Clicking a new node replaces the previous selection
- Clicking the same node again keeps it selected

### Expand/Collapse
- Only nodes with children can be collapsed
- Root node is always expanded
- Collapsing a node hides all descendants
- Newly loaded data starts fully expanded (or collapsed—design choice)

### View Controls
- Pan: Click and drag on canvas background
- Zoom: Scroll wheel or pinch gesture
- Fit to view: Calculates bounding box, adjusts transform to fit
- Reset: Returns to initial transform (centered, zoom 1.0)

---

## Layout Strategy

Nodes are positioned using a tree layout algorithm:

1. **Traverse the tree** to calculate depths and sibling counts
2. **Assign vertical position** based on depth (root at center or left)
3. **Assign horizontal position** based on sibling order and subtree sizes
4. **Draw edges** from each node to its parent

The layout recalculates when:
- Data changes (node added/removed)
- Expand/collapse state changes

Layout does not change on selection or hover—those only affect styling.
