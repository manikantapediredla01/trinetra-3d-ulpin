import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff, Shield, AlertCircle, Lock, User } from 'lucide-react'
import toast from 'react-hot-toast'
import { authApi } from '@/services/api'
import { useAuthStore } from '@/store/authStore'
import { clsx } from 'clsx'

const DEMO_ACCOUNTS = [
  { username: 'admin.trinetra', password: 'Trinetra@Admin2024', role: 'System Administrator', color: 'bg-navy/10 text-navy' },
  { username: 'land.authority', password: 'Trinetra@LandAuth2024', role: 'Land Record Authority', color: 'bg-govblue/10 text-govblue' },
  { username: 'gis.officer', password: 'Trinetra@GIS2024', role: 'Survey / GIS Officer', color: 'bg-teal/10 text-teal' },
  { username: 'urban.planner', password: 'Trinetra@Urban2024', role: 'Urban/Infra Planner', color: 'bg-indigo-50 text-indigo-700' },
  { username: 'review.officer', password: 'Trinetra@Review2024', role: 'Authorized Reviewer', color: 'bg-warning/10 text-warning' },
  { username: 'citizen.demo', password: 'Trinetra@Citizen2024', role: 'Authorized Citizen', color: 'bg-surface text-muted' },
]

export default function LoginPage() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [organization, setOrganization] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberSession, setRememberSession] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const executeLogin = async (userToLogin: string, pwdToLogin: string) => {
    if (!userToLogin.trim() || !pwdToLogin.trim()) {
      setError('Username and password are required.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const { data } = await authApi.login(userToLogin.trim(), pwdToLogin, organization || undefined)
      setAuth(
        {
          id: '',
          username: data.username,
          full_name: data.full_name,
          role: data.role,
          organization: null,
          department: null,
          is_demo: data.is_demo,
          last_login: null,
          dashboard_route: data.dashboard_route,
        },
        data.access_token,
        data.refresh_token,
      )
      toast.success(`Welcome, ${data.full_name || data.username}`)
      navigate(data.dashboard_route || '/officer/dashboard')
    } catch (err: any) {
      const msg = err?.response?.data?.detail || 'Login failed. Please check your credentials.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    await executeLogin(username, password)
  }

  const quickLogin = (u: string, pwd: string, autoSubmit = false) => {
    setUsername(u)
    setPassword(pwd)
    if (autoSubmit) {
      executeLogin(u, pwd)
    } else {
      toast.success(`Demo credentials filled for ${u}`)
    }
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Header */}
      <header className="bg-navy px-6 py-4 flex items-center gap-3">
        <div className="w-9 h-9 bg-teal rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">T3</span>
        </div>
        <div>
          <div className="text-white font-bold tracking-wide">TRINETRA</div>
          <div className="text-white/50 text-xs">3D ULPIN & Property Intelligence Platform</div>
        </div>
        <div className="ml-auto text-white/30 text-xs text-right">
          SIH26011<br />Department of Land Resources
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-4xl grid lg:grid-cols-2 gap-8">

          {/* ── Login Form ── */}
          <div className="card shadow-panel">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-govblue/10 rounded-lg flex items-center justify-center">
                <Lock size={20} className="text-govblue" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-navy">Secure Login</h1>
                <p className="text-muted text-xs">Access controlled by role and authorization</p>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="label">Username</label>
                <div className="relative">
                  <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                  <input
                    className="input pl-9"
                    placeholder="Enter your username"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    autoComplete="username"
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="input pl-9 pr-10"
                    placeholder="Enter your password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    autoComplete="current-password"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-dark"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="label">Organization / Department <span className="text-muted/50 font-normal">(optional)</span></label>
                <input
                  className="input"
                  placeholder="e.g. TGRAC, GHMC, Survey of India"
                  value={organization}
                  onChange={e => setOrganization(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberSession}
                    onChange={e => setRememberSession(e.target.checked)}
                    className="rounded border-border text-govblue"
                  />
                  <span className="text-muted text-xs">Remember session</span>
                </label>
                <button type="button" className="text-govblue text-xs hover:underline">
                  Forgot password?
                </button>
              </div>

              {error && (
                <div className="flex items-start gap-2 p-3 bg-critical/5 border border-critical/20 rounded text-xs text-critical">
                  <AlertCircle size={14} className="shrink-0 mt-0.5" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full justify-center py-2.5"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Authenticating…
                  </span>
                ) : (
                  <>
                    <Shield size={16} />
                    Secure Login
                  </>
                )}
              </button>
            </form>

            <div className="mt-4 text-center">
              <Link to="/" className="text-xs text-muted hover:text-govblue">← Back to Home</Link>
            </div>
          </div>

          {/* ── Demo Accounts ── */}
          <div className="space-y-4">
            <div className="demo-banner">
              <Shield size={14} className="text-amber-600" />
              <span>DEMONSTRATION ENVIRONMENT — Role-based access enforced</span>
            </div>

            <div className="card">
              <h2 className="section-title text-sm mb-4">
                <User size={16} className="text-govblue" />
                Demo Accounts
              </h2>
              <p className="text-xs text-muted mb-4">
                Click any demo account below to auto-fill credentials or sign in instantly with one click.
              </p>
              <div className="space-y-2.5">
                {DEMO_ACCOUNTS.map(({ username: u, password: p, role, color }) => (
                  <div
                    key={u}
                    className={clsx(
                      'p-2.5 rounded-lg border border-border transition-all',
                      'hover:border-govblue/40 hover:shadow-card bg-white',
                      username === u && 'border-govblue bg-govblue/5'
                    )}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className={clsx('px-2 py-0.5 rounded text-xs font-mono font-medium', color)}>
                        {u}
                      </div>
                      <div className="text-xs font-medium text-navy">{role}</div>
                    </div>
                    <div className="flex items-center justify-between gap-2 text-xs pt-1 border-t border-border/40">
                      <div className="flex items-center gap-1.5 text-muted">
                        <span>Password:</span>
                        <code className="px-1.5 py-0.5 bg-surface text-navy font-mono text-[11px] rounded font-semibold border border-border/60">
                          {p}
                        </code>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => quickLogin(u, p, false)}
                          className="px-2 py-1 text-[11px] rounded border border-border hover:border-govblue hover:text-govblue font-medium transition-colors"
                        >
                          Fill
                        </button>
                        <button
                          type="button"
                          onClick={() => quickLogin(u, p, true)}
                          className="px-2.5 py-1 text-[11px] rounded bg-govblue text-white hover:bg-govblue/90 font-medium transition-colors"
                        >
                          Sign In →
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-3 bg-surface rounded border border-border text-xs text-muted">
                <strong className="text-dark">💡 Tip:</strong> Click <strong>Sign In →</strong> next to any account above for immediate role-based dashboard access, or click <strong>Fill</strong> to inspect the credentials.
              </div>
            </div>

            {/* Role permissions summary */}
            <div className="card text-xs">
              <div className="font-semibold text-navy mb-3">Role Access Summary</div>
              {[
                { role: 'admin.trinetra', access: 'Full system access — users, audit, settings' },
                { role: 'gis.officer', access: 'Upload data, run pipeline, generate ULPIN' },
                { role: 'land.authority', access: 'Review, approve/reject, inspect evidence' },
                { role: 'urban.planner', access: 'View 3D GIS, buildings, utilities (read-only)' },
                { role: 'review.officer', access: 'Review encroachment and discrepancy cases' },
                { role: 'citizen.demo', access: 'Search property, view permitted passport only' },
              ].map(({ role, access }) => (
                <div key={role} className="flex items-start gap-2 py-1.5 border-b border-border/50 last:border-0">
                  <code className="text-govblue font-mono text-xs shrink-0">{role}</code>
                  <span className="text-muted">{access}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
