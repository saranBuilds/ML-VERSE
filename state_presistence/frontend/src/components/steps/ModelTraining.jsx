import React, { useState } from 'react';
import { Play, Loader2, CheckCircle2 } from 'lucide-react';

export default function ModelTraining({ pipelineState, updateState }) {
  const [isTraining, setIsTraining] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const { trainingConfig } = pipelineState;

  const handleOptionChange = (key, value) => {
    updateState('trainingConfig', { ...trainingConfig, [key]: value });
  };

  const startTraining = () => {
    setIsTraining(true);
    setProgress(0);
    setIsComplete(false);
    
    // Simulate training progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsTraining(false);
          setIsComplete(true);
          return 100;
        }
        return prev + Math.floor(Math.random() * 10) + 2;
      });
    }, 400);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      <div className="glass-panel" style={{ padding: '28px' }}>
        <h3 style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '16px', marginBottom: '24px', color: 'var(--text-main)', fontSize: '1.25rem' }}>Train-Test Split & Configuration</h3>
        
        <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ flex: '1 1 300px' }}>
            <label className="form-label">Test Size (%)</label>
            <div className="form-hint" style={{ marginBottom: '16px' }}>Percentage of data to withhold for testing metrics.</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <input 
                type="range" 
                min="5" 
                max="50" 
                step="5"
                value={trainingConfig.testSize}
                onChange={(e) => handleOptionChange('testSize', parseInt(e.target.value))}
                style={{ flex: 1, accentColor: 'var(--accent-primary)', height: '6px' }}
              />
              <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent-primary)', minWidth: '40px' }}>
                {trainingConfig.testSize}%
              </span>
            </div>
          </div>

          <div className="form-group" style={{ flex: '1 1 200px' }}>
            <label className="form-label">Random State (Seed)</label>
            <div className="form-hint" style={{ marginBottom: '16px' }}>Ensures reproducible splits and initialization.</div>
            <input 
              type="number" 
              value={trainingConfig.randomState}
              onChange={(e) => handleOptionChange('randomState', parseInt(e.target.value))}
              style={{ maxWidth: '150px', fontSize: '1.1rem' }}
            />
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ 
        padding: '64px 32px', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        textAlign: 'center', 
        background: isComplete ? 'rgba(16, 185, 129, 0.05)' : 'var(--card-bg)', 
        borderColor: isComplete ? 'rgba(16, 185, 129, 0.3)' : 'var(--glass-border)', 
        transition: 'all 0.5s' 
      }}>
        
        {!isTraining && !isComplete ? (
          <>
            <Play size={64} color="var(--accent-primary)" style={{ marginBottom: '24px', opacity: 0.9 }} />
            <h3 style={{ fontSize: '1.75rem', marginBottom: '12px' }}>Ready to Train</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '32px', maxWidth: '450px', lineHeight: '1.6' }}>
              Initiate model fitting using the {pipelineState.model.replace('_', ' ')} algorithm with your configured data pipeline.
            </p>
            <button className="btn-primary" onClick={startTraining} style={{ padding: '16px 48px', fontSize: '1.1rem', borderRadius: '12px' }}>
              Start Training
            </button>
          </>
        ) : isTraining ? (
          <>
            <Loader2 size={64} color="var(--accent-primary)" className="pulse-active" style={{ marginBottom: '24px', animation: 'spin 2s linear infinite' }} />
            <h3 style={{ fontSize: '1.75rem', marginBottom: '12px' }}>Training Model...</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>
              Fitting {pipelineState.model.replace('_', ' ')} on {100 - trainingConfig.testSize}% of the dataset.
            </p>
            
            <div style={{ width: '100%', maxWidth: '500px', background: 'rgba(255,255,255,0.05)', height: '16px', borderRadius: '8px', overflow: 'hidden' }}>
              <div style={{ 
                height: '100%', 
                width: `${progress}%`, 
                background: 'var(--accent-gradient)', 
                transition: 'width 0.3s ease',
                boxShadow: '0 0 10px rgba(99, 102, 241, 0.5)'
              }} />
            </div>
            <div style={{ marginTop: '16px', fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>{Math.min(progress, 100)}%</div>
            <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
          </>
        ) : (
          <>
            <CheckCircle2 size={80} color="#10b981" style={{ marginBottom: '24px', animation: 'scaleIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }} />
            <h3 style={{ fontSize: '2rem', marginBottom: '12px', color: '#10b981' }}>Training Complete!</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
              Model successfully fitted. Proceed to the Evaluation step.
            </p>
            <style>{`@keyframes scaleIn { 0% { transform: scale(0); } 100% { transform: scale(1); } }`}</style>
          </>
        )}
      </div>

    </div>
  );
}
