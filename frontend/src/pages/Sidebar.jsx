import { BarChart3, Brain, Database, User } from "lucide-react"

function Sidebar({ user, activePage, setActivePage }) {
  const navItems = [
    { id: "ml", label: "ML Process", icon: Brain },
    { id: "ds", label: "Data Science Process", icon: BarChart3 },
    { id: "datamart", label: "Dataset Marts", icon: Database },
    { id: "settings", label: "User Settings", icon: User }
  ]

  return (
    <aside className="w-64 h-screen bg-white border-r flex flex-col">
      
      {/* Brand */}
      <div className="px-6 py-5 border-b">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          ML VERSE
        </h1>
        <p className="text-sm text-gray-500 mt-1">Auto-ML Platform</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4">
        {navItems.map(item => {
          const Icon = item.icon
          const isActive = activePage === item.id

          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-all duration-200
                ${
                  isActive
                    ? "bg-blue-50 text-blue-600 font-medium"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "text-blue-600" : ""}`} />
              <span className="text-sm">{item.label}</span>

              {isActive && (
                <span className="ml-auto w-1.5 h-6 bg-blue-600 rounded-full" />
              )}
            </button>
          )
        })}
      </nav>

      {/* User */}
      <div className="px-4 py-4 border-t">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
            {user?.[0] || ""}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800">
              {user || ""}
            </p>
            <p className="text-xs text-gray-500">Logged in</p>
          </div>
        </div>
      </div>

    </aside>
  )
};

export default Sidebar
