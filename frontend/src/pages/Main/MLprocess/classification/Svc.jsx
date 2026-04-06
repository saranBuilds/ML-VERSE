import React, { useState } from 'react';
import { Play } from 'lucide-react';

export default function Svc({ onNext }) {
  const [C, setC] = useState(1.0);
  const [kernel, setKernel] = useState('rbf');
  const [gamma, setGamma] = useState('scale');

  const handleNext = () => {
    onNext({
      C: parseFloat(C),
      kernel,
      gamma,
      probability: true,
      random_state: 42
    });
  };

  return (
    <div className="space-y-6 pt-4 animate-in fade-in duration-300 text-left">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <label className="block text-sm font-semibold text-slate-700 mb-1">C (Regularization Parameter)</label>
          <input 
            type="number" 
            step="0.1"
            value={C} 
            onChange={(e) => setC(e.target.value)}
            className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm"
          />
          <p className="text-xs text-slate-500 mt-2">The strength of the regularization is inversely proportional to C.</p>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <label className="block text-sm font-semibold text-slate-700 mb-1">Kernel</label>
          <select 
            value={kernel} 
            onChange={(e) => setKernel(e.target.value)}
            className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm"
          >
            <option value="rbf">RBF</option>
            <option value="linear">Linear</option>
            <option value="poly">Poly</option>
            <option value="sigmoid">Sigmoid</option>
          </select>
          <p className="text-xs text-slate-500 mt-2">Specifies the kernel type to be used in the algorithm.</p>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 col-span-2">
          <label className="block text-sm font-semibold text-slate-700 mb-1">Gamma</label>
          <select 
            value={gamma} 
            onChange={(e) => setGamma(e.target.value)}
            className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm"
          >
            <option value="scale">Scale</option>
            <option value="auto">Auto</option>
          </select>
          <p className="text-xs text-slate-500 mt-2">Kernel coefficient for 'rbf', 'poly' and 'sigmoid'.</p>
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
