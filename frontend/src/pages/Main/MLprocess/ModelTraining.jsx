import React, { useState } from 'react';
import { ChevronLeft, Play, Activity, CheckCircle, BrainCircuit, Download, ArrowRight } from 'lucide-react';
import api from '../../../api';

export default function ModelTraining({ config, onPrevStep, onNextStep }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleTrain = async () => {
    try {
      setLoading(true);
      setError('');
      setResult(null);
      const endpoint = config.task_type?.toLowerCase() === "classification" 
                       ? "/home/mlprocess/classification" 
                       : "/home/mlprocess/regression";
      const res = await api.post(endpoint, config);
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Training failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (type) => {
    try {
      const endpoint = type === 'model' ? '/home/mlprocess/download_model' : '/home/mlprocess/download_dataset';
      const response = await api.get(endpoint, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const extension = type === 'model' ? 'pkl' : 'csv';
      link.setAttribute('download', `${type}.${extension}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      console.error("Download failed", err);
    }
  };

  if (!config) {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-xl text-center border border-slate-100 mb-10">
        <p className="text-slate-500">No configuration found. Please return to the previous step.</p>
        <button onClick={onPrevStep} className="mt-4 text-indigo-600 font-semibold underline">Go Back</button>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-slate-100 mb-10 w-full animate-in fade-in zoom-in-95 duration-300">
      <div className="bg-gradient-to-r from-emerald-900 to-teal-900 p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-8 -mt-8 opacity-10">
          <Activity className="w-48 h-48" />
        </div>
        <h2 className="text-3xl font-bold mb-2 relative z-10 flex items-center">
          Model Training & Results
        </h2>
        <p className="text-emerald-100 relative z-10 text-sm max-w-xl">
          Review your configuration and start the training process to evaluate the model's performance.
        </p>
      </div>

      <div className="p-8 space-y-8">
        {/* Configuration Summary */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 shadow-sm relative">
          <div className="flex items-center gap-2 mb-6">
            <CheckCircle className="text-teal-600 w-5 h-5" />
            <h3 className="text-lg font-bold text-slate-800">Configuration Summary</h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
              <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Model</span>
              <span className="text-sm font-bold text-slate-800">{config.model_name}</span>
            </div>
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
              <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Target</span>
              <span className="text-sm font-bold text-slate-800">{config.target_column}</span>
            </div>
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
              <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Test Split</span>
              <span className="text-sm font-bold text-slate-800">{Math.round(config.test_size * 100)}%</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
             <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Hyperparameters</span>
             <div className="flex flex-wrap gap-2">
               {Object.entries(config.params).map(([key, value]) => (
                 <div key={key} className="bg-slate-100 px-3 py-1.5 rounded-md border border-slate-200 text-sm font-medium text-slate-700">
                   <span className="text-slate-500 mr-2">{key}:</span> 
                   {typeof value === 'boolean' ? (value ? 'True' : 'False') : value}
                 </div>
               ))}
             </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-center border-t border-slate-100 pt-8">
          <button
            onClick={handleTrain}
            disabled={loading}
            className="flex items-center px-10 py-4 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white font-bold rounded-xl transition-all shadow-lg shadow-teal-500/30 text-lg hover:-translate-y-1"
          >
            {loading ? (
              <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin mr-3" />
            ) : (
              <Play className="w-6 h-6 mr-3" fill="currentColor" />
            )}
            {loading ? "Training Model..." : "Confirm & Start Training"}
          </button>
        </div>

        {/* Error Message */}
        {error && (
            <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium animate-in fade-in">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    {error}
                </div>
            </div>
        )}

        {/* Results */}
        {result && (
          <div className="mt-8 p-8 border border-emerald-200 bg-emerald-50/50 rounded-2xl relative overflow-hidden shadow-inner animate-in slide-in-from-bottom-4 fade-in duration-500">
            <div className="absolute top-0 right-0 p-6 opacity-5">
              <BrainCircuit className="w-32 h-32 text-emerald-800" />
            </div>
            <h4 className="text-emerald-900 text-xl font-black mb-6 flex items-center">
              <div className="w-3 h-3 rounded-full bg-emerald-500 mr-3 shadow-sm shadow-emerald-500/50" />
              Training Complete!
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-10">
              {result.accuracy !== undefined ? (
                <>
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-emerald-100 hover:border-emerald-300 transition-colors">
                    <span className="block text-sm font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                      Accuracy
                      <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full normal-case">Higher is better</span>
                    </span>
                    <span className="text-4xl font-black text-slate-800 tracking-tight">{(result.accuracy * 100).toFixed(2)}%</span>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-emerald-100 hover:border-emerald-300 transition-colors">
                    <span className="block text-sm font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                      F1 Score
                      <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full normal-case">Higher is better</span>
                    </span>
                    <span className="text-4xl font-black text-slate-800 tracking-tight">{result.f1_score.toFixed(4)}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-emerald-100 hover:border-emerald-300 transition-colors">
                    <span className="block text-sm font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                      R² Score
                      <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full normal-case">Higher is better</span>
                    </span>
                    <span className="text-4xl font-black text-slate-800 tracking-tight">{result.r2_score}</span>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-emerald-100 hover:border-emerald-300 transition-colors">
                    <span className="block text-sm font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                      RMSE
                      <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full normal-case">Lower is better</span>
                    </span>
                    <span className="text-4xl font-black text-slate-800 tracking-tight">{result.rmse}</span>
                  </div>
                </>
              )}
            </div>
            
            {/* Download Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 relative z-10 border-t border-emerald-100 pt-6">
              <button 
                onClick={() => handleDownload('model')}
                className="flex items-center px-4 py-2 bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-50 rounded-lg shadow-sm font-semibold transition-colors w-full sm:w-auto justify-center"
              >
                <Download className="w-4 h-4 mr-2" /> Download Model (.pkl)
              </button>
              <button 
                onClick={() => handleDownload('dataset')}
                className="flex items-center px-4 py-2 bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-50 rounded-lg shadow-sm font-semibold transition-colors w-full sm:w-auto justify-center"
              >
                <Download className="w-4 h-4 mr-2" /> Download Dataset (.csv)
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="px-8 py-5 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
        <button
          onClick={onPrevStep}
          className="flex items-center px-6 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl font-medium shadow-sm transition-all hover:-translate-y-0.5"
        >
          <ChevronLeft className="w-5 h-5 mr-1" /> Back to Configuration
        </button>
        {result && onNextStep && (
          <button
            onClick={() => onNextStep(result)}
            className="flex items-center px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium shadow-sm transition-all hover:-translate-y-0.5"
          >
            Deploy App <ArrowRight className="w-5 h-5 ml-2" />
          </button>
        )}
      </div>
    </div>
  );
}
