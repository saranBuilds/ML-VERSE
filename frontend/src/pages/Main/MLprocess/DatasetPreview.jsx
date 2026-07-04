import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";

export default function DatasetPreview({ onNextStep, onPrevStep }) {
  const [columns, setColumns] = useState([]);
  const [preview, setPreview] = useState([]);
  const [datasetName, setDatasetName] = useState("");

  useEffect(() => {
    const cols = JSON.parse(sessionStorage.getItem("columns") || "[]");
    const prev = JSON.parse(sessionStorage.getItem("preview") || "[]");
    const name = sessionStorage.getItem("datasetName") || "Dataset";
    setColumns(cols);
    setPreview(prev);
    setDatasetName(name);
  }, []);

  return (
    <div className="bg-white shadow-lg rounded-2xl p-6 border border-gray-200 w-full mb-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">
          Dataset Preview <span className="text-sm font-normal text-gray-500">({datasetName})</span>
        </h2>
        <div className="flex gap-3">
          <button
            onClick={onNextStep}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium cursor-pointer"
          >
            Next Step: Data Cleaning <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      </div>

      <div className="overflow-auto border border-gray-200 rounded-lg max-h-[60vh]">
        <table className="w-full text-sm text-left whitespace-nowrap">
          <thead className="text-xs text-gray-700 uppercase bg-gray-100 border-b border-gray-200 sticky top-0 z-10">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className="px-6 py-3 font-semibold">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {preview.map((row, rowIdx) => (
              <tr key={rowIdx} className="bg-white border-b hover:bg-gray-50 transition">
                {columns.map((col, colIdx) => (
                  <td key={colIdx} className="px-6 py-4 text-gray-600">
                    {row[col] !== null && row[col] !== undefined ? String(row[col]) : (
                      <span className="text-gray-400 italic">null</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
            {preview.length === 0 && (
              <tr>
                <td colSpan={columns.length || 1} className="px-6 py-8 text-center text-gray-500">
                  No data available to preview.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {preview.length > 0 && (
        <div className="mt-4 text-sm text-gray-500 text-center">
          Showing top {preview.length} rows
        </div>
      )}
    </div>
  );
}
