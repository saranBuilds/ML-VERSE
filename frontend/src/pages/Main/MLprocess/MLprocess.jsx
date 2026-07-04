import { useState, useEffect } from "react"
import { ChevronLeft, FolderOpen } from "lucide-react"
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

const MLprocess = ({ workspace, onBack, initialStep, initialCategory, initialType, initialPipeline }) => {
  const [category, setCategory] = useState(initialCategory ?? "")
  const [type, setType] = useState(initialType ?? "")
  const [activeStep, setActiveStep] = useState(initialStep ?? 0)
  const [file, setFile] = useState(null)
  const [trainingConfig, setTrainingConfig] = useState(null)
  const [trainingResult, setTrainingResult] = useState(null)

  // Derive saved pipeline slices (safe defaults when no pipeline is restored)
  const savedRemovedCols     = initialPipeline?.remove_columns   ?? []
  const savedMissingStrategy = initialPipeline?.missing_values   ?? {}
  const savedEncodingStrategy = initialPipeline?.encoding        ?? {}
  const savedScalingStrategy  = initialPipeline?.scaling         ?? {}
  const savedTargetColumn    = initialPipeline?.target_column    ?? ""

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
    setActiveStep(1) // move to upload step
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
              onUploadSuccess={() => setActiveStep(2)}
              onPrevStep={() => setActiveStep(0)}
              workspaceId={workspace?.workspace_id}
            />
          )}

          {/* Step 2 → Dataset Preview */}
          {activeStep === 2 && (
            <DatasetPreview
              onNextStep={() => setActiveStep(3)}
              onPrevStep={() => setActiveStep(1)}
            />
          )}

          {/* Step 3 → Data Cleaning */}
          {activeStep === 3 && (
            <DataCleaning
              onNextStep={() => setActiveStep(4)}
              onPrevStep={() => setActiveStep(2)}
              savedRemovedCols={savedRemovedCols}
              savedMissingStrategy={savedMissingStrategy}
            />
          )}

          {/* Step 4 → Exploratory Data Analysis (EDA) */}
          {activeStep === 4 && (
            <Eda
              onNextStep={() => setActiveStep(5)}
              onPrevStep={() => setActiveStep(3)}
            />
          )}

          {/* Step 5 → Feature Engineering */}
          {activeStep === 5 && (
            <FeatureEngineering
              onNextStep={() => setActiveStep(6)}
              onPrevStep={() => setActiveStep(4)}
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
              onPrevStep={() => setActiveStep(5)}
              onNextStep={(config) => {
                setTrainingConfig(config)
                setActiveStep(7)
              }}
            />
          )}

          {/* Step 7 → Model Training */}
          {activeStep === 7 && (
            <ModelTraining
              config={trainingConfig}
              onPrevStep={() => setActiveStep(6)}
              onNextStep={(result) => {
                setTrainingResult(result)
                setActiveStep(8)
              }}
            />
          )}

          {/* Step 8 → App Deployment */}
          {activeStep === 8 && (
            <AppDeployment
              result={trainingResult}
              onPrevStep={() => setActiveStep(7)}
            />
          )}

        </div>
      </div>

    </div>
  )
}

export default MLprocess