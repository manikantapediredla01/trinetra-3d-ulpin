import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import {
  Layers, Atom, Shield, Map, Zap, QrCode, AlertTriangle,
  TrendingUp, Eye, ChevronRight, CheckCircle, ArrowRight
} from 'lucide-react'

const WORKFLOW = [
  { icon: '📡', label: 'LiDAR / Drone / GIS / DEM / GNSS', color: 'bg-govblue/10 text-govblue' },
  { icon: '⚙️', label: 'AI + Geospatial Processing', color: 'bg-teal/10 text-teal' },
  { icon: '🏗️', label: '3D Property Volumes', color: 'bg-govblue/10 text-govblue' },
  { icon: '⚛️', label: 'QUBO + QAOA Optimization', color: 'bg-indigo-50 text-indigo-700' },
  { icon: '✅', label: 'Geometry Validation', color: 'bg-verified/10 text-verified' },
  { icon: '🆔', label: '3D ULPIN', color: 'bg-navy/10 text-navy' },
  { icon: '🌐', label: 'Digital Property Twin', color: 'bg-teal/10 text-teal' },
]

const FEATURES = [
  { icon: Zap, title: '3D Digital Twin', desc: 'Interactive CesiumJS 3D visualization of your verified property, including all floors, units, and underground utilities.', color: 'text-govblue' },
  { icon: Layers, title: '3D ULPIN', desc: 'Unique Land Parcel Identification Number extended to the third dimension — generated only after geometry validation.', color: 'text-navy' },
  { icon: QrCode, title: 'QR Property Passport', desc: 'Scan-to-verify digital property passport with validated evidence and confidence score.', color: 'text-teal' },
  { icon: Atom, title: 'QUBO + QAOA', desc: 'Quantum-approximate optimization for selecting the best 3D property configuration from AI-generated candidates.', color: 'text-indigo-700' },
  { icon: AlertTriangle, title: 'Encroachment Detection', desc: 'Automated 3D comparison of building footprint vs. cadastral boundary identifies potential encroachments.', color: 'text-warning' },
  { icon: TrendingUp, title: 'Discrepancy Analysis', desc: 'Compare survey epochs T1 vs T2 to detect unauthorized new floors, expansions, or changes.', color: 'text-critical' },
  { icon: Eye, title: 'Confidence Scoring', desc: 'Evidence-based multi-source confidence score for every property — transparent and auditable.', color: 'text-govblue' },
  { icon: Map, title: '3D GIS Explorer', desc: 'Layer-based 3D GIS with underground utilities, change detection, and AI-assisted natural language queries.', color: 'text-teal' },
]

const STATS = [
  { value: '3D', label: 'ULPIN Enabled' },
  { value: '8+', label: 'Data Sources Fused' },
  { value: 'QAOA', label: 'Quantum Optimized' },
  { value: '7-Check', label: 'Validation Engine' },
]

export default function LandingPage() {
  const [animStep, setAnimStep] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setAnimStep(s => (s + 1) % WORKFLOW.length), 1200)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="min-h-screen bg-white">
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-border shadow-card">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-navy rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">T3</span>
            </div>
            <div>
              <div className="font-bold text-navy text-lg tracking-tight">TRINETRA</div>
              <div className="text-muted text-xs">3D Property Intelligence</div>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-muted">
            <a href="#problem" className="hover:text-navy transition-colors">Problem</a>
            <a href="#solution" className="hover:text-navy transition-colors">Solution</a>
            <a href="#workflow" className="hover:text-navy transition-colors">How It Works</a>
            <a href="#features" className="hover:text-navy transition-colors">Features</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/login" className="btn btn-secondary btn-sm">Login</Link>
            <Link to="/login" className="btn btn-primary btn-sm">
              Launch Platform <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-navy via-navy/95 to-govblue pt-20 pb-28">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Text */}
            <div className="animate-fade-in">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 border border-white/20 rounded-full text-white/80 text-xs font-medium mb-6">
                <Shield size={12} /> SIH26011 | Department of Land Resources | Ministry of Rural Development
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 text-balance">
                TRINETRA
              </h1>
              <p className="text-xl text-teal font-semibold mb-4">
                3D Property Intelligence & Digital Identity
              </p>
              <p className="text-white/70 text-lg mb-8 max-w-xl text-balance">
                Transforming physical properties into validated, queryable and uniquely identifiable
                3D digital assets — using multi-source evidence, AI, and quantum optimization.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/login" className="btn bg-teal text-white hover:bg-teal/90 btn-lg">
                  🚀 Launch Platform <ArrowRight size={18} />
                </Link>
                <a href="#workflow" className="btn bg-white/10 text-white border border-white/20 hover:bg-white/20 btn-lg">
                  How It Works
                </a>
              </div>

              {/* Stats row */}
              <div className="flex flex-wrap gap-6 mt-10">
                {STATS.map(({ value, label }) => (
                  <div key={label}>
                    <div className="text-2xl font-bold text-white">{value}</div>
                    <div className="text-white/50 text-xs">{label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Animated workflow */}
            <div className="relative">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur">
                <div className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-4">
                  TRINETRA Pipeline
                </div>
                {WORKFLOW.map((step, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-3 p-3 rounded-lg mb-2 transition-all duration-500 ${
                      i === animStep
                        ? 'bg-white/15 scale-105 border border-white/20'
                        : i < animStep
                        ? 'opacity-60'
                        : 'opacity-30'
                    }`}
                  >
                    <span className="text-xl">{step.icon}</span>
                    <span className="text-white text-sm font-medium">{step.label}</span>
                    {i < animStep && <CheckCircle size={14} className="text-teal ml-auto" />}
                    {i === animStep && (
                      <div className="ml-auto w-2 h-2 bg-teal rounded-full animate-pulse" />
                    )}
                    {i < WORKFLOW.length - 1 && (
                      <div className="absolute left-[42px] mt-10 w-0.5 h-4 bg-white/10" />
                    )}
                  </div>
                ))}
                <div className="mt-4 p-3 bg-teal/20 border border-teal/30 rounded-lg">
                  <div className="text-teal text-xs font-semibold">3D ULPIN Generated</div>
                  <div className="text-white font-mono text-sm mt-1">IN-3D-HYD0-2024-0001</div>
                  <div className="text-white/40 text-xs mt-1">Prototype identifier — Verified Digital Property Twin</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Problem ── */}
      <section id="problem" className="py-20 bg-surface">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="text-xs font-semibold text-muted uppercase tracking-widest mb-3">The Challenge</div>
            <h2 className="text-3xl font-bold text-navy mb-4">Why 2D Records Are Insufficient</h2>
            <p className="text-muted max-w-2xl mx-auto">
              Traditional 2D cadastral records cannot represent vertical property in multi-storey buildings,
              leading to ownership disputes, unauthorized constructions, and unresolved discrepancies.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: '🏢', title: 'Vertical Complexity', desc: 'A single 2D parcel may contain dozens of independent floor units with separate ownership — invisible in traditional records.' },
              { icon: '🚧', title: 'Encroachment Blindspots', desc: 'Building extensions and unauthorized floors cannot be detected without 3D spatial analysis against cadastral boundaries.' },
              { icon: '📋', title: 'Record Discrepancies', desc: 'Floor counts, areas, and boundaries in government records frequently diverge from actual constructed properties.' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="card-hover">
                <div className="text-4xl mb-4">{icon}</div>
                <h3 className="font-bold text-navy text-lg mb-2">{title}</h3>
                <p className="text-muted text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Solution ── */}
      <section id="solution" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="text-xs font-semibold text-teal uppercase tracking-widest mb-3">The Solution</div>
              <h2 className="text-3xl font-bold text-navy mb-6">
                Multi-source 3D Cadastral Intelligence
              </h2>
              <p className="text-muted mb-6">
                TRINETRA fuses LiDAR point clouds, drone imagery, GIS parcel data, DEM/DSM, floor plans,
                and GNSS references into a validated 3D digital property — with a unique 3D ULPIN that
                extends traditional cadastral identity into the vertical dimension.
              </p>
              {[
                'AI-assisted building & floor extraction from multi-source data',
                'QUBO formulation from measurable geometric candidate metrics',
                'QAOA quantum simulation for configuration optimization',
                'Mandatory 8-check validation before ULPIN generation',
                '3D encroachment and discrepancy detection',
                'QR Property Passport for authorized public verification',
              ].map(item => (
                <div key={item} className="flex items-start gap-2 mb-3">
                  <CheckCircle size={16} className="text-verified shrink-0 mt-0.5" />
                  <span className="text-dark text-sm">{item}</span>
                </div>
              ))}
            </div>
            <div className="bg-surface rounded-2xl p-6 border border-border">
              <div className="text-xs font-semibold text-muted uppercase tracking-wider mb-4">Core Transformation</div>
              {[
                ['Physical Property', '🏠'],
                ['Multi-source 3D Evidence', '📡'],
                ['AI/ML Building & Floor Understanding', '🤖'],
                ['Candidate 3D Property Volumes', '🧊'],
                ['QUBO → QAOA Optimization', '⚛️'],
                ['Geometry Reconstruction', '📐'],
                ['8-Check Validation', '✅'],
                ['Verified Digital Property Twin', '🌐'],
                ['3D ULPIN + QR Passport', '🆔'],
              ].map(([label, icon], i) => (
                <div key={label} className="flex items-center gap-3 py-1.5">
                  <span>{icon}</span>
                  <span className="text-sm text-dark">{label}</span>
                  {i < 8 && <ArrowRight size={12} className="text-border ml-auto" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Workflow ── */}
      <section id="workflow" className="py-20 bg-navy">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-white/60 max-w-xl mx-auto">
              The complete TRINETRA pipeline — from physical property evidence to verified 3D digital identity.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { n: '01', label: 'CAPTURE', desc: 'LiDAR, drone, GIS, DEM, floor plans, GNSS ingested', icon: '📥' },
              { n: '02', label: 'FUSE', desc: 'Multi-source preprocessing, registration and data fusion', icon: '⚙️' },
              { n: '03', label: 'UNDERSTAND', desc: 'AI/geometric building & floor extraction with confidence', icon: '🤖' },
              { n: '04', label: 'GENERATE', desc: 'Candidate 3D property configurations with geometry metrics', icon: '🧊' },
              { n: '05', label: 'OPTIMIZE', desc: 'QUBO formulation → QAOA simulation → best configuration', icon: '⚛️' },
              { n: '06', label: 'VERIFY', desc: '8-check geometry validation — only passing properties continue', icon: '✅' },
              { n: '07', label: 'IDENTIFY', desc: 'Prototype 3D ULPIN generated + QR Property Passport', icon: '🆔' },
              { n: '08', label: 'MONITOR', desc: 'Change detection, encroachment & discrepancy analysis', icon: '🔍' },
            ].map(({ n, label, desc, icon }) => (
              <div key={n} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-white/30 text-xs font-mono font-bold">{n}</span>
                  <span className="text-2xl">{icon}</span>
                </div>
                <div className="text-white font-bold text-sm mb-1">{label}</div>
                <div className="text-white/50 text-xs">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="text-xs font-semibold text-muted uppercase tracking-widest mb-3">Platform Features</div>
            <h2 className="text-3xl font-bold text-navy">Complete 3D Property Intelligence</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="card-hover group">
                <Icon size={24} className={`${color} mb-4`} />
                <h3 className="font-bold text-navy text-sm mb-2">{title}</h3>
                <p className="text-muted text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-16 bg-gradient-to-r from-govblue to-teal">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to explore TRINETRA?</h2>
          <p className="text-white/70 mb-8">
            Login as a Survey/GIS Officer to run the complete demo pipeline.
          </p>
          <Link to="/login" className="btn bg-white text-navy hover:bg-white/90 btn-lg font-semibold">
            Launch Platform → Login
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-navy py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-white/40 text-xs">
            TRINETRA — 3D ULPIN & Vertical Property Intelligence Platform<br />
            SIH26011 | Department of Land Resources (DoLR) | Ministry of Rural Development
          </div>
          <div className="text-white/30 text-xs">
            PROTOTYPE / DEMONSTRATION ENVIRONMENT — Not for official use
          </div>
        </div>
      </footer>
    </div>
  )
}
