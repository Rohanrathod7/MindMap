import { useRef, useState, useEffect, useLayoutEffect } from 'react'
import MindmapNode from './MindmapNode'

function MindmapCanvas({
  data,
  selectedNodeId,
  hoveredNodeId,
  expandedNodeIds,
  viewTransform,
  onNodeSelect,
  onNodeHover,
  onNodeToggle,
  onViewTransformChange,
  onNodePositionsChange
}) {
  const canvasRef = useRef(null)
  const [nodePositions, setNodePositions] = useState({})
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [tooltip, setTooltip] = useState(null)
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 })

  // Layout configuration
  const NODE_WIDTH = 160
  const NODE_HEIGHT = 44
  const HORIZONTAL_GAP = 80
  const VERTICAL_GAP = 20

  // Get canvas size
  useLayoutEffect(() => {
    const updateSize = () => {
      if (canvasRef.current) {
        setCanvasSize({
          width: canvasRef.current.clientWidth,
          height: canvasRef.current.clientHeight
        })
      }
    }
    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  // Calculate tree layout
  useEffect(() => {
    const positions = {}
    
    const calculateSubtreeHeight = (node) => {
      if (!node.children || node.children.length === 0 || !expandedNodeIds.has(node.id)) {
        return NODE_HEIGHT
      }
      let height = 0
      node.children.forEach((child, i) => {
        if (i > 0) height += VERTICAL_GAP
        height += calculateSubtreeHeight(child)
      })
      return Math.max(NODE_HEIGHT, height)
    }

    const layoutNode = (node, x, y, parentId = null) => {
      positions[node.id] = { x, y, parentId }
      
      if (node.children && node.children.length > 0 && expandedNodeIds.has(node.id)) {
        const childX = x + NODE_WIDTH + HORIZONTAL_GAP
        let childY = y - calculateSubtreeHeight(node) / 2 + NODE_HEIGHT / 2

        node.children.forEach((child) => {
          const childHeight = calculateSubtreeHeight(child)
          layoutNode(child, childX, childY + childHeight / 2 - NODE_HEIGHT / 2, node.id)
          childY += childHeight + VERTICAL_GAP
        })
      }
    }

    // Start layout from center
    const centerY = canvasSize.height / 2 - NODE_HEIGHT / 2
    layoutNode(data, 100, centerY)

    setNodePositions(positions)
    if (onNodePositionsChange) {
      onNodePositionsChange(positions)
    }
  }, [data, expandedNodeIds, canvasSize])


  // Handle mouse events for panning
  const handleMouseDown = (e) => {
    if (e.target === canvasRef.current || e.target.classList.contains('mindmap-container')) {
      setIsDragging(true)
      setDragStart({ x: e.clientX - viewTransform.x, y: e.clientY - viewTransform.y })
    }
  }

  const handleMouseMove = (e) => {
    if (isDragging) {
      onViewTransformChange({
        ...viewTransform,
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Handle wheel for zoom
  const handleWheel = (e) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    const newScale = Math.min(Math.max(viewTransform.scale * delta, 0.3), 2)
    onViewTransformChange({ ...viewTransform, scale: newScale })
  }

  // Handle node hover with tooltip
  const handleNodeMouseEnter = (node, e) => {
    onNodeHover(node.id)
    if (node.summary) {
      setTooltip({
        content: node.summary,
        x: e.clientX + 15,
        y: e.clientY + 15
      })
    }
  }

  const handleNodeMouseMove = (e) => {
    if (tooltip) {
      setTooltip(prev => ({
        ...prev,
        x: e.clientX + 15,
        y: e.clientY + 15
      }))
    }
  }

  const handleNodeMouseLeave = () => {
    onNodeHover(null)
    setTooltip(null)
  }

  // Render edges
  const renderEdges = () => {
    const edges = []
    
    const collectEdges = (node) => {
      if (node.children && expandedNodeIds.has(node.id)) {
        node.children.forEach(child => {
          const parentPos = nodePositions[node.id]
          const childPos = nodePositions[child.id]
          
          if (parentPos && childPos) {
            const startX = parentPos.x + NODE_WIDTH
            const startY = parentPos.y + NODE_HEIGHT / 2
            const endX = childPos.x
            const endY = childPos.y + NODE_HEIGHT / 2
            const midX = (startX + endX) / 2

            const isHighlighted = selectedNodeId === node.id || selectedNodeId === child.id

            edges.push(
              <path
                key={`${node.id}-${child.id}`}
                className={`edge ${isHighlighted ? 'highlighted' : ''}`}
                d={`M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`}
              />
            )
          }
          collectEdges(child)
        })
      }
    }
    
    collectEdges(data)
    return edges
  }

  // Render nodes recursively
  const renderNodes = (node) => {
    const pos = nodePositions[node.id]
    if (!pos) return []

    const nodes = [
      <MindmapNode
        key={node.id}
        node={node}
        position={pos}
        isSelected={selectedNodeId === node.id}
        isHovered={hoveredNodeId === node.id}
        isExpanded={expandedNodeIds.has(node.id)}
        hasChildren={node.children && node.children.length > 0}
        onSelect={() => onNodeSelect(node.id)}
        onToggle={() => onNodeToggle(node.id)}
        onMouseEnter={(e) => handleNodeMouseEnter(node, e)}
        onMouseMove={handleNodeMouseMove}
        onMouseLeave={handleNodeMouseLeave}
      />
    ]

    if (node.children && expandedNodeIds.has(node.id)) {
      node.children.forEach(child => {
        nodes.push(...renderNodes(child))
      })
    }

    return nodes
  }

  return (
    <div
      ref={canvasRef}
      className="mindmap-canvas"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      <div
        className="mindmap-container"
        style={{
          transform: `translate(${viewTransform.x}px, ${viewTransform.y}px) scale(${viewTransform.scale})`
        }}
      >
        <svg 
          className="mindmap-edges"
          viewBox="-1000 -1000 6000 6000"
          style={{ 
            position: 'absolute',
            top: '-1000px',
            left: '-1000px',
            width: '6000px', 
            height: '6000px',
            overflow: 'visible',
            pointerEvents: 'none'
          }}
        >
          {renderEdges()}
        </svg>
        {renderNodes(data)}
      </div>
      {tooltip && (
        <div className="tooltip" style={{ left: tooltip.x, top: tooltip.y }}>
          {tooltip.content}
        </div>
      )}
    </div>
  )
}

export default MindmapCanvas
