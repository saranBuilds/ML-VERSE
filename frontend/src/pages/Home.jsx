import { useEffect, useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import api from "../api"
import Sidebar from "./Sidebar"

import MLprocess from "./Main/MLprocess/MLprocess"
import DataScienceProc from "./Main/DataScienceProc"
import UserSettings from "./Main/UserSettings"
import DatasetMart from "./Main/DatasetMart"

export default function Home() {
  const [user, setUser] = useState("")
  const [activePage, setActivePage] = useState("ml")
  const [loading, setLoading] = useState(true)

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

  const pages = useMemo(() => ({
    ml: <MLprocess />,
    ds: <DataScienceProc />,
    datamart: <DatasetMart />,
    settings: <UserSettings user={user} />
  }), [user])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        Loading...
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar user={user} activePage={activePage} setActivePage={setActivePage} />

      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {pages[activePage]}
        </div>
      </main>
    </div>
  )
}