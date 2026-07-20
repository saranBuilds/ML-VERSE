import { useState, useEffect, useCallback } from "react"
import api from "../../../api"
import { ChevronLeft, FolderOpen, Loader2 } from "lucide-react"
import MLWorkflowHeader from "./MLWorkflowHeader"
import Category from "./temp"
import DatasetUpload from "./DatasetUpload"
import DatasetPreview from "./DatasetPreview"
import DataCleaning from "./DataCleaning"
import Eda from "./Eda"
import FeatureEngineering from "./FeatureEngineering"
import ModelSelection from "./ModelSelection"
import ModelTraining from "./ModelTraining"
import AppDeployment from "./AppDeployment"
import "../Workspace/workspace.css"

// ─── Step name → numeric index mapping (mirrors backend STEP_TO_INDEX) ───────
const STEP_INDEX_MAP = {
  dataset_upload:      1,
  eda:                 4,
  missing_values:      3,
  encoding:            5,
  scaling:             5,
  feature_engineering: 5,
  model_selection:     6,
  model_training:      7,
}

// ─── Numeric index → canonical step name (for persistence on navigation) ─────
const INDEX_TO_STEP = {
  1: "dataset_upload",
  2: "eda",            // preview → still counts as having reached eda
  3: "missing_values",
  4: "eda",
  5: "encoding",
  6: "model_selection",
  7: "model_training",
}

const MLprocess = ({ workspace, onBack, initialStep, initialCategory, initialType, initialPipeline }) => {
  const [category, setCategory] = useState(initialCategory ?? "")
  const [type, setType] = useState(initialType ?? "")
  const [activeStep, setActiveStep] = useState(initialStep ?? 0)
  const [file, setFile] = useState(null)
  const [trainingConfig, setTrainingConfig] = useState(null)
  const [trainingResult, setTrainingResult] = useState(null)
  const [isRebuilding, setIsRebuilding] = useState(false)

  // Derive saved pipeline slices (safe defaults when no pipeline is restored)
  const savedRemovedCols     = initialPipeline?.remove_columns   ?? []
  const savedMissingStrategy = initialPipeline?.missing_values   ?? {}
  const savedEncodingStrategy = initialPipeline?.encoding        ?? {}
  const savedScalingStrategy  = initialPipeline?.scaling         ?? {}
  const savedTargetColumn    = initialPipeline?.target_column    ?? ""

  // ─── Persist current_step to MongoDB whenever user navigates forward ─────────
  const persistStep = useCallback((numericStep) => {
    const stepName = INDEX_TO_STEP[numericStep]
    if (!stepName || !workspace?.workspace_id) return
    api.post(`/home/workspace/update_step/${workspace.workspace_id}`, { step: stepName })
      .catch((err) => console.warn("[persistStep] failed to save step:", err))
  }, [workspace?.workspace_id])

  // Helper: go to a step AND persist it
  const goToStep = useCallback((step) => {
    setActiveStep(step)
    persistStep(step)
  }, [persistStep])

  // Helper: go back to a step AND rebuild the pipeline up to that step
  const goBackToStep = useCallback(async (numericStep, targetStepName) => {
    if (!workspace?.workspace_id) {
      setActiveStep(numericStep)
      return
    }
    try {
      setIsRebuilding(true)
      const res = await api.post(`/home/workspace/rebuild/${workspace.workspace_id}`, {
        target_step: targetStepName
      })
      const { columns, active_step } = res.data
      if (columns) {
        sessionStorage.setItem("columns", JSON.stringify(columns))
      }
      if (numericStep < 7) {
        setTrainingConfig(null)
      }
      if (numericStep < 8) {
        setTrainingResult(null)
      }
      setActiveStep(active_step ?? numericStep)
    } catch (err) {
      console.error("[goBackToStep] failed:", err)
      alert("Error going back and rebuilding pipeline. Please try again.")
    } finally {
      setIsRebuilding(false)
    }
  }, [workspace?.workspace_id])


  // When the parent provides initialStep (from workspace continue), apply it
  useEffect(() => {
    if (initialStep !== undefined && initialStep !== null) {
      setActiveStep(initialStep)
    }
  }, [initialStep])

  // When the parent provides restored category/type (from workspace continue), apply them
  useEffect(() => {
    if (initialCategory) setCategory(initialCategory)
    if (initialType)     setType(initialType)
  }, [initialCategory, initialType])

  const handleCategoryChange = (value) => {
    setCategory(value)
    setType("")
    setActiveStep(0)
  }

  const handleTypeChange = (value) => {
    setType(value)
    goToStep(1) // move to upload step
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">

      {/* Workspace context bar */}
      {workspace && (
        <div className="w-full px-4 pt-4">
          <div className="max-w-6xl mx-auto">
            <div className="ws-context-bar">
              <button
                id="mlprocess-back-btn"
                className="ws-context-bar__back"
                onClick={onBack}
                title="Back to workspaces"
              >
                <ChevronLeft size={14} />
                Workspaces
              </button>
              <FolderOpen size={15} style={{ color: "#6366f1" }} />
              <span className="ws-context-bar__name">{workspace.workspace_name}</span>
              <span className="ws-context-bar__id">{workspace.workspace_id}</span>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="w-full px-4 pt-4">
        <div className="max-w-6xl mx-auto">
          <MLWorkflowHeader activeStep={activeStep} />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex justify-center mt-10 px-4">
        <div className={`w-full ${activeStep >= 2 ? 'max-w-6xl' : 'max-w-lg'}`}>

          {/* Step 0 → Category */}
          {activeStep === 0 && (
            <Category
              category={category}
              setCategory={handleCategoryChange}
              type={type}
              setType={handleTypeChange}
              workspaceId={workspace?.workspace_id}
            />
          )}

          {/* Step 1 → Dataset Upload */}
          {activeStep === 1 && (
            <DatasetUpload
              setFile={setFile}
              onUploadSuccess={() => goToStep(2)}
              onPrevStep={() => setActiveStep(0)}
              workspaceId={workspace?.workspace_id}
            />
          )}

          {/* Step 2 → Dataset Preview */}
          {activeStep === 2 && (
            <DatasetPreview
              onNextStep={() => goToStep(3)}
              onPrevStep={() => setActiveStep(1)}
            />
          )}

          {/* Step 3 → Data Cleaning */}
          {activeStep === 3 && (
            <DataCleaning
              onNextStep={() => goToStep(4)}
              onPrevStep={() => goBackToStep(2, "eda")}
              savedRemovedCols={savedRemovedCols}
              savedMissingStrategy={savedMissingStrategy}
            />
          )}

          {/* Step 4 → Exploratory Data Analysis (EDA) */}
          {activeStep === 4 && (
            <Eda
              onNextStep={() => goToStep(5)}
              onPrevStep={() => goBackToStep(3, "missing_values")}
            />
          )}

          {/* Step 5 → Feature Engineering */}
          {activeStep === 5 && (
            <FeatureEngineering
              onNextStep={() => goToStep(6)}
              onPrevStep={() => goBackToStep(4, "eda")}
              savedEncodingStrategy={savedEncodingStrategy}
              savedScalingStrategy={savedScalingStrategy}
            />
          )}

          {/* Step 6 → Model Selection */}
          {activeStep === 6 && (
            <ModelSelection
              category={category}
              type={type}
              savedTargetColumn={savedTargetColumn}
              onPrevStep={() => goBackToStep(5, "encoding")}
              onNextStep={(config) => {
                setTrainingConfig(config)
                goToStep(7)
              }}
            />
          )}

          {/* Step 7 → Model Training */}
          {activeStep === 7 && (
            <ModelTraining
              config={trainingConfig}
              onPrevStep={() => goBackToStep(6, "model_selection")}
              onNextStep={(result) => {
                setTrainingResult(result)
                goToStep(8)
              }}
            />
          )}

          {/* Step 8 → App Deployment */}
          {activeStep === 8 && (
            <AppDeployment
              result={trainingResult}
              onPrevStep={() => goBackToStep(7, "model_training")}
            />
          )}

        </div>
      </div>

      {isRebuilding && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center text-white">
          <Loader2 className="w-12 h-12 text-blue-400 animate-spin mb-4" />
          <p className="text-lg font-semibold animate-pulse">Rebuilding Pipeline State...</p>
          <p className="text-sm text-slate-300 mt-2">Restoring dataset to previous stage</p>
        </div>
      )}

    </div>
  )
}

export default MLprocess