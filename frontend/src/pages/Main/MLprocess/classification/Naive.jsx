import React, { useState } from 'react';
import { Play } from 'lucide-react';

export default function NaiveBayes({ onNext }) {
  const [varSmoothing, setVarSmoothing] = useState(1e-9);

  const handleNext = () => {
    onNext({
      var_smoothing: parseFloat(varSmoothing)
    });
  };

  return (
    <div className="space-y-6 pt-4 animate-in fade-in duration-300">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 col-span-2">
          <label className="block text-sm font-semibold text-slate-700 mb-1">Variance Smoothing</label>
          <input 
            type="number" 
            step="1e-12" 
            value={varSmoothing} 
            onChange={(e) => setVarSmoothing(e.target.value)}
            className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm"
          />
          <p className="text-xs text-slate-500 mt-2">Portion of the largest variance of all features that is added to variances for calculation stability.</p>
        </div>
      </div>

      <div className="flex justify-start">
        <button
          onClick={handleNext}
          className="flex items-center px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-all shadow-md shadow-indigo-500/20"
        >
          <Play className="w-4 h-4 mr-2" fill="currentColor" />
          Save & Proceed to Training
        </button>
      </div>
    </div>
  );
}
