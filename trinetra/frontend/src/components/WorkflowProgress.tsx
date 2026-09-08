import { NavLink } from 'react-router-dom'
import {
  Upload, Cpu, Layers, GitBranch, Database, Atom, CheckSquare,
  Fingerprint, CheckCircle, ChevronRight
} from 'lucide-react'
import { clsx } from 'clsx'

interface WorkflowStep {
  step: number
  label: string
  subtitle: string
  path: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  completed?: boolean
}

const WORKFLOW_STEPS: WorkflowStep[] = [
  { step: 1, label: '01 CAPTURE', subtitle: 'Data Ingestion', path: '/officer/ingestion', icon: Upload },
  { step: 2, label: '02 FUSE', subtitle: 'Preprocessing', path: '/officer/preprocessing', icon: Cpu },
  { step: 3, label: '03 UNDERSTAND', subtitle: 'AI Extraction', path: '/officer/extraction', icon: Layers },
  { step: 4, label: '04 GENERATE', subtitle: 'Candidates', path: '/officer/candidates', icon: GitBranch },
  { step: 5, label: '05 OPTIMIZE', subtitle: 'QUBO+QAOA', path: '/officer/qubo', icon: Database },
  { step: 6, label: '06 VERIFY', subtitle: 'Validation', path: '/officer/validation', icon: CheckSquare },
  { step: 7, label: '07 IDENTIFY', subtitle: '3D ULPIN', path: '/officer/ulpin', icon: Fingerprint },
]

interface Props {
  currentStep?: number
  completedSteps?: number[]
  compact?: boolean
}

export default function WorkflowProgress({ currentStep, completedSteps = [], compact = false }: Props) {
  return (
    <div className={clsx(
      'flex items-center gap-1 overflow-x-auto pb-1',
      compact ? 'py-1' : 'py-2'
    )}>
      {WORKFLOW_STEPS.map((step, i) => {
        const isCompleted = completedSteps.includes(step.step) || (currentStep !== undefined && step.step < currentStep)
        const isCurrent = currentStep === step.step

        return (
          <div key={step.path} className="flex items-center shrink-0">
            <NavLink
              to={step.path}
              className={({ isActive }) => clsx(
                'flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium transition-all whitespace-nowrap',
                isActive || isCurrent
                  ? 'bg-govblue text-white shadow-sm'
                  : isCompleted
                  ? 'bg-verified/10 text-verified border border-verified/30'
                  : 'text-muted hover:text-navy hover:bg-surface'
              )}
            >
              {isCompleted ? (
                <CheckCircle size={11} className="shrink-0" />
              ) : (
                <step.icon size={11} className="shrink-0" />
              )}
              <span>{step.label}</span>
            </NavLink>
            {i < WORKFLOW_STEPS.length - 1 && (
              <ChevronRight size={12} className="text-border mx-0.5 shrink-0" />
            )}
          </div>
        )
      })}
    </div>
  )
}
