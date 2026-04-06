import React, { useState } from 'react';
import { Play } from 'lucide-react';

export default function Linear({ onNext }) {
  const [fitIntercept, setFitIntercept] = useState(true);

  const handleNext = () => {
    onNext({
      fit_intercept: fitIntercept,
      n_jobs: -1
    });
  };

  return (
    <div className="space-y-6 pt-4 animate-in fade-in duration-300">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="checkbox" 
              checked={fitIntercept} 
              onChange={(e) => setFitIntercept(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
            />
            <span className="text-sm font-semibold text-slate-700">Calculate Intercept (fit_intercept)</span>
          </label>
          <p className="text-xs text-slate-500 mt-2 ml-6">Whether to calculate the y-intercept for this model. If set to false, no intercept will be used in calculations (useful if data is already centered).</p>
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
