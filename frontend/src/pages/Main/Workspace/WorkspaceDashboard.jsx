import { useState, useEffect } from "react"
import { Plus, Brain, RefreshCw, AlertCircle, Loader2 } from "lucide-react"
import api from "../../../api"
import WorkspaceCard from "./WorkspaceCard"
import CreateWorkspaceModal from "./CreateWorkspaceModal"
import "./workspace.css"

const MAX_WORKSPACES = 5

function WorkspaceDashboard({ user, onWorkspaceSelect }) {
  const [workspaces, setWorkspaces] = useState([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [openingId, setOpeningId] = useState(null)   // tracks which card is loading
  const [deletingId, setDeletingId] = useState(null) // tracks which card is being deleted

  // ── Fetch workspace list on mount ─────────────────────────────────
  const fetchWorkspaces = async () => {
    setLoading(true)
    setFetchError("")
    try {
      const res = await api.get("/home/workspace/list")
      setWorkspaces(res.data.workspaces || [])
    } catch {
      setFetchError("Could not load workspaces. Check your connection.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchWorkspaces() }, [])

  // ── Handle new workspace created ──────────────────────────────────
  const handleCreated = (newWorkspace) => {
    setShowModal(false)
    const ws = {
      workspace_id:     newWorkspace.workspace_id,
      workspace_name:   newWorkspace.workspace_name,
      created_at:       newWorkspace.created_at,
      current_step:     "dataset_upload",
      dataset_uploaded: false,
    }
    setWorkspaces((prev) => [...prev, ws])
    // Redirect to ML pipeline at step 0 (Category selection)
    onWorkspaceSelect(ws, 0)
  }

  // ── Delete a workspace ────────────────────────────────────────────
  const handleWorkspaceDelete = async (workspaceId) => {
    setDeletingId(workspaceId)
    try {
      await api.delete(`/home/workspace/delete/${workspaceId}`)
      setWorkspaces((prev) => prev.filter((w) => w.workspace_id !== workspaceId))
    } catch (err) {
      console.error("Failed to delete workspace:", err)
      alert("Could not delete workspace. Please try again.")
    } finally {
      setDeletingId(null)
    }
  }

  // ── Open workspace: call /continue to reconstruct session ─────────
  const handleWorkspaceOpen = async (ws) => {
    setOpeningId(ws.workspace_id)
    try {
      const res = await api.post(`/home/workspace/continue/${ws.workspace_id}`)
      const { workspace, active_step, columns, ml_category, ml_type } = res.data

      // Restore columns in sessionStorage for DataCleaning page
      if (columns && columns.length > 0) {
        sessionStorage.setItem("columns", JSON.stringify(columns))
      }

      // Extract saved pipeline strategies to pre-populate step UIs
      const pipeline = workspace?.pipeline ?? {}

      // Propagate to parent (Home.jsx) with initialStep + restored category/type + pipeline
      onWorkspaceSelect(workspace?.metadata ?? ws, active_step, ml_category, ml_type, pipeline)
    } catch (err) {
      console.error("Failed to continue workspace:", err)
      // Fallback: open fresh without reconstruction
      onWorkspaceSelect(ws, undefined)
    } finally {
      setOpeningId(null)
    }
  }

  const atLimit = workspaces.length >= MAX_WORKSPACES

  // ── Loading skeleton ──────────────────────────────────────────────
  if (loading) {
    return (
      <div className="wsd-root">
        <WorkspaceDashboardHeader user={user} atLimit onNew={null} />
        <div className="wsd-skeleton-grid">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="wsd-skeleton-card" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="wsd-root">

      {/* ── Header ────────────────────────────────────────────── */}
      <div className="wsd-header">
        <div className="wsd-header__left">
          <div className="wsd-header__icon">
            <Brain size={24} />
          </div>
          <div>
            <h1 className="wsd-header__title">My Workspaces</h1>
            <p className="wsd-header__sub">
              {user ? `Welcome back, ${user}` : "Select or create a workspace to start"}
            </p>
          </div>
        </div>

        <div className="wsd-header__actions">
          {/* Slot counter */}
          <div className={`wsd-slot-badge ${atLimit ? "wsd-slot-badge--full" : ""}`}>
            <span>{workspaces.length} / {MAX_WORKSPACES}</span>
            <span className="wsd-slot-badge__label">slots used</span>
          </div>

          {/* Refresh */}
          <button
            id="wsd-refresh-btn"
            className="wsd-icon-btn"
            onClick={fetchWorkspaces}
            title="Refresh"
          >
            <RefreshCw size={16} />
          </button>

          {/* New workspace */}
          <button
            id="wsd-new-btn"
            className={`wsd-new-btn ${atLimit ? "wsd-new-btn--disabled" : ""}`}
            onClick={() => !atLimit && setShowModal(true)}
            disabled={atLimit}
            title={atLimit ? "Maximum 5 workspaces reached" : "Create new workspace"}
          >
            <Plus size={18} />
            New Workspace
          </button>
        </div>
      </div>

      {/* ── Error Banner ────────────────────────────────────────── */}
      {fetchError && (
        <div className="wsd-error-banner">
          <AlertCircle size={16} />
          <span>{fetchError}</span>
          <button onClick={fetchWorkspaces} className="wsd-error-banner__retry">Retry</button>
        </div>
      )}

      {/* ── Workspace Grid ──────────────────────────────────────── */}
      {workspaces.length === 0 ? (
        <EmptyState onNew={() => setShowModal(true)} />
      ) : (
        <div className="wsd-grid">
          {workspaces.map((ws) => (
            <WorkspaceCard
              key={ws.workspace_id}
              workspace={ws}
              onClick={handleWorkspaceOpen}
              isOpening={openingId === ws.workspace_id}
              onDelete={handleWorkspaceDelete}
              isDeleting={deletingId === ws.workspace_id}
            />
          ))}

          {/* "Add slot" ghost card — visible only when < 5 */}
          {!atLimit && (
            <button
              id="wsd-ghost-card"
              className="wsd-ghost-card"
              onClick={() => setShowModal(true)}
            >
              <Plus size={28} />
              <span>New Workspace</span>
            </button>
          )}
        </div>
      )}

      {/* ── Modal ───────────────────────────────────────────────── */}
      {showModal && (
        <CreateWorkspaceModal
          onClose={() => setShowModal(false)}
          onCreated={handleCreated}
        />
      )}

    </div>
  )
}

// ── Internal sub-components ───────────────────────────────────────────

function WorkspaceDashboardHeader({ user, atLimit, onNew }) {
  return (
    <div className="wsd-header wsd-header--skeleton">
      <div className="wsd-header__left">
        <div className="wsd-header__icon wsd-header__icon--muted">
          <Brain size={24} />
        </div>
        <div>
          <div className="wsd-skeleton-line wsd-skeleton-line--title" />
          <div className="wsd-skeleton-line wsd-skeleton-line--sub" />
        </div>
      </div>
    </div>
  )
}

function EmptyState({ onNew }) {
  return (
    <div className="wsd-empty">
      <div className="wsd-empty__icon">
        <Brain size={48} />
      </div>
      <h2 className="wsd-empty__title">No workspaces yet</h2>
      <p className="wsd-empty__body">
        Workspaces keep your ML projects organised. Each one has its own
        dataset, pipeline and trained model.
      </p>
      <button id="wsd-empty-create-btn" className="wsd-new-btn" onClick={onNew}>
        <Plus size={18} />
        Create your first workspace
      </button>
    </div>
  )
}

export default WorkspaceDashboard
