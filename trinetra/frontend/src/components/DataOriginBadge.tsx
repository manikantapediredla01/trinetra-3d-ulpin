import { clsx } from 'clsx'

interface DataOriginBadgeProps {
  origin: 'REAL_INPUT' | 'SYNTHETIC_DEMO' | 'DERIVED_AI' | 'SIMULATED_QAOA' | 'VALIDATED_RESULT'
  className?: string
  size?: 'xs' | 'sm'
}

const ORIGIN_CONFIG = {
  REAL_INPUT: {
    label: 'REAL INPUT',
    className: 'bg-verified/10 text-verified border-verified/30 border',
    title: 'Real government/field data (5%)',
  },
  SYNTHETIC_DEMO: {
    label: 'SYNTHETIC DEMO',
    className: 'bg-warning/10 text-warning border-warning/30 border',
    title: 'Synthetically generated demonstration data (95%)',
  },
  DERIVED_AI: {
    label: 'DERIVED AI OUTPUT',
    className: 'bg-govblue/10 text-govblue border-govblue/30 border',
    title: 'AI/Geospatial processing output',
  },
  SIMULATED_QAOA: {
    label: 'SIMULATED QAOA',
    className: 'bg-indigo-50 text-indigo-700 border-indigo-200 border',
    title: 'QAOA Qiskit Aer simulator output',
  },
  VALIDATED_RESULT: {
    label: 'VALIDATED RESULT',
    className: 'bg-teal/10 text-teal border-teal/30 border',
    title: 'Passed 8-check validation engine',
  },
}

export default function DataOriginBadge({ origin, className, size = 'xs' }: DataOriginBadgeProps) {
  const config = ORIGIN_CONFIG[origin]
  return (
    <span
      className={clsx(
        'inline-flex items-center font-semibold rounded px-2 py-0.5',
        size === 'xs' ? 'text-[10px]' : 'text-xs',
        config.className,
        className,
      )}
      title={config.title}
    >
      {config.label}
    </span>
  )
}
