import { useEffect, useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import api from "../api"
import Sidebar from "./Sidebar"

import WorkspaceDashboard from "./Main/Workspace/WorkspaceDashboard"
import MLprocess from "./Main/MLprocess/MLprocess"
import DataScienceProc from "./Main/DataScienceProc"
import UserSettings from "./Main/UserSettings"
import DatasetMart from "./Main/DatasetMart"

export default function Home() {
  const [user, setUser] = useState("")
  const [activePage, setActivePage] = useState("ml")
  const [loading, setLoading] = useState(true)

  // ── Workspace gate ─────────────────────────────────────────────
  // null  → show WorkspaceDashboard
  // {...} → show MLprocess with that workspace as context
  const [activeWorkspace, setActiveWorkspace] = useState(null)

  // The React activeStep index to resume at (null = fresh start at 0)
  const [initialStep, setInitialStep] = useState(null)

  // Restored ML category/type from MongoDB (null = not yet selected)
  const [initialCategory, setInitialCategory] = useState(null)
  const [initialType, setInitialType] = useState(null)

  // Full saved pipeline from MongoDB — used to pre-populate step UIs on resume
  const [initialPipeline, setInitialPipeline] = useState(null)

  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem("token")

    if (!token) {
      navigate("/login")
      return
    }

    const fetchUser = async () => {
      try {
        const res = await api.get("/home", {
          headers: { Authorization: `Bearer ${token}` }
        })
        setUser(res.data.user)
      } catch {
        localStorage.removeItem("token")
        navigate("/login")
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [navigate])

  // Reset workspace selection when user switches away from ML tab
  const handlePageChange = (page) => {
    setActivePage(page)
    if (page !== "ml") {
      setActiveWorkspace(null)
      setInitialStep(null)
      setInitialCategory(null)
      setInitialType(null)
      setInitialPipeline(null)
    }
  }

  /**
   * Called by WorkspaceDashboard when the user clicks a workspace card.
   * `activeStep`  — numeric React step index returned by /continue
   * `mlCategory`  — persisted ML category (may be null for new workspaces)
   * `mlType`      — persisted ML type (may be null)
   * `pipeline`    — full saved pipeline strategies from MongoDB
   */
  const handleWorkspaceSelect = (ws, activeStep, mlCategory, mlType, pipeline) => {
    setActiveWorkspace(ws)
    setInitialStep(activeStep ?? null)
    setInitialCategory(mlCategory ?? null)
    setInitialType(mlType ?? null)
    setInitialPipeline(pipeline ?? null)
  }

  const handleBack = () => {
    setActiveWorkspace(null)
    setInitialStep(null)
    setInitialCategory(null)
    setInitialType(null)
    setInitialPipeline(null)
  }

  const pages = useMemo(() => ({
    ml: activeWorkspace
      ? (
        <MLprocess
          workspace={activeWorkspace}
          onBack={handleBack}
          initialStep={initialStep}
          initialCategory={initialCategory}
          initialType={initialType}
          initialPipeline={initialPipeline}
        />
      )
      : (
        <WorkspaceDashboard
          user={user}
          onWorkspaceSelect={handleWorkspaceSelect}
        />
      ),
    ds:       <DataScienceProc />,
    datamart: <DatasetMart />,
    settings: <UserSettings user={user} />
  }), [user, activeWorkspace, initialStep, initialCategory, initialType, initialPipeline])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        Loading...
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      <Sidebar user={user} activePage={activePage} setActivePage={handlePageChange} />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-6 md:p-8">
          {pages[activePage]}
        </div>
      </main>
    </div>
  )
}