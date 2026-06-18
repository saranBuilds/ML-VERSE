import {
  Database,
  BrushCleaning,
  BarChart3,
  Settings2,
  Cpu,
  FlaskConical,
  Rocket,
  Eye
} from "lucide-react"

export default function MLWorkflowHeader({ activeStep = 0 }) {
  const steps = [
    { name: "Category", icon: <Settings2 size={18} /> },
    { name: "Data", icon: <Database size={18} /> },
    { name: "Preview", icon: <Eye size={18} /> },
    { name: "Cleaning", icon: <BrushCleaning size={18} /> },
    { name: "EDA", icon: <BarChart3 size={18} /> },
    { name: "Features", icon: <Settings2 size={18} /> },
    { name: "Model", icon: <Cpu size={18} /> },
    { name: "Training", icon: <FlaskConical size={18} /> },
    { name: "Deploy", icon: <Rocket size={18} /> }
  ]

  const progress = (activeStep / (steps.length - 1)) * 100

  return (
    <div className="w-full bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-5 rounded-2xl shadow-lg">

      <div className="relative mb-6">
        <div className="absolute top-1/2 left-0 w-full h-[3px] bg-blue-300/50 rounded"></div>
        <div
          className="absolute top-1/2 left-0 h-[3px] bg-white rounded transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex items-center justify-between gap-2 overflow-x-auto">
        {steps.map((step, index) => {
          const isActive = index === activeStep
          const isCompleted = index < activeStep

          return (
            <div key={index} className="flex flex-col items-center min-w-[70px]">

              <div
                className={`w-10 h-10 flex items-center justify-center rounded-xl
                ${isActive
                  ? "bg-white text-blue-600 scale-110"
                  : isCompleted
                  ? "bg-white text-blue-600"
                  : "bg-white/20 text-white"
                }`}
              >
                {step.icon}
              </div>

              <p className={`mt-2 text-[10px] md:text-xs ${index <= activeStep ? "text-white" : "text-blue-200"}`}>
                {step.name}
              </p>

            </div>
          )
        })}
      </div>
    </div>
  )
}