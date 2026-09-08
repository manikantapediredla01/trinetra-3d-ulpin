import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

// Layouts
import PublicLayout from '@/layouts/PublicLayout'
import OfficerLayout from '@/layouts/OfficerLayout'
import AdminLayout from '@/layouts/AdminLayout'
import GISLayout from '@/layouts/GISLayout'
import CitizenLayout from '@/layouts/CitizenLayout'

// Public Pages
import LandingPage from '@/pages/public/LandingPage'
import LoginPage from '@/pages/public/LoginPage'
import PropertyPassportPublic from '@/pages/public/PropertyPassportPublic'

// Officer Pages
import OfficerDashboard from '@/pages/officer/OfficerDashboard'
import DataIngestion from '@/pages/officer/DataIngestion'
import ProcessingPipeline from '@/pages/officer/ProcessingPipeline'
import AIExtraction from '@/pages/officer/AIExtraction'
import CandidateGeneration from '@/pages/officer/CandidateGeneration'
import QUBOWorkbench from '@/pages/officer/QUBOWorkbench'
import QAOAWorkbench from '@/pages/officer/QAOAWorkbench'
import ValidationPage from '@/pages/officer/ValidationPage'

// GIS Pages
import GISExplorer from '@/pages/gis/GISExplorer'
import DigitalTwin from '@/pages/gis/DigitalTwin'
import UtilityLayers from '@/pages/gis/UtilityLayers'
import ChangeDetection from '@/pages/gis/ChangeDetection'

// Review Pages
import EncroachmentReview from '@/pages/review/EncroachmentReview'
import DiscrepancyReview from '@/pages/review/DiscrepancyReview'
import ValidationReview from '@/pages/review/ValidationReview'

// Admin Pages
import AdminDashboard from '@/pages/admin/AdminDashboard'
import UserManagement from '@/pages/admin/UserManagement'
import AuditLogs from '@/pages/admin/AuditLogs'
import SystemHealth from '@/pages/admin/SystemHealth'

// Analytics
import ConfidenceAnalytics from '@/pages/analytics/ConfidenceAnalytics'
import QAOABenchmark from '@/pages/analytics/QAOABenchmark'
import ChangeAnalytics from '@/pages/analytics/ChangeAnalytics'

// Assistant
import GISAssistant from '@/pages/assistant/GISAssistant'

// ULPIN / Passport
import ULPINGeneration from '@/pages/officer/ULPINGeneration'
import PassportPage from '@/pages/officer/PassportPage'

// Citizen
import CitizenDashboard from '@/pages/citizen/CitizenDashboard'

// Authority
import AuthorityDashboard from '@/pages/authority/AuthorityDashboard'

// Demo
import DemoMode from '@/pages/demo/DemoMode'

interface ProtectedRouteProps {
  children: React.ReactNode
  roles?: string[]
}

function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (roles && user && !roles.includes(user.role)) return <Navigate to="/unauthorized" replace />
  return <>{children}</>
}

export default function App() {
  const { isAuthenticated, user } = useAuthStore()

  return (
    <Routes>
      {/* ── Public ── */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={
          isAuthenticated ? <Navigate to={user?.dashboard_route || '/officer/dashboard'} replace /> : <LoginPage />
        } />
        <Route path="/passport/:propertyId" element={<PropertyPassportPublic />} />
        <Route path="/unauthorized" element={
          <div className="flex items-center justify-center min-h-screen">
            <div className="card text-center p-8">
              <h2 className="text-xl font-bold text-critical mb-2">Access Denied</h2>
              <p className="text-muted">You do not have permission to access this page.</p>
            </div>
          </div>
        } />
      </Route>

      {/* ── Officer ── */}
      <Route element={<ProtectedRoute roles={['survey_gis_officer']}><OfficerLayout /></ProtectedRoute>}>
        <Route path="/officer/dashboard" element={<OfficerDashboard />} />
        <Route path="/officer/ingestion" element={<DataIngestion />} />
        <Route path="/officer/preprocessing" element={<ProcessingPipeline />} />
        <Route path="/officer/extraction" element={<AIExtraction />} />
        <Route path="/officer/candidates" element={<CandidateGeneration />} />
        <Route path="/officer/qubo" element={<QUBOWorkbench />} />
        <Route path="/officer/qaoa" element={<QAOAWorkbench />} />
        <Route path="/officer/validation" element={<ValidationPage />} />
        <Route path="/officer/ulpin" element={<ULPINGeneration />} />
        <Route path="/officer/passport" element={<PassportPage />} />
      </Route>

      {/* ── GIS (officer + planner + authority) ── */}
      <Route element={
        <ProtectedRoute roles={['survey_gis_officer', 'urban_infrastructure_planner', 'land_record_authority', 'system_administrator']}>
          <GISLayout />
        </ProtectedRoute>
      }>
        <Route path="/gis/explorer" element={<GISExplorer />} />
        <Route path="/gis/twin/:propertyId?" element={<DigitalTwin />} />
        <Route path="/gis/utilities" element={<UtilityLayers />} />
        <Route path="/gis/change-detection" element={<ChangeDetection />} />
      </Route>

      {/* ── Review ── */}
      <Route element={
        <ProtectedRoute roles={['authorized_reviewer', 'land_record_authority', 'system_administrator']}>
          <OfficerLayout />
        </ProtectedRoute>
      }>
        <Route path="/reviewer/dashboard" element={<AuthorityDashboard />} />
        <Route path="/review/encroachment" element={<EncroachmentReview />} />
        <Route path="/review/discrepancy" element={<DiscrepancyReview />} />
        <Route path="/review/validation" element={<ValidationReview />} />
      </Route>

      {/* ── Admin ── */}
      <Route element={<ProtectedRoute roles={['system_administrator']}><AdminLayout /></ProtectedRoute>}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<UserManagement />} />
        <Route path="/admin/audit" element={<AuditLogs />} />
        <Route path="/admin/health" element={<SystemHealth />} />
      </Route>

      {/* ── Analytics ── */}
      <Route element={
        <ProtectedRoute roles={['survey_gis_officer', 'land_record_authority', 'system_administrator']}>
          <OfficerLayout />
        </ProtectedRoute>
      }>
        <Route path="/analytics/confidence" element={<ConfidenceAnalytics />} />
        <Route path="/analytics/qaoa" element={<QAOABenchmark />} />
        <Route path="/analytics/changes" element={<ChangeAnalytics />} />
      </Route>

      {/* ── Authority ── */}
      <Route element={<ProtectedRoute roles={['land_record_authority']}><OfficerLayout /></ProtectedRoute>}>
        <Route path="/authority/dashboard" element={<AuthorityDashboard />} />
      </Route>

      {/* ── Planner ── */}
      <Route element={
        <ProtectedRoute roles={['urban_infrastructure_planner']}><GISLayout /></ProtectedRoute>
      }>
        <Route path="/planner/dashboard" element={<GISExplorer />} />
      </Route>

      {/* ── Assistant ── */}
      <Route element={<ProtectedRoute><OfficerLayout /></ProtectedRoute>}>
        <Route path="/assistant" element={<GISAssistant />} />
      </Route>

      {/* ── Citizen ── */}
      <Route element={<ProtectedRoute roles={['authorized_citizen']}><CitizenLayout /></ProtectedRoute>}>
        <Route path="/citizen/dashboard" element={<CitizenDashboard />} />
      </Route>

      {/* ── Demo ── */}
      <Route element={<ProtectedRoute><OfficerLayout /></ProtectedRoute>}>
        <Route path="/demo" element={<DemoMode />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
