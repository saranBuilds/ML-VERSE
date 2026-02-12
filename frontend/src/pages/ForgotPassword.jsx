import { useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../api"
import {
  Mail,
  KeyRound,
  Lock,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Shield
} from "lucide-react"

export default function ForgotPassword() {
  const navigate = useNavigate()

  const [step, setStep] = useState(1)
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [password, setPassword] = useState("")

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const sendOtp = async () => {
    try {
      setLoading(true)
      setError("")
      setSuccess("")
      const res = await api.post("/auth/forgot-password", { email })
      setSuccess(res.data.message)
      setStep(2)
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP")
    } finally {
      setLoading(false)
    }
  }

  const verifyOtp = async () => {
    try {
      setLoading(true)
      setError("")
      setSuccess("")
      const res = await api.post("/forgot-password/verify", { otp })
      setSuccess(res.data.message)
      setStep(3)
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP")
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async () => {
    try {
      setLoading(true)
      setError("")
      await api.post("/forgot-password/reset", { new_password: password })
      navigate("/")
    } catch (err) {
      setError(err.response?.data?.message || "Password reset failed")
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !loading) {
      if (step === 1 && email) sendOtp()
      else if (step === 2 && otp) verifyOtp()
      else if (step === 3 && password.length >= 4) resetPassword()
    }
  }

  const stepConfig = {
    1: {
      icon: <Mail className="w-8 h-8 text-white" />,
      title: "Forgot Password?",
      subtitle: "Enter your email to reset your password",
      color: "from-indigo-600 to-blue-600",
      ringColor: "ring-indigo-200",
    },
    2: {
      icon: <KeyRound className="w-8 h-8 text-white" />,
      title: "Verify OTP",
      subtitle: "Enter the code sent to your email",
      color: "from-amber-600 to-orange-600",
      ringColor: "ring-amber-200",
    },
    3: {
      icon: <Lock className="w-8 h-8 text-white" />,
      title: "Reset Password",
      subtitle: "Choose a strong new password",
      color: "from-emerald-600 to-teal-600",
      ringColor: "ring-emerald-200",
    },
  }

  const currentStep = stepConfig[step]

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 px-4">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${currentStep.color} rounded-2xl mb-4 shadow-lg`}>
            {currentStep.icon}
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {currentStep.title}
          </h1>
          <p className="text-gray-600">{currentStep.subtitle}</p>
        </div>

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

          {step === 1 && (
            <>
              <input
                className="w-full mb-4 p-3 border rounded-xl focus:ring-2 focus:ring-indigo-500"
                placeholder="Email address"
                onChange={e => setEmail(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <button
                onClick={sendOtp}
                disabled={loading || !email}
                className={`w-full py-3 rounded-xl text-white bg-gradient-to-r ${currentStep.color} disabled:opacity-50`}
              >
                {loading ? "Sending..." : "Send OTP"}
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <input
                className="w-full mb-4 p-3 border rounded-xl text-center tracking-widest"
                placeholder="Enter OTP"
                onChange={e => setOtp(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <button
                onClick={verifyOtp}
                disabled={loading || !otp}
                className={`w-full py-3 rounded-xl text-white bg-gradient-to-r ${currentStep.color} disabled:opacity-50`}
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
            </>
          )}

          {step === 3 && (
            <>
              <input
                type="password"
                className="w-full mb-4 p-3 border rounded-xl"
                placeholder="New password"
                onChange={e => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <button
                onClick={resetPassword}
                disabled={loading || password.length < 4}
                className={`w-full py-3 rounded-xl text-white bg-gradient-to-r ${currentStep.color} disabled:opacity-50`}
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </>
          )}

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to login
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
