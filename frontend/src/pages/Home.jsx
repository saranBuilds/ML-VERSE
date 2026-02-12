import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../api"
import Sidebar from "./Sidebar"

import MLprocess from "./Main/MLprocess"
import DataScienceProc from "./Main/DataScienceProc"
import UserSettings from "./Main/UserSettings"
import DatasetMart from "./Main/DatasetMart"

export default function Home() {
  const [user, setUser] = useState("")
  const [activePage, setActivePage] = useState("ml")
  const navigate = useNavigate()

  useEffect(() => {
    api.get("/home", {
      headers: { Authorization: "Bearer " + localStorage.getItem("token") }
    }).then(res => setUser(res.data.user))
  }, [])

  const renderPage = () => {
    if (activePage === "ml") return <MLprocess />
    if (activePage === "ds") return <DataScienceProc />
    if (activePage === "datamart") return <DatasetMart />
    if (activePage === "settings") return <UserSettings user={user} />
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar user={user} setActivePage={setActivePage} />
      <main className="flex-1 p-8">
        {renderPage()}
        <div></div>
      </main>
    </div>
  )
}
