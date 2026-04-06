import { useState, useEffect } from "react";
import { ChevronRight, ChevronLeft, BarChart3, Info, LayoutList, CheckCircle2 } from "lucide-react";
import api from "../../../api";

export default function Eda({ onNextStep, onPrevStep }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchEda = async () => {
      try {
        setLoading(true);
        // Using POST as dictated by backend definition
        const res = await api.post("/home/mlprocess/EDA");
        setData(res.data);
      } catch (err) {
        console.error("EDA Fetch Error:", err);
        setError(err.response?.data?.error || "Failed to load EDA data");
      } finally {
        setLoading(false);
      }
    };
    fetchEda();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-lg border border-gray-100">
        <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="mt-6 text-gray-500 font-medium animate-pulse">Analyzing Dataset...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-8 rounded-2xl border border-red-100 shadow-sm text-center">
        <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Info className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold mb-2">Analysis Failed</h3>
        <p className="text-red-500/80">{error}</p>
      </div>
    );
  }

  if (!data) return null;

  const { shape, columns, describe, describe_object } = data;
  const numCols = Object.keys(describe || {});
  const objCols = Object.keys(describe_object || {});

  // For numerical describe table
  const metricsNum = numCols.length > 0 ? Object.keys(describe[numCols[0]]) : [];
  
  // For categorical describe table
  const metricsObj = objCols.length > 0 ? Object.keys(describe_object[objCols[0]]) : [];

  return (
    <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100 mb-10 w-full animate-in fade-in zoom-in-95 duration-300">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-8 -mt-8 opacity-10">
          <BarChart3 className="w-48 h-48" />
        </div>
        <h2 className="text-3xl font-bold mb-2 relative z-10 flex items-center">
          Exploratory Data Analysis
        </h2>
        <p className="text-slate-300 relative z-10 text-sm max-w-xl">
          Review the characteristics of your dataset. We have generated summary statistics 
          to help you understand numerical and categorical variables.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-100 px-6 gap-6 overflow-x-auto bg-slate-50/50">
        <button 
          onClick={() => setActiveTab("overview")}
          className={`py-4 px-2 font-medium text-sm transition-all whitespace-nowrap border-b-2 flex items-center gap-2 ${
            activeTab === "overview" 
              ? "border-blue-600 text-blue-600" 
              : "border-transparent text-gray-500 hover:text-gray-800"
          }`}
        >
          <LayoutList className="w-4 h-4" /> Overview
        </button>
        <button 
          onClick={() => setActiveTab("numerical")}
          disabled={numCols.length === 0}
          className={`py-4 px-2 font-medium text-sm transition-all whitespace-nowrap border-b-2 flex items-center gap-2 ${
            activeTab === "numerical" 
              ? "border-blue-600 text-blue-600" 
              : "border-transparent text-gray-500 hover:text-gray-800 disabled:opacity-40 disabled:cursor-not-allowed"
          }`}
        >
          <BarChart3 className="w-4 h-4" /> Numerical Stats
        </button>
        <button 
          onClick={() => setActiveTab("categorical")}
          disabled={objCols.length === 0}
          className={`py-4 px-2 font-medium text-sm transition-all whitespace-nowrap border-b-2 flex items-center gap-2 ${
            activeTab === "categorical" 
              ? "border-blue-600 text-blue-600" 
              : "border-transparent text-gray-500 hover:text-gray-800 disabled:opacity-40 disabled:cursor-not-allowed"
          }`}
        >
          <Info className="w-4 h-4" /> Categorical Stats
        </button>
      </div>

      <div className="p-8">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-8 animate-in slide-in-from-right-4 fade-in duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-50/50 rounded-xl p-6 border border-blue-100 flex items-center gap-5">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-blue-600 shadow-sm font-bold text-xl border border-blue-100">
                  R
                </div>
                <div>
                  <p className="text-sm text-blue-600/80 font-medium mb-1">Total Rows</p>
                  <p className="text-3xl font-bold text-slate-800">{shape[0]}</p>
                </div>
              </div>
              <div className="bg-indigo-50/50 rounded-xl p-6 border border-indigo-100 flex items-center gap-5">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-indigo-600 shadow-sm font-bold text-xl border border-indigo-100">
                  C
                </div>
                <div>
                  <p className="text-sm text-indigo-600/80 font-medium mb-1">Total Columns</p>
                  <p className="text-3xl font-bold text-slate-800">{shape[1]}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                Features Detected
              </h3>
              <div className="flex flex-wrap gap-2">
                {columns.map((col, idx) => {
                  const isNum = numCols.includes(col);
                  return (
                    <span 
                      key={idx} 
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
                        isNum ? "bg-blue-50 text-blue-700 border-blue-100" : "bg-purple-50 text-purple-700 border-purple-100"
                      }`}
                    >
                      {col} {isNum ? "(Num)" : "(Cat)"}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Numerical Tab */}
        {activeTab === "numerical" && (
          <div className="animate-in slide-in-from-right-4 fade-in duration-300">
            <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 uppercase bg-gray-50/80 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 font-bold tracking-wider">Metric</th>
                    {numCols.map((col) => (
                      <th key={col} className="px-6 py-4 font-bold tracking-wider">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {metricsNum.map((metric, idx) => (
                    <tr key={metric} className="bg-white hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-3 font-semibold text-slate-700 capitalize">
                        {metric}
                      </td>
                      {numCols.map((col) => {
                        const val = describe[col][metric];
                        return (
                          <td key={col} className="px-6 py-3 text-slate-600">
                            {val !== null && val !== undefined ? (typeof val === 'number' ? val.toFixed(4) : val) : '-'}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Categorical Tab */}
        {activeTab === "categorical" && (
          <div className="animate-in slide-in-from-right-4 fade-in duration-300">
            <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 uppercase bg-gray-50/80 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 font-bold tracking-wider">Metric</th>
                    {objCols.map((col) => (
                      <th key={col} className="px-6 py-4 font-bold tracking-wider">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {metricsObj.map((metric) => (
                    <tr key={metric} className="bg-white hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-3 font-semibold text-slate-700 capitalize">
                        {metric}
                      </td>
                      {objCols.map((col) => {
                        const val = describe_object[col][metric];
                        return (
                          <td key={col} className="px-6 py-3 text-slate-600">
                            {val !== null && val !== undefined ? val : '-'}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-8 py-5 border-t border-gray-100 bg-gray-50 flex justify-between">
        <button
          onClick={onPrevStep}
          className="flex items-center px-6 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl font-medium shadow-sm transition-all hover:-translate-y-0.5"
        >
          <ChevronLeft className="w-5 h-5 mr-1" /> Back to Data Cleaning
        </button>
        <button
          onClick={onNextStep}
          className="flex items-center px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-md shadow-blue-500/20 transition-all hover:-translate-y-0.5"
        >
          Next Step: Features <ChevronRight className="w-5 h-5 ml-1" />
        </button>
      </div>
    </div>
  );
}
