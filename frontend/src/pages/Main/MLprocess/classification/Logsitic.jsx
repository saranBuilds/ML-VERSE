import React, { useState } from 'react';
import { Play } from 'lucide-react';

export default function Logistic({ onNext }) {
  const [penalty, setPenalty] = useState('l2');
  const [C, setC] = useState(1.0);
  const [solver, setSolver] = useState('lbfgs');
  const [maxIter, setMaxIter] = useState(1000);

  const handleNext = () => {
    onNext({
      penalty,
      C: parseFloat(C),
      solver,
      max_iter: parseInt(maxIter),
      random_state: 42
    });
  };

  return (
    <div className="space-y-6 pt-4 animate-in fade-in duration-300">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <label className="block text-sm font-semibold text-slate-700 mb-1">Penalty</label>
          <select 
            value={penalty} 
            onChange={(e) => setPenalty(e.target.value)}
            className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm"
          >
            <option value="l2">L2 (Ridge)</option>
            <option value="l1">L1 (Lasso)</option>
            <option value="elasticnet">ElasticNet</option>
            <option value="none">None</option>
          </select>
          <p className="text-xs text-slate-500 mt-2">Specifies the norm used in the penalization.</p>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <label className="block text-sm font-semibold text-slate-700 mb-1">C (Regularization Strength)</label>
          <input 
            type="number" 
            step="0.1" 
            min="0.1"
            value={C} 
            onChange={(e) => setC(e.target.value)}
            className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm"
          />
          <p className="text-xs text-slate-500 mt-2">Smaller values specify stronger regularization.</p>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <label className="block text-sm font-semibold text-slate-700 mb-1">Solver</label>
          <select 
            value={solver} 
            onChange={(e) => setSolver(e.target.value)}
            className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm"
          >
            <option value="lbfgs">lbfgs</option>
            <option value="liblinear">liblinear</option>
            <option value="newton-cg">newton-cg</option>
            <option value="sag">sag</option>
            <option value="saga">saga</option>
          </select>
          <p className="text-xs text-slate-500 mt-2">Algorithm to use in the optimization problem.</p>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <label className="block text-sm font-semibold text-slate-700 mb-1">Max Iterations</label>
          <input 
            type="number" 
            value={maxIter} 
            onChange={(e) => setMaxIter(e.target.value)}
            className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm"
          />
          <p className="text-xs text-slate-500 mt-2">Maximum number of iterations taken for the solvers to converge.</p>
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
