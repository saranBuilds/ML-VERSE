import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../../api"

function UserSettings({ user }) {
  const navigate = useNavigate()

  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const Logout = () => {
    localStorage.removeItem("token")
    navigate("/")
  }

  useEffect(() => {
    if (!user) return

    api
      .post("/auth/get-user-data", { user })
      .then(res => {
        setUsername(res.data.username)
        setEmail(res.data.email)
      })
      .catch(err => {
        console.error(err)
      })
  }, [user])

  const handleChangePassword = async () => {
    setMessage("")

    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage("All fields are required")
      return
    }

    if (newPassword !== confirmPassword) {
      setMessage("New passwords do not match")
      return
    }

    try {
      setLoading(true)

      await api.post(
        "/auth/change-pwd",
        {
          currentPassword,
          newPassword,
          email,
          username
        },
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token")
          }
        }
      )

      setMessage("Password changed successfully")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (err) {
      setMessage(err.response?.data?.message || "Password change failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl bg-white rounded-xl shadow-sm border p-6">
      <h2 className="text-xl font-semibold mb-6">User Settings</h2>

      {/* User Info */}
      <div className="mb-6 space-y-2">
        <p className="text-sm text-gray-600">
          <span className="font-medium text-gray-800">Username:</span>{" "}
          {username}
        </p>
        <p className="text-sm text-gray-600">
          <span className="font-medium text-gray-800">Email:</span>{" "}
          {email}
        </p>
      </div>

      {/* Change Password */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-medium mb-4">Change Password</h3>

        <div className="space-y-4">
          <input
            type="password"
            placeholder="Current password"
            value={currentPassword}
            onChange={e => setCurrentPassword(e.target.value)}
            className="w-full border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            className="w-full border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            className="w-full border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500"
          />

          {message && (
            <p className="text-sm text-green-600">{message}</p>
          )}

          <button
            onClick={handleChangePassword}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </div>
      </div>

      {/* Logout */}
      <div className="border-t mt-6 pt-4">
        <button
          onClick={Logout}
          className="text-red-600 text-sm hover:underline"
        >
          Logout
        </button>
      </div>
    </div>
  )
}

export default UserSettings
