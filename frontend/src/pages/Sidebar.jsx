import { BarChart3, Brain, Database, User } from "lucide-react"

function Sidebar({ user, activePage, setActivePage }) {
  const navItems = [
    { id: "ml", label: "ML Process", icon: Brain },
    { id: "ds", label: "Data Science Process", icon: BarChart3 },
    { id: "datamart", label: "Dataset Marts", icon: Database },
    { id: "settings", label: "User Settings", icon: User }
  ]

  return (
    <aside className="w-64 sticky top-0 h-screen bg-white border-r flex flex-col shrink-0">

      <div className="px-6 py-5 border-b">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          ML VERSE
        </h1>
        <p className="text-xs text-gray-500 mt-1">Auto-ML Platform</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activePage === item.id

          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`group w-full flex items-center gap-3 px-4 py-3 rounded-xl transition
              ${isActive ? "bg-blue-100 text-blue-700 shadow-sm" : "text-gray-600 hover:bg-gray-100"}`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "text-blue-600" : "text-gray-500"}`} />
              <span className="text-sm font-medium">{item.label}</span>

              {isActive && <span className="ml-auto w-1.5 h-6 bg-blue-600 rounded-full"></span>}
            </button>
          )
        })}
      </nav>

      <div className="px-4 py-4 border-t">
        <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
            {user?.[0]?.toUpperCase() || "U"}
          </div>
          <div>
            <p className="text-sm font-semibold">{user || "User"}</p>
            <p className="text-xs text-gray-500">Active now</p>
          </div>
        </div>
      </div>

    </aside>
  )
}

export default Sidebar