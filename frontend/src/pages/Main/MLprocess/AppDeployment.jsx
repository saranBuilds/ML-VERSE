import React, { useState } from 'react';
import { ChevronLeft, Zap, Box, Server, Activity } from 'lucide-react';
import api from '../../../api';

export default function AppDeployment({ result, onPrevStep }) {
  const [formData, setFormData] = useState({});
  const [prediction, setPrediction] = useState(null);
  const [isClassification, setIsClassification] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!result || !result.feature_columns) {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-xl text-center border border-slate-100 mb-10">
        <p className="text-slate-500">Deployment data not found. Please train a model first.</p>
        <button onClick={onPrevStep} className="mt-4 text-indigo-600 font-semibold underline">
          Go Back
        </button>
      </div>
    );
  }

  const handleInputChange = (col, value) => {
    setFormData(prev => ({
      ...prev,
      [col]: value
    }));
  };

  const handlePredict = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setPrediction(null);

    try {
      const res = await api.post('/home/mlprocess/predict', {
        features: formData
      });

      setPrediction(res.data.prediction);
      setIsClassification(res.data.is_classification);

    } catch (err) {
      setError(err.response?.data?.error || "Prediction failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-slate-100 mb-10 w-full animate-in fade-in zoom-in-95 duration-300">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-900 to-blue-900 p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-8 -mt-8 opacity-10">
          <Server className="w-48 h-48" />
        </div>
        <h2 className="text-3xl font-bold mb-2">App Deployment</h2>
        <p className="text-indigo-100 text-sm max-w-xl">
          Test your deployed model in real-time.
        </p>
      </div>

      <div className="p-8 space-y-8">

        {/* Model Info */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800">
            Active Model: <span className="text-indigo-600 ml-1">{result.model_name}</span>
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* Input Form */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h4 className="font-bold mb-4 flex items-center">
              <Activity className="w-4 h-4 mr-2 text-indigo-500" /> Input Features
            </h4>

            <form onSubmit={handlePredict} className="space-y-4">
              {result.feature_columns.map((col) => (
                <div key={col}>
                  <label className="block text-sm font-semibold mb-1">{col}</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={formData[col] || ''}
                    onChange={(e) => handleInputChange(col, e.target.value)}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
              ))}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-indigo-600 text-white rounded-xl mt-4"
              >
                {loading ? "Predicting..." : "Generate Prediction"}
              </button>
            </form>
          </div>

          {/* Prediction Result */}
          <div className="flex flex-col justify-center items-center bg-slate-50 rounded-xl p-6">
            {error ? (
              <div className="text-red-500">{error}</div>
            ) : prediction !== null ? (
              <div className="text-center">
                <p className="text-sm text-indigo-500 mb-2">Predicted Value</p>

                <div className="text-4xl font-bold">
                  {typeof prediction === 'number'
                    ? isClassification
                      ? prediction.toFixed(0)
                      : prediction.toFixed(4)
                    : prediction}
                </div>
              </div>
            ) : (
              <p className="text-slate-400">Waiting for input...</p>
            )}
          </div>

        </div>
      </div>

      {/* Footer */}
      <div className="px-8 py-5 border-t bg-slate-50">
        <button
          onClick={onPrevStep}
          className="flex items-center px-6 py-2 bg-white border rounded-xl"
        >
          <ChevronLeft className="w-5 h-5 mr-1" /> Back
        </button>
      </div>
    </div>
  );
}