import { useState } from "react"
import { UploadCloud, ChevronLeft } from "lucide-react"
import api from "../../../api"

export default function DatasetUpload({ setFile, onUploadSuccess, onPrevStep }) {
  const [fileName, setFileName] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const uploadDataset = async (file) => {
    const formData = new FormData()
    formData.append("dataset", file)

    try {
      setLoading(true)

      const res = await api.post("/home/category/dataset_upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      })

      console.log(res.data)

      // 🔥 OPTIONAL: store preview/columns in session
      sessionStorage.setItem("columns", JSON.stringify(res.data.columns))
      sessionStorage.setItem("preview", JSON.stringify(res.data.preview))

      // Trigger next step
      if (onUploadSuccess) onUploadSuccess()

    } catch (err) {
      console.error(err)
      setError("Upload failed. Try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const allowedTypes = [
      "text/csv",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ]

    if (!allowedTypes.includes(file.type)) {
      setError("Only CSV or Excel files are allowed")
      return
    }

    setError("")
    setFileName(file.name)

    // 🔥 frontend session
    sessionStorage.setItem("datasetName", file.name)

    setFile(file)

    // ✅ CALL BACKEND HERE
    uploadDataset(file)
  }

  return (
    <div className="bg-white shadow-lg rounded-2xl p-6 border border-gray-200">

      <div className="flex items-center mb-6 relative">
        <button 
          onClick={onPrevStep}
          className="absolute left-0 p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition"
          title="Go Back"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-semibold text-center w-full">
          Upload Dataset
        </h2>
      </div>

      <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-6 cursor-pointer hover:border-blue-500 transition">

        <UploadCloud className="w-10 h-10 text-gray-400 mb-3" />

        <p className="text-sm text-gray-600">
          {loading ? "Uploading..." : "Click to upload CSV / Excel"}
        </p>

        <input
          type="file"
          className="hidden"
          onChange={handleFileChange}
        />
      </label>

      {fileName && !loading && (
        <div className="mt-4 text-sm text-green-600 text-center">
          Uploaded: {fileName}
        </div>
      )}

      {error && (
        <div className="mt-4 text-sm text-red-500 text-center">
          {error}
        </div>
      )}
    </div>
  )
}