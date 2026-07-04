import { useState } from "react"
import { FolderOpen, Clock, Loader2, Trash2, AlertTriangle } from "lucide-react"

// Human-readable label for each pipeline step
const STEP_LABELS = {
  dataset_upload:      { label: "Awaiting Dataset", color: "#94a3b8" },
  eda:                 { label: "EDA Ready",         color: "#22c55e" },
  missing_values:      { label: "Data Cleaning",     color: "#f59e0b" },
  encoding:            { label: "Encoding",           color: "#6366f1" },
  scaling:             { label: "Scaling",            color: "#8b5cf6" },
  feature_engineering: { label: "Feature Eng.",      color: "#ec4899" },
  model_selection:     { label: "Model Selection",   color: "#0ea5e9" },
  model_training:      { label: "Training",          color: "#14b8a6" },
}

function WorkspaceCard({ workspace, onClick, isOpening, onDelete, isDeleting }) {
  const [confirmDelete, setConfirmDelete] = useState(false)

  const formatted = workspace.created_at
    ? new Date(workspace.created_at).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
      })
    : "—"

  // Generate a deterministic accent colour from the workspace name
  const hues = [221, 262, 187, 142, 31, 339]
  const hue = hues[workspace.workspace_name.charCodeAt(0) % hues.length]

  const step = workspace.current_step || "dataset_upload"
  const stepInfo = STEP_LABELS[step] || { label: step, color: "#94a3b8" }

  const handleDeleteClick = (e) => {
    e.stopPropagation()
    setConfirmDelete(true)
  }

  const handleConfirm = (e) => {
    e.stopPropagation()
    setConfirmDelete(false)
    onDelete(workspace.workspace_id)
  }

  const handleCancel = (e) => {
    e.stopPropagation()
    setConfirmDelete(false)
  }

  return (
    <button
      id={`workspace-card-${workspace.workspace_id}`}
      onClick={() => !confirmDelete && onClick(workspace)}
      className="workspace-card"
      style={{ "--accent-hue": hue }}
      disabled={isOpening || isDeleting}
    >
      {/* Top accent stripe */}
      <div className="workspace-card__stripe" />

      {/* Delete / Confirm controls */}
      {!confirmDelete ? (
        <button
          id={`delete-workspace-${workspace.workspace_id}`}
          className="workspace-card__delete-btn"
          onClick={handleDeleteClick}
          title="Delete workspace"
          disabled={isOpening || isDeleting}
        >
          {isDeleting
            ? <Loader2 size={14} className="animate-spin" />
            : <Trash2 size={14} />
          }
        </button>
      ) : (
        <div className="workspace-card__confirm-row" onClick={e => e.stopPropagation()}>
          <AlertTriangle size={13} style={{ color: "#ef4444" }} />
          <span className="workspace-card__confirm-label">Delete?</span>
          <button className="workspace-card__confirm-yes" onClick={handleConfirm}>Yes</button>
          <button className="workspace-card__confirm-no"  onClick={handleCancel}>No</button>
        </div>
      )}

      {/* Icon */}
      <div className="workspace-card__icon-wrap">
        {isOpening
          ? <Loader2 size={26} className="animate-spin" />
          : <FolderOpen size={26} />
        }
      </div>

      {/* Name */}
      <h3 className="workspace-card__name">{workspace.workspace_name}</h3>

      {/* Step badge */}
      <div
        className="workspace-card__step-badge"
        style={{ backgroundColor: stepInfo.color + "22", color: stepInfo.color, border: `1px solid ${stepInfo.color}55` }}
      >
        {stepInfo.label}
      </div>

      {/* Date */}
      <div className="workspace-card__date">
        <Clock size={12} />
        <span>{formatted}</span>
      </div>

      {/* Open label */}
      <div className="workspace-card__open-label">
        {isOpening ? "Restoring workspace…" : "Continue workspace →"}
      </div>
    </button>
  )
}

export default WorkspaceCard
