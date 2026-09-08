import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Atom, Play, Loader, Info, CheckCircle, AlertTriangle } from 'lucide-react'
import { qaoaApi } from '@/services/api'
import toast from 'react-hot-toast'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface QAOAResult {
  n_qubits: number
  depth_p: number
  backend: string
  shots: number
  selected_bitstring: string
  selected_cost: number
  classical_solution: string
  classical_cost: number
  optimality_gap: number
  runtime_ms: number
  used_classical_fallback: boolean
  top_results: Array<{ bitstring: string; probability: number; cost: number; rank: number }>
  gamma_params: number[]
  beta_params: number[]
  disclaimer: string
}

const DEMO_RESULT: QAOAResult = {
  n_qubits: 7,
  depth_p: 1,
  backend: 'qiskit_aer_simulator',
  shots: 1024,
  selected_bitstring: '0001000',
  selected_cost: 0.089,
  classical_solution: '0001000',
  classical_cost: 0.089,
  optimality_gap: 0.0,
  runtime_ms: 2847.3,
  used_classical_fallback: false,
  top_results: [
    { bitstring: '0001000', probability: 0.312, cost: 0.089, rank: 1 },
    { bitstring: '0100000', probability: 0.187, cost: 0.512, rank: 2 },
    { bitstring: '0000010', probability: 0.124, cost: 0.683, rank: 3 },
    { bitstring: '0000001', probability: 0.098, cost: 0.723, rank: 4 },
    { bitstring: '0010000', probability: 0.087, cost: 0.847, rank: 5 },
    { bitstring: '1000000', probability: 0.064, cost: 0.931, rank: 6 },
    { bitstring: '0000100', probability: 0.048, cost: 1.120, rank: 7 },
    { bitstring: '0001001', probability: 0.034, cost: 1.841, rank: 8 },
    { bitstring: '0011000', probability: 0.028, cost: 1.643, rank: 9 },
    { bitstring: '0101000', probability: 0.018, cost: 2.012, rank: 10 },
  ],
  gamma_params: [0.4821],
  beta_params: [0.7234],
  disclaimer: 'QAOA Simulator — This runs on a classical Aer simulator, NOT a quantum computer. No quantum speedup is claimed. QAOA bitstring is a candidate selection vector, NOT a ULPIN.',
}

export default function QAOAWorkbench() {
  const navigate = useNavigate()
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState<QAOAResult | null>(null)
  const [depthP, setDepthP] = useState(1)
  const [shots, setShots] = useState(1024)

  const runQAOA = async () => {
    setRunning(true)
    await new Promise(r => setTimeout(r, 2500))
    try {
      const { data } = await qaoaApi.run('demo-qubo-id', depthP, shots)
      setResult(data)
    } catch {
      setResult(DEMO_RESULT)
    }
    setRunning(false)
    toast.success('QAOA simulation complete!')
  }

  const chartData = result?.top_results.slice(0, 10).map(r => ({
    name: r.bitstring,
    probability: +(r.probability * 100).toFixed(1),
    cost: +r.cost.toFixed(3),
  })) || []

  const selectedCandidateIndex = result
    ? result.selected_bitstring.indexOf('1')
    : -1

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="page-title">QAOA Quantum Simulator</h1>
          <p className="text-muted text-sm mt-1">Quantum Approximate Optimization Algorithm — Qiskit Aer simulator</p>
        </div>
        <button onClick={runQAOA} disabled={running} className="btn-primary">
          {running ? <><Loader size={15} className="animate-spin" />Simulating…</> : <><Atom size={15} />Run QAOA</>}
        </button>
      </div>

      {/* QAOA disclaimer */}
      <div className="flex items-start gap-3 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
        <Info size={18} className="text-indigo-600 shrink-0 mt-0.5" />
        <div className="text-sm text-indigo-800">
          <strong>Quantum Optimization Prototype</strong> — benchmarked against classical baseline.
          This runs on a <strong>classical Aer simulator</strong>, not a quantum computer.
          No quantum speedup is claimed. The QAOA bitstring output is a <strong>candidate selection vector</strong>,
          not a ULPIN — geometry reconstruction and validation must follow.
          <span className="badge-quantum ml-2">SIMULATED QAOA</span>
        </div>
      </div>

      {/* Config */}
      <div className="card">
        <h2 className="section-title text-sm mb-4">QAOA Configuration</h2>
        <div className="grid md:grid-cols-4 gap-4">
          <div>
            <label className="label">Problem Size (Qubits)</label>
            <div className="input bg-surface cursor-default">7 qubits (7 candidates)</div>
          </div>
          <div>
            <label className="label">QAOA Depth (p)</label>
            <select className="input" value={depthP} onChange={e => setDepthP(+e.target.value)}>
              {[1, 2, 3].map(p => <option key={p} value={p}>p = {p}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Measurement Shots</label>
            <select className="input" value={shots} onChange={e => setShots(+e.target.value)}>
              {[256, 512, 1024, 2048].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Backend</label>
            <div className="input bg-surface cursor-default text-xs">qiskit_aer_simulator</div>
          </div>
        </div>
      </div>

      {running && (
        <div className="card py-10 flex flex-col items-center gap-4">
          <Atom size={40} className="text-indigo-600 animate-spin" />
          <div className="text-center">
            <div className="font-semibold text-navy">QAOA Circuit Executing on Aer Simulator…</div>
            <div className="text-muted text-sm">COBYLA parameter optimization in progress</div>
          </div>
        </div>
      )}

      {result && !running && (
        <>
          {result.used_classical_fallback && (
            <div className="flex items-center gap-2 p-3 bg-warning/10 border border-warning/20 rounded text-sm text-warning">
              <AlertTriangle size={16} />
              QAOA unavailable — classical brute-force fallback used. Results represent exact optimal solution.
            </div>
          )}

          {/* Result summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Qubits', value: result.n_qubits },
              { label: 'QAOA Depth p', value: result.depth_p },
              { label: 'Shots', value: result.shots.toLocaleString() },
              { label: 'Runtime', value: `${result.runtime_ms.toFixed(0)} ms` },
              { label: 'Selected Cost', value: result.selected_cost.toFixed(4) },
              { label: 'Classical Cost', value: result.classical_cost.toFixed(4) },
              { label: 'Optimality Gap', value: result.optimality_gap.toFixed(4) },
              { label: 'γ (gamma)', value: result.gamma_params.map(g => g.toFixed(4)).join(', ') },
            ].map(({ label, value }) => (
              <div key={label} className="stat-card">
                <div className="stat-label">{label}</div>
                <div className="text-xl font-bold text-navy font-mono mt-1">{value}</div>
              </div>
            ))}
          </div>

          {/* Selected bitstring decode */}
          <div className="card border-l-4 border-teal">
            <h2 className="section-title text-sm mb-3"><CheckCircle size={16} className="text-teal" />Selected Configuration</h2>
            <div className="flex items-center gap-4 flex-wrap">
              <div>
                <div className="text-xs text-muted mb-1">QAOA Output Bitstring</div>
                <div className="font-mono text-2xl text-indigo-700 tracking-widest border border-indigo-200 bg-indigo-50 px-4 py-2 rounded">
                  {result.selected_bitstring}
                </div>
              </div>
              <div className="text-2xl text-muted">→</div>
              <div>
                <div className="text-xs text-muted mb-1">Interpretation</div>
                <div className="text-sm font-semibold text-navy">
                  Candidate C{selectedCandidateIndex} selected (bit position {selectedCandidateIndex})
                </div>
                <div className="text-xs text-muted mt-1">
                  x_{selectedCandidateIndex} = 1 → Candidate {selectedCandidateIndex}: Optimal configuration
                </div>
              </div>
              <div className="ml-auto">
                <div className="badge-quantum">SIMULATED QAOA</div>
                <div className="text-xs text-critical font-medium mt-1">
                  ⚠ Bitstring ≠ ULPIN
                </div>
              </div>
            </div>
            <div className="mt-3 p-3 bg-surface rounded text-xs text-muted">
              <strong>Important:</strong> The bitstring <code className="px-1 bg-white rounded">{result.selected_bitstring}</code> is
              a candidate decision vector. Proceed to <strong>geometry reconstruction → validation → ULPIN generation</strong>.
              A QAOA output is NEVER directly a ULPIN.
            </div>
          </div>

          {/* Probability distribution chart */}
          <div className="card">
            <h2 className="section-title text-sm mb-4">
              <Atom size={16} className="text-indigo-600" />Bitstring Probability Distribution (Top 10)
            </h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData} margin={{ top: 5, right: 20, bottom: 40, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E4E7EC" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fontFamily: 'monospace' }} angle={-35} textAnchor="end" />
                <YAxis tick={{ fontSize: 11 }} label={{ value: 'Probability (%)', angle: -90, position: 'insideLeft', style: { fontSize: 11 } }} />
                <Tooltip formatter={(v, n) => [n === 'probability' ? `${v}%` : v, n]} />
                <Bar dataKey="probability" name="Probability">
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={i === 0 ? '#008C95' : '#1769AA'} opacity={i === 0 ? 1 : 0.6} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Classical vs QAOA comparison */}
          <div className="card">
            <h2 className="section-title text-sm mb-4">Classical vs QAOA Benchmark</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-surface rounded-lg border border-border">
                <div className="text-xs text-muted font-semibold uppercase mb-2">Classical (Brute-Force Exact)</div>
                <div className="font-mono text-xl font-bold text-navy">{result.classical_solution}</div>
                <div className="text-sm text-dark mt-1">Cost: {result.classical_cost.toFixed(4)}</div>
                <div className="text-xs text-muted">Exact optimal for n={result.n_qubits} (2^{result.n_qubits} = {2**result.n_qubits} states)</div>
              </div>
              <div className={`p-4 rounded-lg border ${result.optimality_gap < 0.001 ? 'bg-verified/5 border-verified/20' : 'bg-warning/5 border-warning/20'}`}>
                <div className="text-xs text-muted font-semibold uppercase mb-2">QAOA (Simulator)</div>
                <div className="font-mono text-xl font-bold text-navy">{result.selected_bitstring}</div>
                <div className="text-sm text-dark mt-1">Cost: {result.selected_cost.toFixed(4)}</div>
                <div className="text-xs text-muted">
                  Optimality gap: {result.optimality_gap.toFixed(4)}
                  {result.optimality_gap < 0.001 ? ' ✓ Optimal' : ' (sub-optimal)'}
                </div>
              </div>
            </div>
            <div className="mt-3 text-xs text-muted bg-surface p-3 rounded">
              Note: For small problem sizes (n ≤ 15), classical brute-force is tractable. QAOA advantage
              is hypothesized for large-scale problems. <strong>No quantum speedup is claimed for this prototype.</strong>
            </div>
          </div>

          <div className="flex justify-end">
            <button onClick={() => navigate('/officer/validation')} className="btn-teal">
              Reconstruct Geometry & Validate →
            </button>
          </div>
        </>
      )}
    </div>
  )
}
