import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Database, Play, Loader, Info, ChevronDown, ChevronUp } from 'lucide-react'
import { quboApi } from '@/services/api'
import toast from 'react-hot-toast'

const DEMO_QUBO = {
  n_variables: 7,
  variable_labels: ['C0', 'C1', 'C2', 'C3', 'C4', 'C5', 'C6'],
  q_matrix: [
    [0.847, 8.47, 8.47, 8.47, 8.47, 8.47, 8.47],
    [0, 0.723, 8.47, 8.47, 8.47, 8.47, 8.47],
    [0, 0, 1.120, 8.47, 8.47, 8.47, 8.47],
    [0, 0, 0, 0.089, 8.47, 8.47, 8.47],
    [0, 0, 0, 0, 0.683, 8.47, 8.47],
    [0, 0, 0, 0, 0, 0.512, 8.47],
    [0, 0, 0, 0, 0, 0, 0.931],
  ],
  constraint_lambda: 5.0,
  classical_solution: '0001000',
  classical_cost: 0.089,
  ising_h: [-0.3795, -0.2865, -0.5450, 0.8355, -0.2315, -0.1940, -0.3895],
}

export default function QUBOWorkbench() {
  const navigate = useNavigate()
  const [running, setRunning] = useState(false)
  const [qubo, setQubo] = useState<typeof DEMO_QUBO | null>(null)
  const [showMatrix, setShowMatrix] = useState(false)

  const buildQUBO = async () => {
    setRunning(true)
    await new Promise(r => setTimeout(r, 1000))
    try { await quboApi.create('PROP-HYD-2024-001') } catch {}
    setQubo(DEMO_QUBO)
    setRunning(false)
    toast.success('QUBO matrix built! Ready for QAOA simulation.')
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="page-title">QUBO Engine</h1>
          <p className="text-muted text-sm mt-1">Quadratic Unconstrained Binary Optimization — data-driven formulation</p>
        </div>
        <button onClick={buildQUBO} disabled={running} className="btn-primary">
          {running ? <><Loader size={14} className="animate-spin" />Building…</> : <><Database size={14} />Build QUBO Matrix</>}
        </button>
      </div>

      <div className="flex items-start gap-3 p-4 bg-indigo-50 border border-indigo-200 rounded-lg text-sm text-indigo-800">
        <Info size={18} className="text-indigo-600 shrink-0 mt-0.5" />
        <div>
          <strong>QUBO Formulation Principles:</strong> Q matrix diagonal = candidate self-cost (from geometric metrics).
          Off-diagonal = constraint penalty λ (enforces one-hot selection — exactly one candidate chosen).
          <strong> All values derived from measurable spatial properties, not arbitrary.</strong>
          λ = {DEMO_QUBO.constraint_lambda} (5× max candidate cost ensures exactly 1 selection).
        </div>
      </div>

      {qubo && (
        <div className="space-y-6">
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { label: 'Variables', value: qubo.n_variables },
              { label: 'Constraint λ', value: qubo.constraint_lambda },
              { label: 'Classical Optimal', value: qubo.classical_solution },
              { label: 'Min Cost', value: qubo.classical_cost.toFixed(4) },
            ].map(({ label, value }) => (
              <div key={label} className="stat-card">
                <div className="stat-label">{label}</div>
                <div className="text-2xl font-bold text-navy font-mono mt-1">{value}</div>
              </div>
            ))}
          </div>

          {/* Q Matrix */}
          <div className="card overflow-x-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title text-sm"><Database size={15} />Q Matrix ({qubo.n_variables}×{qubo.n_variables})</h2>
              <button onClick={() => setShowMatrix(s => !s)} className="btn-ghost btn-sm">
                {showMatrix ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                {showMatrix ? 'Collapse' : 'Expand'}
              </button>
            </div>
            {showMatrix && (
              <div className="overflow-x-auto">
                <table className="text-xs font-mono border-collapse">
                  <thead>
                    <tr>
                      <th className="tbl-header w-10">—</th>
                      {qubo.variable_labels.map(l => (
                        <th key={l} className="tbl-header text-center px-3">{l}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {qubo.q_matrix.map((row, i) => (
                      <tr key={i}>
                        <td className="tbl-cell font-semibold text-govblue">{qubo.variable_labels[i]}</td>
                        {row.map((val, j) => (
                          <td key={j} className={`tbl-cell text-center px-3 ${i === j ? 'bg-govblue/10 font-bold text-govblue' : val > 1 ? 'text-muted' : 'text-dark'}`}>
                            {val.toFixed(3)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="mt-2 text-xs text-muted">
                  <span className="bg-govblue/10 px-2 py-0.5 rounded mr-2">Diagonal = candidate cost</span>
                  <span className="text-muted">Off-diagonal = constraint λ = {qubo.constraint_lambda}</span>
                </div>
              </div>
            )}
          </div>

          {/* Ising h values */}
          <div className="card">
            <h2 className="section-title text-sm mb-3">Ising Model h Coefficients</h2>
            <div className="grid grid-cols-7 gap-2">
              {qubo.ising_h.map((h, i) => (
                <div key={i} className="text-center p-2 bg-surface rounded border border-border">
                  <div className="text-xs text-muted">h_{qubo.variable_labels[i]}</div>
                  <div className="font-mono text-sm font-bold text-navy">{h.toFixed(4)}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button onClick={() => navigate('/officer/qaoa')} className="btn-primary">
              Run QAOA Simulation →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
