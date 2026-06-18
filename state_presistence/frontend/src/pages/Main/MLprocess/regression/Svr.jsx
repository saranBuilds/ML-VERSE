import React, { useState } from 'react';
import { Play } from 'lucide-react';

export default function SVR({ onNext }) {
  const [kernel, setKernel] = useState('rbf');
  const [C, setC] = useState(1.0);
  const [epsilon, setEpsilon] = useState(0.1);

  const handleNext = () => {
    onNext({
      kernel: kernel,
      C: parseFloat(C) || 1.0,
      epsilon: parseFloat(epsilon) || 0.1
    });
  };

  return (
    <div className="space-y-6 pt-4 animate-in fade-in duration-300">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <label className="block text-sm font-semibold text-slate-700 mb-1">Kernel</label>
          <select 
            value={kernel} 
            onChange={(e) => setKernel(e.target.value)}
            className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm text-sm"
          >
            <option value="linear">Linear</option>
            <option value="poly">Polynomial</option>
            <option value="rbf">RBF</option>
            <option value="sigmoid">Sigmoid</option>
          </select>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <label className="block text-sm font-semibold text-slate-700 mb-1">Regularization (C)</label>
          <input 
            type="number" 
            step="0.1"
            value={C} 
            onChange={(e) => setC(e.target.value)}
            className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm text-sm"
          />
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <label className="block text-sm font-semibold text-slate-700 mb-1">Epsilon</label>
          <input 
            type="number" 
            step="0.01"
            value={epsilon} 
            onChange={(e) => setEpsilon(e.target.value)}
            className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm text-sm"
          />
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
