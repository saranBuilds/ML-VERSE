import React, { useState } from 'react';
import { Play } from 'lucide-react';

export default function Ridge({ onNext }) {
  const [alpha, setAlpha] = useState(1.0);
  const [solver, setSolver] = useState('auto');

  const handleNext = () => {
    onNext({
      alpha: parseFloat(alpha) || 1.0,
      solver: solver,
      random_state: 42
    });
  };

  return (
    <div className="space-y-6 pt-4 animate-in fade-in duration-300">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <label className="block text-sm font-semibold text-slate-700 mb-1">Alpha (Regularization Strength)</label>
          <input 
            type="number" 
            step="0.1"
            value={alpha} 
            onChange={(e) => setAlpha(e.target.value)}
            className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm text-sm"
          />
          <p className="text-xs text-slate-500 mt-2">Constant that multiplies the L2 penalty term. Larger values specify stronger regularization.</p>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <label className="block text-sm font-semibold text-slate-700 mb-1">Solver</label>
          <select 
            value={solver} 
            onChange={(e) => setSolver(e.target.value)}
            className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm text-sm"
          >
            <option value="auto">auto</option>
            <option value="svd">svd</option>
            <option value="cholesky">cholesky</option>
            <option value="lsqr">lsqr</option>
            <option value="sparse_cg">sparse_cg</option>
            <option value="sag">sag</option>
            <option value="saga">saga</option>
          </select>
          <p className="text-xs text-slate-500 mt-2">Algorithm to use in the optimization problem.</p>
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
