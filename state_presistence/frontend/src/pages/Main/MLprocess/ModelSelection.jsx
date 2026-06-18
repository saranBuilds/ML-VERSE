import { useState, useEffect } from "react";
import { ChevronLeft, BrainCircuit, Target, SlidersHorizontal, Settings, LineChart as LineChartIcon, Loader2 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import api from "../../../api";

// Import Regression Models
import Linear from "./regression/linear";
import Ridge from "./regression/ridge";
import SVR from "./regression/svr";
import DecisionTree from "./regression/decisiontree";
import RandomForest from "./regression/randomforest";
import XGBoost from "./regression/xgboost";

// Import Classification Models
import Logistic from "./classification/Logsitic";
import NaiveBayes from "./classification/Naive";
import Knn from "./classification/Knn";
import DecisionTreeClf from "./classification/Decisiontree";
import RandomForestClf from "./classification/Randomforest";
import GradientBoost from "./classification/Gradientboost";
import XGBoostClf from "./classification/Xgboost";
import LightBoost from "./classification/Lightboost";
import CatBoost from "./classification/Catboost";
import Svc from "./classification/svc";

// Import Clustering Models
import Kmeans from "./clustering/Kmeans";
import Dbscan from "./clustering/Dbscan";
import Agglomerative from "./clustering/Agglomerative";
import Gmm from "./clustering/Gmm";

// Import Dimensionality Reduction Models
import Pca from "./dimensionality_reduction/Pca";
import Tsne from "./dimensionality_reduction/Tsne";
import TruncatedSvd from "./dimensionality_reduction/TruncatedSvd";

export default function ModelSelection({ category, type, onPrevStep, onNextStep }) {
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [targetColumn, setTargetColumn] = useState("");
  const [testSize, setTestSize] = useState(0.2);
  const [selectedModel, setSelectedModel] = useState("");
  
  const [elbowData, setElbowData] = useState([]);
  const [elbowLoading, setElbowLoading] = useState(false);
  const [elbowError, setElbowError] = useState("");

  const fetchElbowCurve = async () => {
    try {
      setElbowLoading(true);
      setElbowError("");
      const res = await api.post("/home/mlprocess/clustering/elbow");
      if (res.data.k_values && res.data.inertia) {
        const mappedData = res.data.k_values.map((k, i) => ({
          k,
          inertia: res.data.inertia[i]
        }));
        setElbowData(mappedData);
      }
    } catch (err) {
      console.error(err);
      setElbowError("Failed to fetch Elbow Method data.");
    } finally {
      setElbowLoading(false);
    }
  };  useEffect(() => {
    const fetchColumns = async () => {
      try {
        setLoading(true);
        const res = await api.post("/home/mlprocess/EDA");
        if (res.data.columns) {
          setColumns(res.data.columns);
          if (res.data.columns.length > 0) {
            setTargetColumn(res.data.columns[res.data.columns.length - 1]);
          }
        }
      } catch (err) {
        console.error("Failed to fetch columns:", err);
        setError("Could not load columns for target selection.");
      } finally {
        setLoading(false);
      }
    };
    fetchColumns();
  }, []);

  const REGRESSION_MODELS = [
    { id: "Linear", name: "Linear Regression" },
    { id: "Ridge", name: "Ridge Regression" },
    { id: "SVR", name: "Support Vector Regression" },
    { id: "DecisionTree", name: "Decision Tree" },
    { id: "RandomForest", name: "Random Forest" },
    { id: "XGBoost", name: "XGBoost" }
  ];

  const CLASSIFICATION_MODELS = [
    { id: "Logistic Regression", name: "Logistic Regression" },
    { id: "GaussianNB", name: "Naive Bayes (Gaussian)" },
    { id: "K-Nearest Neighbors", name: "K-Nearest Neighbors" },
    { id: "Decision Tree", name: "Decision Tree" },
    { id: "Random Forest", name: "Random Forest" },
    { id: "Gradient Boosting", name: "Gradient Boosting" },
    { id: "XGBoost", name: "XGBoost" },
    { id: "LightGBM", name: "LightGBM" },
    { id: "CatBoost", name: "CatBoost" },
    { id: "SVC", name: "SVC" }
  ];

  const CLUSTERING_MODELS = [
    { id: "K-Means", name: "K-Means" },
    { id: "DBSCAN", name: "DBSCAN" },
    { id: "Agglomerative Clustering", name: "Agglomerative Clustering" },
    { id: "Gaussian Mixture", name: "Gaussian Mixture" }
  ];

  const DIMENSIONALITY_REDUCTION_MODELS = [
    { id: "PCA", name: "PCA" },
    { id: "t-SNE", name: "t-SNE" },
    { id: "TruncatedSVD", name: "Truncated SVD" }
  ];

  const availableModels = type?.toLowerCase() === "regression" ? REGRESSION_MODELS : 
                          type?.toLowerCase() === "classification" ? CLASSIFICATION_MODELS :
                          type?.toLowerCase() === "clustering" ? CLUSTERING_MODELS :
                          type?.toLowerCase() === "dimensionality reduction" ? DIMENSIONALITY_REDUCTION_MODELS : [];

  const renderSelectedModel = () => {
    const props = { 
      targetColumn, 
      testSize,
      onNext: (params) => onNextStep({
        model_name: selectedModel,
        target_column: targetColumn,
        test_size: testSize,
        params,
        task_type: type
      })
    };
    
    if (type?.toLowerCase() !== "clustering" && type?.toLowerCase() !== "dimensionality reduction" && !targetColumn) {
      return <p className="text-slate-500 mt-4">Please select a target variable first.</p>;
    }

    switch (selectedModel) {
      // Regression specific
      case "Linear": return <Linear {...props} />;
      case "Ridge": return <Ridge {...props} />;
      case "SVR": return <SVR {...props} />;
      
      // Shared names (conditionally render based on type)
      case "DecisionTree": 
      case "Decision Tree": return type?.toLowerCase() === "regression" ? <DecisionTree {...props} /> : <DecisionTreeClf {...props} />;
      case "RandomForest":
      case "Random Forest": return type?.toLowerCase() === "regression" ? <RandomForest {...props} /> : <RandomForestClf {...props} />;
      case "XGBoost": return type?.toLowerCase() === "regression" ? <XGBoost {...props} /> : <XGBoostClf {...props} />;
      
      // Classification specific
      case "Logistic Regression": return <Logistic {...props} />;
      case "GaussianNB": return <NaiveBayes {...props} />;
      case "K-Nearest Neighbors": return <Knn {...props} />;
      case "Gradient Boosting": return <GradientBoost {...props} />;
      case "LightGBM": return <LightBoost {...props} />;
      case "CatBoost": return <CatBoost {...props} />;
      case "SVC": return <Svc {...props} />;
      
      // Clustering specific
      case "K-Means": return <Kmeans {...props} />;
      case "DBSCAN": return <Dbscan {...props} />;
      case "Agglomerative Clustering": return <Agglomerative {...props} />;
      case "Gaussian Mixture": return <Gmm {...props} />;
      
      // Dimensionality Reduction specific
      case "PCA": return <Pca {...props} />;
      case "t-SNE": return <Tsne {...props} />;
      case "TruncatedSVD": return <TruncatedSvd {...props} />;
      
      default:
        return (
          <div className="text-center py-10 bg-indigo-50/50 rounded-xl border border-indigo-100 border-dashed mt-4">
            <BrainCircuit className="w-12 h-12 text-indigo-300 mx-auto mb-3" />
            <p className="text-indigo-800 font-medium">Select an algorithm to configure</p>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-lg border border-slate-100">
        <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="mt-6 text-slate-500 font-medium animate-pulse">Initializing Modeling Workspace...</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-slate-100 mb-10 w-full animate-in fade-in zoom-in-95 duration-300">
      <div className="bg-gradient-to-r from-slate-900 to-indigo-900 p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-8 -mt-8 opacity-10">
          <BrainCircuit className="w-48 h-48" />
        </div>
        <h2 className="text-3xl font-bold mb-2 relative z-10 flex items-center">
          Model Selection & Configuration
        </h2>
        <p className="text-indigo-200 relative z-10 text-sm max-w-xl">
          Configure your modeling setup, choose an algorithm, and tune hyperparameters.
        </p>
      </div>

      <div className="p-8 space-y-8">
        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-100 font-medium text-sm">
            {error}
          </div>
        )}

        {/* Global Settings */}
        {type?.toLowerCase() !== "clustering" && type?.toLowerCase() !== "dimensionality reduction" && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <Target className="text-indigo-600 w-5 h-5" />
              <h3 className="text-lg font-bold text-slate-800">1. Modeling Configuration</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Target Variable (Y)</label>
                <select
                  value={targetColumn}
                  onChange={(e) => setTargetColumn(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm text-sm"
                >
                  <option value="">-- Select Target --</option>
                  {columns.map(col => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
                <p className="text-xs text-slate-500 mt-2">The metric or column you want to predict.</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Test Split Ratio</label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="0.1"
                    max="0.5"
                    step="0.05"
                    value={testSize}
                    onChange={(e) => setTestSize(parseFloat(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                  <span className="font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100 text-sm">
                    {Math.round(testSize * 100)}%
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-2">Percentage of data reserved for evaluation.</p>
              </div>
            </div>
          </div>
        )}

        {/* Algorithm Selection */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm relative">
          <div className="flex items-center gap-2 mb-6">
            <SlidersHorizontal className="text-indigo-600 w-5 h-5" />
            <h3 className="text-lg font-bold text-slate-800">{(type?.toLowerCase() === "clustering" || type?.toLowerCase() === "dimensionality reduction") ? "1. Select Algorithm" : "2. Select Algorithm"}</h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
            {availableModels.length > 0 ? availableModels.map(model => (
              <button
                key={model.id}
                onClick={() => {
                  setSelectedModel(model.id);
                  if (model.id === "K-Means" && elbowData.length === 0) {
                    fetchElbowCurve();
                  }
                }}
                className={`p-3 rounded-xl border text-sm font-semibold transition-all ${
                  selectedModel === model.id 
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20" 
                    : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50"
                }`}
              >
                {model.name}
              </button>
            )) : <p className="text-sm text-slate-500 col-span-3">No models available for the selected task type.</p>}
          </div>

          {type?.toLowerCase() === "clustering" && selectedModel === "K-Means" && (
            <div className="mb-8 border border-slate-200 rounded-xl p-6 bg-slate-50/50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <LineChartIcon className="text-indigo-600 w-5 h-5" />
                  <h3 className="text-lg font-bold text-slate-800">Elbow Method (Optimal K)</h3>
                </div>
                <button
                  onClick={fetchElbowCurve}
                  className="px-4 py-2 text-sm bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-lg border border-indigo-200 transition-colors flex items-center"
                >
                  {elbowLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  {elbowLoading ? "Calculating..." : "Recalculate"}
                </button>
              </div>
              
              {elbowError ? (
                <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm">{elbowError}</div>
              ) : elbowData.length > 0 ? (
                <div className="w-full h-64 mt-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={elbowData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="k" label={{ value: 'Number of clusters (K)', position: 'insideBottom', offset: -5 }} tick={{fill: '#64748b'}} />
                      <YAxis label={{ value: 'Inertia', angle: -90, position: 'insideLeft', offset: 10 }} tick={{fill: '#64748b'}} />
                      <RechartsTooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                      <Line type="monotone" dataKey="inertia" stroke="#4f46e5" strokeWidth={3} activeDot={{ r: 8, fill: "#4f46e5", stroke: "#fff", strokeWidth: 2 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : elbowLoading ? (
                <div className="flex items-center justify-center h-64 text-slate-400">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
              ) : (
                <p className="text-slate-500 text-sm">No elbow data available.</p>
              )}
            </div>
          )}

          <div className="border-t border-slate-100 pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Settings className="text-slate-400 w-4 h-4" />
              <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Hyperparameter Configuration</h4>
            </div>
            {renderSelectedModel()}
          </div>
        </div>
      </div>

      <div className="px-8 py-5 border-t border-slate-100 bg-slate-50 flex justify-between">
        <button
          onClick={onPrevStep}
          className="flex items-center px-6 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl font-medium shadow-sm transition-all hover:-translate-y-0.5"
        >
          <ChevronLeft className="w-5 h-5 mr-1" /> Back to Setup
        </button>
      </div>
    </div>
  );
}
