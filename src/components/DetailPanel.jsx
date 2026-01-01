import { useState, useEffect } from 'react'

function DetailPanel({ node, isEditing, onEdit, onSave, onCancelEdit }) {
  const [formData, setFormData] = useState({ label: '', summary: '', description: '' })

  useEffect(() => {
    if (node) {
      setFormData({
        label: node.label || '',
        summary: node.summary || '',
        description: node.description || ''
      })
    }
  }, [node, isEditing])

  const handleSave = () => {
    onSave(formData)
  }

  if (!node) {
    return (
      <div className="detail-panel">
        <div className="detail-panel-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 16v-4M12 8h.01"/>
          </svg>
          <p>Select a node to view details</p>
        </div>
      </div>
    )
  }

  if (isEditing) {
    return (
      <div className="detail-panel">
        <div className="detail-header">
          <h2>Edit Node</h2>
        </div>
        <div className="edit-form">
          <div className="form-group">
            <label>Label</label>
            <input
              type="text"
              value={formData.label}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Summary</label>
            <input
              type="text"
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div className="form-actions">
            <button className="btn btn-secondary" onClick={onCancelEdit}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave}>Save</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="detail-panel">
      <div className="detail-header">
        <h2>{node.label}</h2>
        <button className="toolbar-btn" onClick={onEdit}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
          Edit
        </button>
      </div>
      <div className="detail-content">
        {node.summary && (
          <div className="detail-section">
            <div className="detail-section-title">Summary</div>
            <div className="detail-section-content">{node.summary}</div>
          </div>
        )}
        {node.description && (
          <div className="detail-section">
            <div className="detail-section-title">Description</div>
            <div className="detail-section-content">{node.description}</div>
          </div>
        )}
        {node.metadata && Object.keys(node.metadata).length > 0 && (
          <div className="detail-section">
            <div className="detail-section-title">Metadata</div>
            <div className="metadata-list">
              {Object.entries(node.metadata).map(([key, value]) => (
                <div key={key} className="metadata-item">
                  <span className="metadata-key">{key}</span>
                  <span className="metadata-value">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {node.children && node.children.length > 0 && (
          <div className="detail-section">
            <div className="detail-section-title">Children</div>
            <div className="detail-section-content">
              {node.children.length} child node{node.children.length !== 1 ? 's' : ''}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DetailPanel
