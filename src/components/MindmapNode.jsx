function MindmapNode({
  node,
  position,
  isSelected,
  isHovered,
  isExpanded,
  hasChildren,
  onSelect,
  onToggle,
  onMouseEnter,
  onMouseMove,
  onMouseLeave
}) {
  const isRoot = !position.parentId

  const handleToggleClick = (e) => {
    e.stopPropagation()
    onToggle()
  }

  return (
    <div
      className={`mindmap-node ${isRoot ? 'root' : ''} ${isSelected ? 'selected' : ''}`}
      data-node-id={node.id}
      style={{
        left: position.x,
        top: position.y
      }}
      onClick={onSelect}
      onMouseEnter={onMouseEnter}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      <span className="node-label">{node.label}</span>
      {hasChildren && (
        <button className="node-toggle" onClick={handleToggleClick}>
          {isExpanded ? '−' : '+'}
        </button>
      )}
    </div>
  )
}

export default MindmapNode
