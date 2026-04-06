import { useState } from "react"
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

const MLprocess = () => {
  const [category, setCategory] = useState("")
  const [type, setType] = useState("")
  const [activeStep, setActiveStep] = useState(0)
  const [file, setFile] = useState(null)
  const [trainingConfig, setTrainingConfig] = useState(null)
  const [trainingResult, setTrainingResult] = useState(null)

  const handleCategoryChange = (value) => {
    setCategory(value)
    setType("")
    setActiveStep(0)
  }

  const handleTypeChange = (value) => {
    setType(value)
    setActiveStep(1) // ✅ move to upload step
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">

      {/* Header */}
      <div className="w-full px-4 pt-6">
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
            />
          )}

          {/* Step 1 → Dataset Upload */}
          {activeStep === 1 && (
            <DatasetUpload
              setFile={setFile}
              onUploadSuccess={() => setActiveStep(2)} // 🔥 next step
              onPrevStep={() => setActiveStep(0)}
            />
          )}

          {/* Step 2 → Dataset Preview */}
          {activeStep === 2 && (
            <DatasetPreview 
              onNextStep={() => setActiveStep(3)} // Proceed to Data Cleaning
              onPrevStep={() => setActiveStep(1)}
            />
          )}

          {/* Step 3 → Data Cleaning */}
          {activeStep === 3 && (
            <DataCleaning 
              onNextStep={() => setActiveStep(4)} // Proceed to EDA
              onPrevStep={() => setActiveStep(2)}
            />
          )}

          {/* Step 4 → Exploratory Data Analysis (EDA) */}
          {activeStep === 4 && (
            <Eda 
              onNextStep={() => setActiveStep(5)} // Proceed to Feature Engineering
              onPrevStep={() => setActiveStep(3)}
            />
          )}

          {/* Step 5 → Feature Engineering */}
          {activeStep === 5 && (
            <FeatureEngineering 
              onNextStep={() => setActiveStep(6)} // Proceed to Model Selection/Training
              onPrevStep={() => setActiveStep(4)}
            />
          )}

          {/* Step 6 → Model Selection */}
          {activeStep === 6 && (
            <ModelSelection
              category={category}
              type={type}
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