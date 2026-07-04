import { useState, useEffect } from "react";
import { ChevronRight, ChevronLeft, GitMerge, CheckCircle2, RefreshCw, AlertCircle, History } from "lucide-react";
import api from "../../../api";

export default function FeatureEngineering({ onNextStep, onPrevStep, savedEncodingStrategy = {}, savedScalingStrategy = {} }) {
  const [objectColumns, setObjectColumns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [strategies, setStrategies] = useState({});
  const [applying, setApplying] = useState(false);
  const [success, setSuccess] = useState("");

  // Were encoding strategies already applied in a previous session?
  const hasSavedEncoding = Object.keys(savedEncodingStrategy).length > 0;

  useEffect(() => {
    const fetchCategoricalColumns = async () => {
      try {
        setLoading(true);
        const res = await api.post("/home/mlprocess/EDA");

        const describeObj = res.data.describe_object || {};
        const catCols = Object.keys(describeObj);
        setObjectColumns(catCols);

        // Build initial strategies:
        // - If we have saved strategies from a previous session, use those as defaults
        // - Otherwise fall back to "label" for each column
        const initialStrategies = {};
        catCols.forEach(col => {
          initialStrategies[col] = savedEncodingStrategy[col] ?? "label";
        });
        setStrategies(initialStrategies);

      } catch (err) {
        console.error("Failed to fetch categorical columns:", err);
        setError(err.response?.data?.error || "Failed to load categorical features from your dataset.");
      } finally {
        setLoading(false);
      }
    };

    fetchCategoricalColumns();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStrategyChange = (colName, strategy) => {
    setStrategies(prev => ({ ...prev, [colName]: strategy }));
  };

  const applyEncoding = async () => {
    if (Object.keys(strategies).length === 0) return;
    try {
      setApplying(true);
      setSuccess("");
      await api.post("/home/mlprocess/feature_engineering/apply_encoding", {
        encoding_strategy: strategies
      });
      setSuccess("Successfully encoded categorical features!");
    } catch (err) {
      console.error(err);
      alert("Error applying encoding strategies");
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-lg border border-gray-100">
        <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="mt-6 text-gray-500 font-medium animate-pulse">Scanning Features...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-8 rounded-2xl border border-red-100 shadow-sm text-center">
        <h3 className="text-xl font-bold mb-2">Failed to Scan Features</h3>
        <p className="text-red-500/80">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100 mb-10 w-full animate-in fade-in zoom-in-95 duration-300">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-900 to-indigo-800 p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-8 -mt-8 opacity-10">
          <GitMerge className="w-48 h-48" />
        </div>
        <h2 className="text-3xl font-bold mb-2 relative z-10 flex items-center">
          Feature Engineering Workspace
        </h2>
        <p className="text-indigo-200 relative z-10 text-sm max-w-xl">
          Convert categorical (text) columns into numeric values so machine learning algorithms can understand them.
        </p>
      </div>

      <div className="p-8">
        <div className="bg-slate-50 border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <GitMerge className="text-indigo-500 w-5 h-5" />
            <h3 className="text-lg font-bold text-slate-800">Categorical Encoding</h3>
          </div>

          <p className="text-sm text-gray-500 mb-6">
            Assign a mapping algorithm for each non-numeric column found in your dataset.
          </p>

          {/* Previously-applied encoding banner */}
          {hasSavedEncoding && (
            <div className="mb-5 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
              <History className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-800 mb-1">
                  Previously applied encoding strategies — dropdowns pre-filled
                </p>
                <p className="text-xs text-amber-700/80">
                  These strategies were used in your last session. You can change them and re-apply.
                </p>
              </div>
            </div>
          )}

          {objectColumns.length > 0 ? (
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-100 border-b border-gray-200 text-gray-700">
                    <tr>
                      <th className="px-5 py-3 font-semibold">Column Name</th>
                      <th className="px-5 py-3 font-semibold w-1/2">Encoding Logic</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {objectColumns.map(col => (
                      <tr key={col} className="hover:bg-slate-50">
                        <td className="px-5 py-3 font-medium text-slate-700">
                          {col}
                          {/* Badge if this column had a previously saved strategy */}
                          {savedEncodingStrategy[col] && (
                            <span className="ml-2 px-1.5 py-0.5 text-[10px] font-semibold bg-amber-100 text-amber-700 rounded border border-amber-200 uppercase tracking-wide align-middle">
                              restored
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3">
                          <select
                            value={strategies[col] ?? "label"}
                            onChange={(e) => handleStrategyChange(col, e.target.value)}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 outline-none transition-colors"
                          >
                            <option value="label">Label Encoding (0, 1, 2...)</option>
                            <option value="ordinal">Ordinal Encoding (Ranks)</option>
                            <option value="onehot">One-Hot Encoding (Booleans)</option>
                            <option value="frequency">Frequency Encoding (Percentages)</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={applyEncoding}
                  disabled={applying}
                  className="flex items-center px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed text-white rounded-xl font-medium shadow-sm transition-all shadow-indigo-500/20"
                >
                  {applying ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <GitMerge className="w-4 h-4 mr-2" />}
                  {hasSavedEncoding ? "Re-encode Columns" : "Encode Columns"}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-indigo-50/50 border border-indigo-100 p-8 rounded-xl flex flex-col items-center justify-center text-center">
              <CheckCircle2 className="w-10 h-10 text-indigo-500 mb-3" />
              <p className="font-bold text-indigo-900 text-lg">Fully Numeric Dataset!</p>
              <p className="text-sm text-indigo-700/80 mt-1 max-w-sm">
                Your dataset already consists of purely numeric dimensions. No encoding step is necessary.
              </p>
            </div>
          )}

          {success && (
            <div className="mt-5 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center text-sm font-medium animate-in fade-in zoom-in-95">
              <CheckCircle2 className="w-5 h-5 mr-3 text-green-600" /> {success}
            </div>
          )}
        </div>

        {objectColumns.length === 0 && (
          <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800 leading-relaxed">
              If you just completed One-Hot Encoding in a previous step, your dataset might now have vastly expanded dimensions. Click "Next Step" to proceed.
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-8 py-5 border-t border-gray-100 bg-gray-50 flex justify-between">
        <button
          onClick={onPrevStep}
          className="flex items-center px-6 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl font-medium shadow-sm transition-all hover:-translate-y-0.5"
        >
          <ChevronLeft className="w-5 h-5 mr-1" /> Back to EDA
        </button>
        <button
          onClick={onNextStep}
          className="flex items-center px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium shadow-md shadow-indigo-500/20 transition-all hover:-translate-y-0.5"
        >
          Next Step: Modeling <ChevronRight className="w-5 h-5 ml-1" />
        </button>
      </div>
    </div>
  );
}
