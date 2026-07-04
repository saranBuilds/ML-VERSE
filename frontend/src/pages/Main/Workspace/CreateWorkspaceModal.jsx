import { useState } from "react"
import { X, FolderPlus, Loader2 } from "lucide-react"
import api from "../../../api"

function CreateWorkspaceModal({ onClose, onCreated }) {
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) {
      setError("Workspace name is required.")
      return
    }
    setLoading(true)
    setError("")
    try {
      const res = await api.post("/home/workspace/create", {
        workspace_name: trimmed
      })
      onCreated(res.data)
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to create workspace."
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  // Close on backdrop click
  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div className="ws-modal-backdrop" onClick={handleBackdrop}>
      <div className="ws-modal" role="dialog" aria-modal="true" aria-labelledby="ws-modal-title">

        {/* Header */}
        <div className="ws-modal__header">
          <div className="ws-modal__icon">
            <FolderPlus size={22} />
          </div>
          <div>
            <h2 id="ws-modal-title" className="ws-modal__title">New Workspace</h2>
            <p className="ws-modal__subtitle">Create a new ML project workspace</p>
          </div>
          <button id="ws-modal-close" className="ws-modal__close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="ws-modal__body">
          <label className="ws-modal__label" htmlFor="ws-name-input">
            Workspace Name
          </label>
          <input
            id="ws-name-input"
            type="text"
            className={`ws-modal__input ${error ? "ws-modal__input--error" : ""}`}
            placeholder="e.g. Heart Disease Prediction"
            value={name}
            onChange={(e) => { setName(e.target.value); setError("") }}
            autoFocus
            maxLength={80}
            disabled={loading}
          />
          {error && <p className="ws-modal__error">{error}</p>}

          <div className="ws-modal__actions">
            <button
              id="ws-modal-cancel"
              type="button"
              className="ws-modal__btn ws-modal__btn--secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              id="ws-modal-submit"
              type="submit"
              className="ws-modal__btn ws-modal__btn--primary"
              disabled={loading || !name.trim()}
            >
              {loading ? (
                <>
                  <Loader2 size={15} className="ws-spinner" />
                  Creating…
                </>
              ) : (
                "Create Workspace"
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  )
}

export default CreateWorkspaceModal
