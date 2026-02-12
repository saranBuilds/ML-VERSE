import { useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../api"
import {
  UserPlus,
  Mail,
  Lock,
  User,
  CheckCircle,
  AlertCircle,
  KeyRound,
  ArrowLeft
} from "lucide-react"

export default function Signup() {
  const navigate = useNavigate()

  const [step, setStep] = useState("signup")

  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [otp, setOtp] = useState("")

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")

  const submitSignup = async () => {
    try {
      setLoading(true)
      setError("")
      setSuccess("")

      const res = await api.post("/auth/signup", { username, email, password })
      setSuccess(res.data.message || "OTP sent to your email")
      setStep("otp")
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed")
    } finally {
      setLoading(false)
    }
  }

  const submitOtp = async () => {
    try {
      setLoading(true)
      setError("")
      await api.post("/signup/authenticate", { user_otp: otp })
      navigate("/")
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP")
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !loading) {
      if (step === "signup" && username && email && password) submitSignup()
      if (step === "otp" && otp) submitOtp()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-200 px-4">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mb-4 shadow-lg">
            {step === "signup"
              ? <UserPlus className="w-8 h-8 text-white" />
              : <KeyRound className="w-8 h-8 text-white" />}
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {step === "signup" ? "Create Account" : "Verify Email"}
          </h1>
          <p className="text-gray-600">
            {step === "signup"
              ? "Sign up to get started"
              : "Enter the OTP sent to your email"}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">

          {error && (
            <div className="mb-6 flex gap-3 p-4 bg-red-50 rounded-xl text-red-800 text-sm">
              <AlertCircle className="w-5 h-5 mt-0.5" />
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 flex gap-3 p-4 bg-emerald-50 rounded-xl text-emerald-800 text-sm">
              <CheckCircle className="w-5 h-5 mt-0.5" />
              {success}
            </div>
          )}

          {/* STEP 1 */}
          {step === "signup" && (
            <div className="space-y-5">

              <Input label="Username" icon={<User />} value={username}
                onChange={setUsername} onKeyPress={handleKeyPress} />

              <Input label="Email" icon={<Mail />} value={email}
                onChange={setEmail} onKeyPress={handleKeyPress} />

              <Input label="Password" type="password" icon={<Lock />}
                value={password} onChange={setPassword}
                onKeyPress={handleKeyPress} />

              <button
                onClick={submitSignup}
                disabled={loading || !username || !email || !password}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:opacity-90 disabled:opacity-50"
              >
                {loading ? "Sending OTP..." : "Create Account"}
              </button>

              <div className="text-center text-sm">
                Already have an account?{" "}
                <button
                  onClick={() => navigate("/")}
                  className="text-blue-600 hover:underline font-medium"
                >
                  Login
                </button>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === "otp" && (
            <div className="space-y-5">
              <p className="text-center text-sm text-gray-600">
                OTP sent to <b>{email}</b>
              </p>

              <Input label="OTP" icon={<KeyRound />} value={otp}
                onChange={setOtp} onKeyPress={handleKeyPress}
                center mono />

              <button
                onClick={submitOtp}
                disabled={loading || !otp}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:opacity-90 disabled:opacity-50"
              >
                {loading ? "Verifying..." : "Verify & Finish"}
              </button>

              <button
                onClick={() => setStep("signup")}
                className="w-full flex justify-center gap-2 text-sm text-gray-600"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* Reusable input */
function Input({ label, icon, type="text", value, onChange, onKeyPress, center, mono }) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div className="relative mt-1">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          {icon}
        </div>
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyPress={onKeyPress}
          className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500
            ${center ? "text-center tracking-widest" : ""}
            ${mono ? "font-mono" : ""}`}
        />
      </div>
    </div>
  )
}
