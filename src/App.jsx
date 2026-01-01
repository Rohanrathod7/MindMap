import { useState, useEffect, useRef } from 'react'
import html2canvas from 'html2canvas'
import './App.css'
import MindmapCanvas from './components/MindmapCanvas'
import DetailPanel from './components/DetailPanel'
import Toolbar from './components/Toolbar'
import mindmapData from '../data/mindmap.sample.json'

function App() {
  const [data, setData] = useState(mindmapData)
  const [selectedNodeId, setSelectedNodeId] = useState(null)
  const [hoveredNodeId, setHoveredNodeId] = useState(null)
  const [expandedNodeIds, setExpandedNodeIds] = useState(new Set(['root']))
  const [editingNodeId, setEditingNodeId] = useState(null)
  const [viewTransform, setViewTransform] = useState({ x: 0, y: 0, scale: 1 })
  const [nodePositions, setNodePositions] = useState({})
  const canvasRef = useRef(null)

  // Initialize all nodes as expanded
  useEffect(() => {
    const collectIds = (node) => {
      const ids = [node.id]
      if (node.children) {
        node.children.forEach(child => {
          ids.push(...collectIds(child))
        })
      }
      return ids
    }
    setExpandedNodeIds(new Set(collectIds(data)))
  }, [])

  // Find a node by ID in the tree
  const findNode = (node, id) => {
    if (node.id === id) return node
    if (node.children) {
      for (const child of node.children) {
        const found = findNode(child, id)
        if (found) return found
      }
    }
    return null
  }

  const selectedNode = selectedNodeId ? findNode(data, selectedNodeId) : null

  const handleNodeSelect = (nodeId) => {
    setSelectedNodeId(nodeId)
    setEditingNodeId(null)
  }

  const handleNodeHover = (nodeId) => {
    setHoveredNodeId(nodeId)
  }

  const handleNodeToggle = (nodeId) => {
    setExpandedNodeIds(prev => {
      const next = new Set(prev)
      if (next.has(nodeId)) {
        next.delete(nodeId)
      } else {
        next.add(nodeId)
      }
      return next
    })
  }

  const handleNodeEdit = (nodeId) => {
    setEditingNodeId(nodeId)
  }

  const handleNodeSave = (nodeId, updates) => {
    const updateNode = (node) => {
      if (node.id === nodeId) {
        return { ...node, ...updates }
      }
      if (node.children) {
        return {
          ...node,
          children: node.children.map(updateNode)
        }
      }
      return node
    }
    setData(updateNode(data))
    setEditingNodeId(null)
  }

  const handleFitToView = () => {
    if (Object.keys(nodePositions).length === 0) return
    
    // Calculate bounding box of all nodes
    const positions = Object.values(nodePositions)
    const NODE_WIDTH = 160
    const NODE_HEIGHT = 44
    const PADDING = 50
    
    const minX = Math.min(...positions.map(p => p.x)) - PADDING
    const maxX = Math.max(...positions.map(p => p.x)) + NODE_WIDTH + PADDING
    const minY = Math.min(...positions.map(p => p.y)) - PADDING
    const maxY = Math.max(...positions.map(p => p.y)) + NODE_HEIGHT + PADDING
    
    // Get canvas dimensions (assume 800x600 if not available)
    const canvasWidth = 800
    const canvasHeight = 600
    
    const contentWidth = maxX - minX
    const contentHeight = maxY - minY
    
    // Calculate scale to fit
    const scaleX = canvasWidth / contentWidth
    const scaleY = canvasHeight / contentHeight
    const scale = Math.min(scaleX, scaleY, 1.5) // Cap at 1.5x zoom
    
    // Calculate offset to center
    const offsetX = (canvasWidth - contentWidth * scale) / 2 - minX * scale
    const offsetY = (canvasHeight - contentHeight * scale) / 2 - minY * scale
    
    setViewTransform({ x: offsetX, y: offsetY, scale })
  }

  const handleResetView = () => {
    setViewTransform({ x: 0, y: 0, scale: 1 })
  }

  const handleExport = () => {
    const jsonString = JSON.stringify(data, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'mindmap-export.json'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleExportImage = async () => {
    const canvasElement = document.querySelector('.mindmap-canvas')
    if (!canvasElement) return
    
    try {
      // First capture nodes without edges
      const canvas = await html2canvas(canvasElement, {
        backgroundColor: '#0f0f0f',
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
        ignoreElements: (element) => element.classList.contains('mindmap-edges')
      })
      
      const ctx = canvas.getContext('2d')
      const canvasRect = canvasElement.getBoundingClientRect()
      
      // Draw edges manually based on actual DOM positions
      const NODE_HEIGHT = 44
      const exportScale = 2 // html2canvas scale
      
      const drawEdges = (node) => {
        if (node.children && expandedNodeIds.has(node.id)) {
          node.children.forEach(child => {
            // Get actual DOM element positions
            const parentEl = canvasElement.querySelector(`[data-node-id="${node.id}"]`)
            const childEl = canvasElement.querySelector(`[data-node-id="${child.id}"]`)
            
            if (parentEl && childEl) {
              const parentRect = parentEl.getBoundingClientRect()
              const childRect = childEl.getBoundingClientRect()
              
              // Calculate relative positions
              const startX = (parentRect.right - canvasRect.left) * exportScale
              const startY = (parentRect.top + parentRect.height / 2 - canvasRect.top) * exportScale
              const endX = (childRect.left - canvasRect.left) * exportScale
              const endY = (childRect.top + childRect.height / 2 - canvasRect.top) * exportScale
              const midX = (startX + endX) / 2
              
              // Draw bezier curve
              ctx.beginPath()
              ctx.moveTo(startX, startY)
              ctx.bezierCurveTo(midX, startY, midX, endY, endX, endY)
              ctx.strokeStyle = '#ffffff'
              ctx.lineWidth = 2 * exportScale
              ctx.stroke()
            }
            drawEdges(child)
          })
        }
      }
      
      drawEdges(data)
      
      const link = document.createElement('a')
      link.download = 'mindmap-export.png'
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (error) {
      console.error('Failed to export image:', error)
    }
  }

  return (
    <div className="app">
      <Toolbar 
        onFitToView={handleFitToView}
        onResetView={handleResetView}
        onExport={handleExport}
        onExportImage={handleExportImage}
      />
      <div className="main-content">
        <MindmapCanvas
          data={data}
          selectedNodeId={selectedNodeId}
          hoveredNodeId={hoveredNodeId}
          expandedNodeIds={expandedNodeIds}
          viewTransform={viewTransform}
          onNodeSelect={handleNodeSelect}
          onNodeHover={handleNodeHover}
          onNodeToggle={handleNodeToggle}
          onViewTransformChange={setViewTransform}
          onNodePositionsChange={setNodePositions}
        />
        <DetailPanel
          node={selectedNode}
          isEditing={editingNodeId === selectedNodeId}
          onEdit={() => handleNodeEdit(selectedNodeId)}
          onSave={(updates) => handleNodeSave(selectedNodeId, updates)}
          onCancelEdit={() => setEditingNodeId(null)}
        />
      </div>
    </div>
  )
}

export default App
