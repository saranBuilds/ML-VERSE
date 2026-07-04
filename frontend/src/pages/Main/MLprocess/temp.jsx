
import api from "../../../api";

const sendCategory = async (category, type, workspaceId) => {
  try {
    await api.post("/home/category", {
      category,
      type,
      ...(workspaceId ? { workspace_id: workspaceId } : {})
    })
  } catch (err) {
    console.error(err)
  }
}

export default function Category({ category, setCategory, type, setType, workspaceId }) {
  const data = {
    supervised: ["Regression", "Classification"],
    unsupervised: ["Clustering", "Association Rule", "Dimensionality Reduction"]
  }

  const options = data[category] || []

  return (
    <div className="bg-white shadow-lg rounded-2xl p-6 border border-gray-200">

      <h2 className="text-xl font-semibold text-center mb-6">
        Select ML Workflow
      </h2>

      {/* Category */}
      <div className="mb-6">
        <p className="text-sm mb-2">Choose Category</p>

        <div className="grid grid-cols-2 gap-4">
          {["supervised", "unsupervised"].map((item) => (
            <button
              key={item}
              onClick={() => setCategory(item)}
              className={`p-4 rounded-xl border
              ${category === item
                ? "bg-blue-600 text-white"
                : "bg-gray-50 hover:bg-gray-100"}`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* Type */}
      {category && (
        <div>
          <p className="text-sm mb-2">Select Type</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {options.map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  setType(item.toLowerCase())
                  sendCategory(category, item.toLowerCase(), workspaceId)
                }}
                className={`p-3 rounded-lg border
                ${type === item.toLowerCase()
                  ? "bg-blue-100 border-blue-500 text-blue-700"
                  : "hover:bg-gray-50"}`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      )}

      {category && type && (
        <div className="mt-6 p-3 bg-blue-50 border rounded-lg text-center">
          {category} → {type}
        </div>
      )}
    </div>
  )
}