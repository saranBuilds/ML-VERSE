import { useState, useEffect } from "react";
import { ChevronRight, ChevronLeft, Trash2, AlertCircle, CheckCircle2, RefreshCw } from "lucide-react";
import api from "../../../api";

export default function DataCleaning({ onNextStep, onPrevStep }) {
  const [columns, setColumns] = useState([]);
  const [selectedForRemoval, setSelectedForRemoval] = useState([]);
  const [removing, setRemoving] = useState(false);
  const [removeSuccess, setRemoveSuccess] = useState("");
  
  const [missingColumns, setMissingColumns] = useState([]);
  const [checkingMissing, setCheckingMissing] = useState(false);
  const [strategies, setStrategies] = useState({});
  const [applyingStrategies, setApplyingStrategies] = useState(false);
  const [missingSuccess, setMissingSuccess] = useState("");
  const [noMissingFound, setNoMissingFound] = useState(false);

  useEffect(() => {
    // Load initial columns from session storage
    const storedCols = JSON.parse(sessionStorage.getItem("columns") || "[]");
    setColumns(storedCols);
    checkMissingValues(); // Automatically check on mount
  }, []);

  const handleCheckboxChange = (col) => {
    setSelectedForRemoval(prev => 
      prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col]
    );
  };

  const applyRemoveColumns = async () => {
    if (selectedForRemoval.length === 0) return;
    try {
      setRemoving(true);
      setRemoveSuccess("");
      await api.post("/home/mlprocess/DataCleaning/remove_columns", {
        remove_col: selectedForRemoval
      });
      setRemoveSuccess(`Successfully removed ${selectedForRemoval.length} columns.`);
      
      // Update local state
      const newCols = columns.filter(c => !selectedForRemoval.includes(c));
      setColumns(newCols);
      sessionStorage.setItem("columns", JSON.stringify(newCols));
      setSelectedForRemoval([]);
      
      // Re-evaluate missing values after removing columns
      checkMissingValues();
    } catch (err) {
      console.error(err);
      alert("Error removing columns");
    } finally {
      setRemoving(false);
    }
  };

  const checkMissingValues = async () => {
    try {
      setCheckingMissing(true);
      setNoMissingFound(false);
      setMissingSuccess("");
      
      const res = await api.post("/home/mlprocess/DataCleaning/checking_missing_values");
      
      if (res.data.missing_columns && res.data.missing_columns.length > 0) {
        setMissingColumns(res.data.missing_columns);
        
        // Setup defaults (mean for numeric, mode for categorical)
        const initialStrategies = {};
        res.data.missing_columns.forEach(col => {
          initialStrategies[col.name] = col.type === "numeric" ? "mean" : "mode";
        });
        setStrategies(initialStrategies);
      } else {
        setMissingColumns([]);
        setNoMissingFound(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCheckingMissing(false);
    }
  };

  const handleStrategyChange = (colName, strategy) => {
    setStrategies(prev => ({ ...prev, [colName]: strategy }));
  };

  const applyMissingStrategies = async () => {
    if (Object.keys(strategies).length === 0) return;
    try {
      setApplyingStrategies(true);
      setMissingSuccess("");
      await api.post("/home/mlprocess/DataCleaning/apply_missing_strategy", {
        missing_value_strategy: strategies
      });
      setMissingSuccess("Successfully applied missing value strategies!");
      setMissingColumns([]); // Clear them since they are handled
    } catch (err) {
      console.error(err);
      alert("Error applying missing value strategies");
    } finally {
      setApplyingStrategies(false);
    }
  };

  return (
    <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100 mb-10 w-full animate-in fade-in zoom-in-95 duration-300">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-900 to-teal-800 p-8 text-white relative overflow-hidden">
        <h2 className="text-3xl font-bold mb-2 relative z-10">
          Data Cleaning
        </h2>
        <p className="text-teal-100 relative z-10 text-sm max-w-xl">
          Prepare your dataset for analysis. You can remove unnecessary columns and handle missing values in this step.
        </p>
      </div>

      <div className="p-8 space-y-10">
        
        {/* Section 1: Remove Columns */}
        <div className="p-6 bg-slate-50 border border-gray-200 rounded-xl">
          <div className="flex items-center gap-2 mb-4">
            <Trash2 className="text-rose-500 w-5 h-5" />
            <h3 className="text-lg font-bold text-slate-800">Remove Columns</h3>
          </div>
          <p className="text-sm text-gray-500 mb-4">Select any columns that are irrelevant to your machine learning task and drop them.</p>
          
          <div className="max-h-48 overflow-y-auto mb-4 border border-gray-200 rounded-lg p-2 bg-white">
            {columns.map(col => (
              <label key={col} className="flex items-center p-2 hover:bg-slate-50 cursor-pointer rounded">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-3"
                  checked={selectedForRemoval.includes(col)}
                  onChange={() => handleCheckboxChange(col)}
                />
                <span className="text-sm text-gray-700">{col}</span>
              </label>
            ))}
            {columns.length === 0 && <p className="p-2 text-sm text-gray-500 text-center">No columns available.</p>}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500 font-medium tracking-wide">
              {selectedForRemoval.length} selected
            </span>
            <button
              onClick={applyRemoveColumns}
              disabled={selectedForRemoval.length === 0 || removing}
              className="flex items-center px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 disabled:cursor-not-allowed text-white rounded-lg font-medium shadow-sm transition-all"
            >
              {removing ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              Drop Selected Columns
            </button>
          </div>
          
          {removeSuccess && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center text-sm">
              <CheckCircle2 className="w-4 h-4 mr-2" /> {removeSuccess}
            </div>
          )}
        </div>

        {/* Section 2: Missing Values */}
        <div className="p-6 bg-slate-50 border border-gray-200 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="text-amber-500 w-5 h-5" />
              <h3 className="text-lg font-bold text-slate-800">Handle Missing Values</h3>
            </div>
            <button 
              onClick={checkMissingValues} 
              disabled={checkingMissing}
              className="text-sm flex items-center text-blue-600 hover:text-blue-800 font-medium px-3 py-1 bg-blue-50 rounded-md"
            >
              <RefreshCw className={`w-3 h-3 mr-1 ${checkingMissing ? "animate-spin" : ""}`} /> 
              Re-check
            </button>
          </div>
          <p className="text-sm text-gray-500 mb-6">Choose how to fill missing data for each impacted column.</p>

          {checkingMissing && missingColumns.length === 0 ? (
            <div className="py-8 flex justify-center">
              <RefreshCw className="w-6 h-6 text-gray-400 animate-spin" />
            </div>
          ) : noMissingFound && missingColumns.length === 0 ? (
            <div className="bg-green-50/50 border border-green-200 p-6 rounded-xl flex flex-col items-center justify-center text-center">
              <CheckCircle2 className="w-8 h-8 text-green-500 mb-2" />
              <p className="font-semibold text-green-800">No missing values found!</p>
              <p className="text-sm text-green-600/80">Your dataset does not have any missing fields.</p>
            </div>
          ) : missingColumns.length > 0 ? (
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-100 border-b border-gray-200 text-gray-700">
                    <tr>
                      <th className="px-5 py-3 font-semibold">Column Name</th>
                      <th className="px-5 py-3 font-semibold">Data Type</th>
                      <th className="px-5 py-3 font-semibold">Strategy</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {missingColumns.map(col => (
                      <tr key={col.name} className="hover:bg-slate-50">
                        <td className="px-5 py-3 font-medium text-slate-700">{col.name}</td>
                        <td className="px-5 py-3">
                          <span className={`px-2 py-1 text-xs rounded-md ${col.type === "numeric" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"}`}>
                            {col.type}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <select 
                            value={strategies[col.name]} 
                            onChange={(e) => handleStrategyChange(col.name, e.target.value)}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 outline-none"
                          >
                            <option value="drop">Drop Rows</option>
                            <option value="mode">Mode (Most Frequent)</option>
                            {col.type === "numeric" && (
                              <>
                                <option value="mean">Mean (Average)</option>
                                <option value="median">Median (Middle Value)</option>
                              </>
                            )}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="flex justify-end pt-2">
                <button
                  onClick={applyMissingStrategies}
                  disabled={applyingStrategies}
                  className="flex items-center px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white rounded-lg font-medium shadow-sm transition-all"
                >
                  {applyingStrategies ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                  Apply Strategies
                </button>
              </div>
            </div>
          ) : null}

          {missingSuccess && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center text-sm">
              <CheckCircle2 className="w-4 h-4 mr-2" /> {missingSuccess}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-8 py-5 border-t border-gray-100 bg-gray-50 flex justify-between">
        <button
          onClick={onPrevStep}
          className="flex items-center px-6 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl font-medium shadow-sm transition-all hover:-translate-y-0.5"
        >
          <ChevronLeft className="w-5 h-5 mr-1" /> Back
        </button>
        <button
          onClick={onNextStep}
          className="flex items-center px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-md shadow-blue-500/20 transition-all hover:-translate-y-0.5"
        >
          Next Step: EDA <ChevronRight className="w-5 h-5 ml-1" />
        </button>
      </div>
    </div>
  );
}
