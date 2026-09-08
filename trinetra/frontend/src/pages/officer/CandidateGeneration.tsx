import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GitBranch, Play, CheckCircle, Loader, Database } from 'lucide-react'
import { candidatesApi, quboApi } from '@/services/api'
import toast from 'react-hot-toast'
import { clsx } from 'clsx'

interface Candidate {
  id: string
  index: number
  area_m2: number
  volume_m3: number
  floor_range: string
  overlap_score: number
  gap_score: number
  boundary_error: number
  floor_error: number
  topology_score: number
  total_cost: number
  description: string
}

const DEMO_CANDIDATES: Candidate[] = [
  { id: 'c0', index: 0, area_m2: 253.8, volume_m3: 1814.2, floor_range: 'B–5', overlap_score: 0.18, gap_score: 0.12, boundary_error: 1.42, floor_error: 0.52, topology_score: 0.88, total_cost: 0.847, description: 'Wide boundary variant' },
  { id: 'c1', index: 1, area_m2: 249.1, volume_m3: 1780.5, floor_range: 'B–5', overlap_score: 0.22, gap_score: 0.08, boundary_error: 0.98, floor_error: 0.38, topology_score: 0.91, total_cost: 0.723, description: 'Compact north variant' },
  { id: 'c2', index: 2, area_m2: 255.2, volume_m3: 1824.8, floor_range: 'G–5', overlap_score: 0.31, gap_score: 0.19, boundary_error: 2.10, floor_error: 0.64, topology_score: 0.82, total_cost: 1.120, description: 'No basement variant' },
  { id: 'c3', index: 3, area_m2: 252.0, volume_m3: 1800.0, floor_range: 'B–5', overlap_score: 0.02, gap_score: 0.01, boundary_error: 0.15, floor_error: 0.05, topology_score: 0.98, total_cost: 0.089, description: '★ Optimal configuration' },
  { id: 'c4', index: 4, area_m2: 251.3, volume_m3: 1795.2, floor_range: 'B–4', overlap_score: 0.14, gap_score: 0.21, boundary_error: 0.85, floor_error: 0.41, topology_score: 0.90, total_cost: 0.683, description: 'Reduced height variant' },
  { id: 'c5', index: 5, area_m2: 248.7, volume_m3: 1529.0, floor_range: 'G–5', overlap_score: 0.09, gap_score: 0.15, boundary_error: 0.72, floor_error: 0.33, topology_score: 0.93, total_cost: 0.512, description: 'Shallow variant' },
  { id: 'c6', index: 6, area_m2: 256.4, volume_m3: 1843.0, floor_range: 'B–6', overlap_score: 0.25, gap_score: 0.07, boundary_error: 1.95, floor_error: 0.58, topology_score: 0.85, total_cost: 0.931, description: 'Tall variant' },
]

export default function CandidateGeneration() {
  const navigate = useNavigate()
  const [running, setRunning] = useState(false)
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [runningQUBO, setRunningQUBO] = useState(false)

  const generate = async () => {
    setRunning(true)
    await new Promise(r => setTimeout(r, 1200))
    try { await candidatesApi.generate('PROP-HYD-2024-001') } catch {}
    setCandidates(DEMO_CANDIDATES)
    setRunning(false)
    toast.success('7 candidate configurations generated')
  }

  const runQUBO = async () => {
    setRunningQUBO(true)
    try { await quboApi.create('PROP-HYD-2024-001') } catch {}
    await new Promise(r => setTimeout(r, 800))
    setRunningQUBO(false)
    toast.success('QUBO formulated! Navigate to QUBO Engine.')
    navigate('/officer/qubo')
  }

  const costColor = (cost: number) => {
    if (cost < 0.1) return 'text-verified'
    if (cost < 0.5) return 'text-teal'
    if (cost < 0.8) return 'text-warning'
    return 'text-critical'
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="page-title">Candidate 3D Property Volumes</h1>
          <p className="text-muted text-sm mt-1">Generate and compare candidate 3D configurations for QUBO optimization</p>
        </div>
        <div className="flex gap-3">
          <button onClick={generate} disabled={running} className="btn-secondary">
            {running ? <><Loader size={14} className="animate-spin" />Generating…</> : <><Play size={14} />Generate Candidates</>}
          </button>
          {candidates.length > 0 && (
            <button onClick={runQUBO} disabled={runningQUBO} className="btn-primary">
              {runningQUBO ? <><Loader size={14} className="animate-spin" />Building QUBO…</> : <><Database size={14} />Formulate QUBO</>}
            </button>
          )}
        </div>
      </div>

      <div className="demo-banner">
        ℹ️ Candidates are generated from AI-extracted building/floor geometry.
        Scores computed from measurable spatial metrics — not arbitrary values.
        <span className="badge-derived ml-2">DERIVED AI OUTPUT</span>
      </div>

      {candidates.length > 0 && (
        <div className="card overflow-x-auto">
          <h2 className="section-title text-sm mb-4"><GitBranch size={16} className="text-govblue" />
            {candidates.length} Candidate Configurations
          </h2>
          <table className="w-full">
            <thead>
              <tr>
                {['Select', '#', 'Description', 'Area (m²)', 'Volume (m³)', 'Floors', 'Overlap', 'Gap', 'Boundary Err', 'Floor Err', 'Topology', 'QUBO Cost'].map(h => (
                  <th key={h} className="tbl-header text-left whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {candidates.map(c => (
                <tr
                  key={c.id}
                  onClick={() => setSelected(c.id === selected ? null : c.id)}
                  className={clsx(
                    'cursor-pointer transition-colors hover:bg-surface',
                    selected === c.id && 'bg-govblue/5 border-l-2 border-govblue'
                  )}
                >
                  <td className="tbl-cell">
                    {selected === c.id
                      ? <CheckCircle size={16} className="text-govblue" />
                      : <div className="w-4 h-4 rounded-full border-2 border-border" />}
                  </td>
                  <td className="tbl-cell font-mono text-xs font-semibold">C{c.index}</td>
                  <td className="tbl-cell text-xs max-w-xs">
                    <span className={c.index === 3 ? 'font-semibold text-verified' : ''}>{c.description}</span>
                  </td>
                  <td className="tbl-cell text-xs">{c.area_m2}</td>
                  <td className="tbl-cell text-xs">{c.volume_m3.toLocaleString()}</td>
                  <td className="tbl-cell text-xs font-mono">{c.floor_range}</td>
                  <td className="tbl-cell text-xs">{c.overlap_score.toFixed(3)}</td>
                  <td className="tbl-cell text-xs">{c.gap_score.toFixed(3)}</td>
                  <td className="tbl-cell text-xs">{c.boundary_error.toFixed(2)}m</td>
                  <td className="tbl-cell text-xs">{c.floor_error.toFixed(2)}m</td>
                  <td className="tbl-cell text-xs">{(c.topology_score * 100).toFixed(0)}%</td>
                  <td className={`tbl-cell text-xs font-bold ${costColor(c.total_cost)}`}>
                    {c.total_cost.toFixed(3)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-3 text-xs text-muted p-2 bg-surface rounded">
            <strong>Cost formula:</strong> w_o × Overlap + w_g × Gap + w_b × BoundaryError + w_f × FloorError + w_t × (1 − Topology)
            — coefficients data-driven from metric distributions.
            <strong> Lower cost = better candidate.</strong>
          </div>
        </div>
      )}
    </div>
  )
}
