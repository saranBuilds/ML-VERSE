import { useEffect, useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import api from "../api"
import Sidebar from "./Sidebar"

import MLprocess from "./Main/MLprocess/MLprocess"


export default function Home() {
  const [user, setUser] = useState("")
  const [activePage, setActivePage] = useState("ml")
  const navigate = useNavigate()

  const pages = useMemo(() => ({
    ml: <MLprocess />,
  }), [user])

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