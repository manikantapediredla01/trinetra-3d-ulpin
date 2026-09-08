import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Play, CheckCircle, ChevronRight, ChevronLeft, RotateCcw,
  Sparkles, ExternalLink, Shield, Database, Cpu, Atom,
  AlertTriangle, Eye, QrCode, FileText, Activity, Layers, ArrowRight
} from 'lucide-react'
import toast from 'react-hot-toast'

interface DemoStep {
  step: number
  title: string
  subtitle: string
  category: string
  route: string
  actionLabel: string
  description: string
  technicalDetails: string
  outputSummary: Record<string, string | number>
  badge: string
}

const DEMO_STEPS: DemoStep[] = [
  {
    step: 1,
    title: 'Demo Environment & Cadastral Anchor',
    subtitle: 'Anchoring to real Hyderabad coordinates (17.4235° N, 78.4483° E)',
    category: 'INITIALIZATION',
    route: '/officer/dashboard',
    actionLabel: 'Initialize Demo Property',
    description: 'Loads the benchmark property "Srinivas Commercial Complex" in Banjara Hills, Hyderabad. Anchored using real revenue cadastral parcel HYD/BH/123/4.',
    technicalDetails: 'Combines 5% real geospatial data (TGRAC Cadastral, Copernicus GLO-30 DEM, IITH LiDAR) with 95% synthetic multi-storey 3D building geometries.',
    outputSummary: {
      'Property Ref': 'PROP-HYD-2024-001',
      'Location': 'Banjara Hills, Hyderabad',
      'Parcel Number': 'HYD/BH/123/4',
      'Datum Elevation': '536.0 m MSL',
    },
    badge: 'ANCHOR',
  },
  {
    step: 2,
    title: 'Multi-Source Data Ingestion',
    subtitle: '5 distinct data sources unified with strict provenance',
    category: 'INGESTION',
    route: '/officer/ingestion',
    actionLabel: 'Inspect Ingested Feeds',
    description: 'Ingests multi-modal spatial datasets: raw point clouds, cadastral polygons, raster DEM elevation tiles, drone orthophotos, and TG-bPASS building permit PDFs.',
    technicalDetails: 'Validates file headers, computes SHA-256 hashes for cryptographic provenance, and classifies data origin (REAL_INPUT vs SYNTHETIC_DEMO).',
    outputSummary: {
      'Datasets Ingested': 5,
      'Point Cloud Points': '450,000 pts',
      'Cadastral Format': 'GeoJSON (EPSG:4326)',
      'Elevation Model': 'Copernicus 30m GeoTIFF',
    },
    badge: 'FUSION',
  },
  {
    step: 3,
    title: '11-Stage Preprocessing Pipeline',
    subtitle: 'Automated point cloud denoising & datum transformation',
    category: 'PREPROCESSING',
    route: '/officer/preprocessing',
    actionLabel: 'Execute Pipeline',
    description: 'Sequentially processes raw inputs through CRS unification, outlier filtering (SOR), ground classification (CSF), elevation normalization, and feature extraction.',
    technicalDetails: 'Normalizes Z-coordinates to height above ground (HAG = Z_point - Z_dem), aligns EPSG:32644 (UTM 44N) with EPSG:4326 (WGS84).',
    outputSummary: {
      'Stages Executed': '11 / 11 Complete',
      'Noise Outliers Removed': '3,412 pts',
      'Ground Filtering RMSE': '0.038 m',
      'CRS Alignment': 'EPSG:4326',
    },
    badge: 'PIPELINE',
  },
  {
    step: 4,
    title: 'AI & Geometric LoD-2 Extraction',
    subtitle: 'Extracting 3D building footprint & volumetric bounding envelope',
    category: 'EXTRACTION',
    route: '/officer/extraction',
    actionLabel: 'Run 3D Extraction',
    description: 'Employs PointNet++ geometric clustering and RANSAC planar detection to separate facade walls, roof planes, and ground contact lines.',
    technicalDetails: 'Outputs LoD-2 volumetric mesh with 18.0m width, 14.0m depth, and 19.2m above-ground height. Roof classified as flat reinforced concrete.',
    outputSummary: {
      'Footprint Area': '252.0 m²',
      'Eave Height': '18.8 m',
      'Total Height': '19.2 m',
      'Roof Type': 'Flat Concrete Parapet',
    },
    badge: 'AI EXTRACTION',
  },
  {
    step: 5,
    title: 'Vertical Floor & Unit Decomposition',
    subtitle: 'Decomposing building into 7 discrete vertical spatial units',
    category: 'VERTICAL DECOMPOSITION',
    route: '/officer/extraction',
    actionLabel: 'View Floor Units',
    description: 'Slices the 3D volume vertically at 3.2m intervals to identify individual floor boundaries, basement parking, and separate tenancy units.',
    technicalDetails: 'Detects 1 basement level (-3.5m depth), 1 ground commercial floor, and 5 upper commercial office levels housing 12 distinct spatial units.',
    outputSummary: {
      'Levels Detected': 'Basement + G + 5 Floors (7 Levels)',
      'Total Units': '12 Spatial Units',
      'Floor Height': '3.2 m standard',
      'Basement Depth': '-3.5 m below ground',
    },
    badge: 'VERTICAL SLICING',
  },
  {
    step: 6,
    title: 'Candidate 3D Configurations',
    subtitle: 'Generating 7 candidate boundary proposals with error metrics',
    category: 'CANDIDATES',
    route: '/officer/candidates',
    actionLabel: 'Generate Candidates',
    description: 'Produces alternative 3D property boundary configurations to resolve spatial ambiguities between survey point clouds and recorded cadastral lines.',
    technicalDetails: 'Computes measurable spatial error metrics for each candidate: Overlap score, Gap score, RMS boundary error, Floor deviation, and Topology score.',
    outputSummary: {
      'Candidates Generated': '7 Configurations',
      'Best Candidate Index': 'Candidate 1 (Cost = 0.150)',
      'Worst Candidate Index': 'Candidate 6 (Cost = 1.840)',
      'Variables for QUBO': '7 Binary Variables',
    },
    badge: 'GEOMETRY',
  },
  {
    step: 7,
    title: 'QUBO Formulation Engine',
    subtitle: 'Building Q matrix & penalty-enforced Hamiltonian',
    category: 'QUANTUM FORMULATION',
    route: '/officer/qubo',
    actionLabel: 'Formulate QUBO',
    description: 'Transforms the discrete configuration selection problem into a Quadratic Unconstrained Binary Optimization (QUBO) mathematical formulation.',
    technicalDetails: 'Cost = Σ(w_i * Error_i) + λ*(Σx_i - 1)². Constructs symmetric 7×7 Q matrix and maps to Ising Hamiltonian (h_i, J_ij) for quantum gates.',
    outputSummary: {
      'Q Matrix Size': '7 × 7 Variables',
      'Constraint Penalty λ': '5.0',
      'Linear Ising Terms (h)': '7 coefficients',
      'Quadratic Couplings (J)': '21 coupling terms',
    },
    badge: 'QUBO',
  },
  {
    step: 8,
    title: 'Qiskit QAOA Optimization',
    subtitle: 'Simulating quantum approximate optimization algorithm (p=1)',
    category: 'QUANTUM SIMULATION',
    route: '/officer/qaoa',
    actionLabel: 'Run QAOA Circuit',
    description: 'Executes QAOA on Qiskit Aer simulator with parameterized cost and mixer Hamiltonians optimized via classical COBYLA optimizer.',
    technicalDetails: '1024 shots, depth p=1. Highest sampling probability (78.3%) converges to statevector |0100000⟩ (Candidate 1 selected, others 0).',
    outputSummary: {
      'Backend': 'Qiskit Aer Simulator (1.x)',
      'Circuit Depth p': '1 (2p variational angles)',
      'Optimal Bitstring': '0100000',
      'Convergence Optimality': '97.4% Match to Classical',
    },
    badge: 'QAOA',
  },
  {
    step: 9,
    title: 'Geometry Reconstruction from Bitstring',
    subtitle: 'Decoding quantum measurement into validated 3D volume mesh',
    category: 'RECONSTRUCTION',
    route: '/gis/explorer',
    actionLabel: 'Reconstruct Geometry',
    description: 'Translates the optimal bitstring "0100000" back into the 3D multi-polygon geometry of Candidate 1.',
    technicalDetails: 'Applies coordinate transforms and creates multi-storey 3D solid with exact vertices anchored to Hyderabad cadastral boundary.',
    outputSummary: {
      'Selected Candidate': 'Candidate 1',
      'Reconstructed Volume': '4,838.4 m³',
      'Vertex Count': '56 vertices',
      'Topology Validity': '100% Manifold Mesh',
    },
    badge: 'DECODING',
  },
  {
    step: 10,
    title: '8-Check Mandatory Validation',
    subtitle: 'Zero-tolerance verification gate prior to ULPIN issuance',
    category: 'VALIDATION GATE',
    route: '/officer/validation',
    actionLabel: 'Run 8-Check Gate',
    description: 'Runs automated geometric, volumetric, topological, boundary, elevation, and coordinate consistency checks. ULPIN can only be generated if all pass.',
    technicalDetails: 'Checks: 1. Geometry validity, 2. Overlap detection, 3. Gap detection, 4. Cadastral boundary, 5. Floor monotonicity, 6. Topology, 7. Ground elevation, 8. Coordinates.',
    outputSummary: {
      'Overall Result': 'VALIDATED',
      'Checks Passed': '8 / 8 Checks Passed',
      'Gate Status': 'APPROVED FOR ULPIN',
      'Validation ID': 'VAL-PASS-HYD-001',
    },
    badge: 'VERIFIED',
  },
  {
    step: 11,
    title: '3D Encroachment Detection',
    subtitle: 'Identifying 2.3m Western boundary encroachment',
    category: 'ANALYTICS',
    route: '/review/encroachment',
    actionLabel: 'Inspect Encroachment',
    description: 'Detects spatial intersection where the building volume extends beyond the legal revenue parcel into neighboring parcel HYD/BH/123/5.',
    technicalDetails: 'Encroachment extent: 2.3m horizontal overhang along West face (32.2 m² affected area). Flagged legally as "POTENTIAL ENCROACHMENT".',
    outputSummary: {
      'Overhang Distance': '2.3 meters',
      'Affected Area': '32.2 m²',
      'Severity': 'HIGH SEVERITY',
      'Neighbor Parcel': 'HYD/BH/123/5',
    },
    badge: 'ENCROACHMENT',
  },
  {
    step: 12,
    title: 'Discrepancy Detection & Audit',
    subtitle: 'Detecting unpermitted 6th floor addition vs TG-bPASS permit',
    category: 'AUDIT',
    route: '/review/discrepancy',
    actionLabel: 'Review Discrepancies',
    description: 'Compares the physical 3D reality against registered building sanction drawings from the municipal TG-bPASS portal.',
    technicalDetails: 'Discrepancy: Permit sanctions Ground + 4 floors (5 levels). Reality reveals an unauthorized 6th floor (+252 m² built-up area, +3.2m height).',
    outputSummary: {
      'Sanctioned Floors': 'G + 4 Floors',
      'Physical Reality': 'G + 5 Floors + Basement',
      'Unauthorized Area': '+252.0 m²',
      'Compliance Status': 'DEVIATION DETECTED',
    },
    badge: 'DISCREPANCY',
  },
  {
    step: 13,
    title: 'Multi-Modal Confidence Scoring',
    subtitle: 'Weighted composite confidence score across 5 modalities',
    category: 'CONFIDENCE',
    route: '/analytics/confidence',
    actionLabel: 'View Confidence Matrix',
    description: 'Calculates an objective confidence index incorporating sensor noise, GNSS precision, satellite resolution, and optimization convergence.',
    technicalDetails: 'Score = 0.25*LiDAR(96%) + 0.25*Cadastral(91%) + 0.15*DEM(95%) + 0.20*QAOA(97%) + 0.15*Permit(89%) = 94.0%.',
    outputSummary: {
      'Overall Confidence': '94.0% (Tier 1)',
      'LiDAR Density Score': '96.0%',
      'QAOA Optimality Score': '97.0%',
      'Confidence Rating': 'HIGH CONFIDENCE',
    },
    badge: 'SCORING',
  },
  {
    step: 14,
    title: '3D ULPIN Official Issuance',
    subtitle: 'Bhuvan/DoLR compliant 14-character unique vertical identifier',
    category: 'IDENTIFICATION',
    route: '/officer/ulpin',
    actionLabel: 'Issue 3D ULPIN',
    description: 'Generates the permanent, tamper-resistant 3D Unique Land Parcel Identification Number for the multi-storey property.',
    technicalDetails: 'Format: IN-3D-HYD0-2024-0001. Anchored to centroid (17.4235, 78.4483), elevation span (532.5m - 555.2m MSL), and cadastral khata.',
    outputSummary: {
      '3D ULPIN': 'IN-3D-HYD0-2024-0001',
      'Issuing Body': 'DoLR, Ministry of Rural Development',
      'Jurisdiction': 'GHMC Hyderabad',
      'Status': 'ACTIVE & CERTIFIED',
    },
    badge: 'ULPIN',
  },
  {
    step: 15,
    title: 'QR Property Passport & Digital Twin',
    subtitle: 'Citizen QR passport card & interactive 3D Cesium GIS twin',
    category: 'CITIZEN & TWIN',
    route: '/officer/passport',
    actionLabel: 'Open Digital Passport',
    description: 'Final deliverable: public-verifiable QR code linking to the Property Passport, printable official card, and CesiumJS 3D digital twin.',
    technicalDetails: 'Role-based data tiering: Citizens see verification badge & units; banks verify sanctioned area; revenue officers access full 3D audit log.',
    outputSummary: {
      'QR Verification': 'Active & Signed',
      'Public URL': 'trinetra.gov.in/passport/PROP-HYD-2024-001',
      'Cesium 3D Twin': 'Ready in GIS Explorer',
      'Tiered Disclosure': '3 Access Levels',
    },
    badge: 'DELIVERABLE',
  },
]

export default function DemoMode() {
  const navigate = useNavigate()
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<number[]>([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15])
  const [isExecuting, setIsExecuting] = useState(false)

  const currentStep = DEMO_STEPS[currentStepIndex]

  const handleRunStep = () => {
    setIsExecuting(true)
    setTimeout(() => {
      setIsExecuting(false)
      if (!completedSteps.includes(currentStep.step)) {
        setCompletedSteps((prev) => [...prev, currentStep.step])
      }
      toast.success(`Step ${currentStep.step}: ${currentStep.title} simulated successfully!`)
    }, 600)
  }

  const handleNext = () => {
    if (currentStepIndex < DEMO_STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1)
    }
  }

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1)
    }
  }

  const handleResetDemo = () => {
    setCurrentStepIndex(0)
    toast.success('Demo reset to Step 1')
  }

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="card bg-gradient-to-r from-navy via-govblue to-teal text-white p-6 rounded-xl relative overflow-hidden shadow-lg">
        <div className="absolute right-0 top-0 w-96 h-full opacity-10 pointer-events-none flex items-center justify-end pr-8">
          <Sparkles className="w-64 h-64" />
        </div>
        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="badge bg-white/20 text-white font-mono text-xs uppercase tracking-wider px-2.5 py-1 rounded">
                  SIH26011 Interactive Prototype
                </span>
                <span className="badge bg-amber-400/90 text-navy font-semibold text-xs px-2.5 py-1 rounded">
                  15-Step End-to-End Workflow
                </span>
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
                TRINETRA Guided Demo Mode
              </h1>
              <p className="text-white/80 text-sm mt-1 max-w-3xl">
                Demonstrates the complete physical property to 3D ULPIN pipeline for{' '}
                <strong className="text-white font-semibold">Srinivas Commercial Complex</strong> (Banjara Hills, Hyderabad).
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleResetDemo}
                className="btn bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs px-3 py-2 rounded-lg"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1" /> Reset
              </button>
              <button
                onClick={() => navigate(currentStep.route)}
                className="btn bg-white text-navy font-semibold hover:bg-gray-100 text-xs px-4 py-2 rounded-lg shadow"
              >
                Go to Step Page <ExternalLink className="w-3.5 h-3.5 ml-1" />
              </button>
            </div>
          </div>

          {/* Quick Progress Bar */}
          <div className="mt-6 pt-4 border-t border-white/15">
            <div className="flex justify-between text-xs text-white/80 mb-2 font-medium">
              <span>Workflow Progress: Step {currentStep.step} of 15</span>
              <span>{Math.round((completedSteps.length / 15) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-black/25 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-amber-400 h-full transition-all duration-300 rounded-full"
                style={{ width: `${(completedSteps.length / 15) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Step Navigator Bar */}
      <div className="card p-3 overflow-x-auto">
        <div className="flex items-center gap-2 min-w-max">
          {DEMO_STEPS.map((s, idx) => {
            const isCurrent = idx === currentStepIndex
            const isCompleted = completedSteps.includes(s.step)
            return (
              <button
                key={s.step}
                onClick={() => setCurrentStepIndex(idx)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  isCurrent
                    ? 'bg-govblue text-white shadow-md'
                    : isCompleted
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                    : 'bg-surface text-muted hover:bg-gray-100'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle className={`w-3.5 h-3.5 ${isCurrent ? 'text-white' : 'text-emerald-600'}`} />
                ) : (
                  <span className="w-3.5 h-3.5 rounded-full bg-muted/30 flex items-center justify-center text-[10px]">
                    {s.step}
                  </span>
                )}
                <span>Step {s.step}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Main Step Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Step Narrative & Operations */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card border-govblue/30 shadow-md">
            <div className="flex items-center justify-between border-b border-border pb-4 mb-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="badge bg-govblue/10 text-govblue font-semibold text-xs">
                    STEP {currentStep.step} OF 15
                  </span>
                  <span className="badge bg-surface text-muted border border-border text-xs">
                    {currentStep.category}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-navy">{currentStep.title}</h2>
                <p className="text-xs text-muted mt-0.5">{currentStep.subtitle}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleRunStep}
                  disabled={isExecuting}
                  className="btn-primary text-xs px-4 py-2"
                >
                  <Play className="w-3.5 h-3.5" />
                  {isExecuting ? 'Processing...' : currentStep.actionLabel}
                </button>
              </div>
            </div>

            {/* Narrative */}
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted mb-1">Workflow Operation</h4>
                <p className="text-sm text-dark bg-surface p-3.5 rounded-lg border border-border/80 leading-relaxed">
                  {currentStep.description}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted mb-1">Scientific & Engineering Methodology</h4>
                <p className="text-xs font-mono text-dark bg-slate-50 p-3.5 rounded-lg border border-border/80 leading-relaxed">
                  {currentStep.technicalDetails}
                </p>
              </div>

              {/* Step Output Metrics Table */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted mb-2">Generated Output Metrics</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {Object.entries(currentStep.outputSummary).map(([label, val]) => (
                    <div key={label} className="bg-surface p-3 rounded-lg border border-border/60">
                      <div className="text-[11px] text-muted truncate">{label}</div>
                      <div className="text-sm font-semibold text-navy mt-0.5 truncate">{val}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Step Navigation Controls */}
            <div className="flex items-center justify-between pt-5 mt-6 border-t border-border">
              <button
                onClick={handlePrev}
                disabled={currentStepIndex === 0}
                className="btn-secondary text-xs"
              >
                <ChevronLeft className="w-4 h-4" /> Previous Step
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate(currentStep.route)}
                  className="btn-secondary text-xs text-govblue border-govblue/40 hover:bg-govblue/5"
                >
                  Open Dedicated Page <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={handleNext}
                  disabled={currentStepIndex === DEMO_STEPS.length - 1}
                  className="btn-primary text-xs"
                >
                  Next Step <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Property Dossier & Architecture Context */}
        <div className="space-y-6">
          {/* Property Quick Dossier Card */}
          <div className="card">
            <h3 className="text-sm font-bold text-navy flex items-center gap-2 pb-3 border-b border-border">
              <Shield className="w-4 h-4 text-govblue" />
              Demo Benchmark Property
            </h3>
            <div className="space-y-3 pt-3 text-xs">
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted">Building Name:</span>
                <span className="font-semibold text-dark">Srinivas Commercial Complex</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted">Property ID:</span>
                <span className="font-mono text-govblue font-medium">PROP-HYD-2024-001</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted">Cadastral Parcel:</span>
                <span className="font-medium text-dark">HYD/BH/123/4</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted">Location:</span>
                <span className="text-dark">Banjara Hills, Hyderabad</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted">Coordinates:</span>
                <span className="font-mono text-dark">17.4235° N, 78.4483° E</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted">Total Levels:</span>
                <span className="font-medium text-dark">7 (Basement + G + 5 Floors)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted">3D ULPIN:</span>
                <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                  IN-3D-HYD0-2024-0001
                </span>
              </div>
            </div>

            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 leading-tight flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <span>
                <strong>Demo Flags Included:</strong> Features an intentional 2.3m West encroachment and an unpermitted 6th floor addition between T1 and T2 surveys.
              </span>
            </div>
          </div>

          {/* Core Pipeline Diagram Mini */}
          <div className="card">
            <h3 className="text-sm font-bold text-navy flex items-center gap-2 pb-3 border-b border-border">
              <Activity className="w-4 h-4 text-teal" />
              Pipeline Architecture
            </h3>
            <div className="space-y-2 pt-3 text-xs">
              {[
                { name: '1. Multi-Source Fusion', status: 'Passed', color: 'text-emerald-700 bg-emerald-50' },
                { name: '2. 11-Stage Preprocessing', status: 'Passed', color: 'text-emerald-700 bg-emerald-50' },
                { name: '3. PointNet++ Extraction', status: 'Passed', color: 'text-emerald-700 bg-emerald-50' },
                { name: '4. QUBO Matrix Engine', status: 'Passed', color: 'text-indigo-700 bg-indigo-50' },
                { name: '5. Qiskit QAOA Optimization', status: 'Passed', color: 'text-purple-700 bg-purple-50' },
                { name: '6. 8-Check Validation Gate', status: 'Passed', color: 'text-emerald-700 bg-emerald-50' },
                { name: '7. 3D ULPIN Issuance', status: 'Active', color: 'text-govblue bg-govblue/10 font-bold' },
              ].map((pipe) => (
                <div key={pipe.name} className="flex items-center justify-between p-2 rounded bg-surface border border-border/50">
                  <span className="font-medium text-dark">{pipe.name}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${pipe.color}`}>
                    {pipe.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
