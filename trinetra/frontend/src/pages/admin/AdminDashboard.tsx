import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Shield, Users, Activity, Database, Atom,
  CheckCircle, AlertTriangle, HardDrive, Key,
  ArrowRight, RefreshCw, FileText, Lock
} from 'lucide-react'

export default function AdminDashboard() {
  const navigate = useNavigate()

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="card p-5 bg-white border-border flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge-critical text-xs font-semibold">ROOT ADMINISTRATION</span>
            <span className="badge-info text-xs font-mono">SECURITY ZONE 0</span>
          </div>
          <h1 className="text-2xl font-bold text-navy">
            TRINETRA System Administration Portal
          </h1>
          <p className="text-xs text-muted mt-0.5">
            Platform governance, user credentials, PostGIS databases, and quantum optimization engine monitoring.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/admin/health')}
            className="btn-secondary text-xs"
          >
            <Activity className="w-3.5 h-3.5 mr-1" /> System Health
          </button>
          <button
            onClick={() => navigate('/admin/users')}
            className="btn-primary text-xs"
          >
            <Users className="w-3.5 h-3.5 mr-1" /> User Directory
          </button>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <div className="text-xs text-muted font-medium">Platform Status</div>
          <div className="text-xl font-bold text-emerald-600 mt-1 flex items-center gap-1.5">
            <CheckCircle className="w-5 h-5" /> All Services Nominal
          </div>
          <div className="text-[11px] text-muted mt-1 font-mono">Uptime: 99.98% (30 days)</div>
        </div>

        <div className="card">
          <div className="text-xs text-muted font-medium">Active Registered Users</div>
          <div className="text-2xl font-black text-navy mt-1">6 Seeded Accounts</div>
          <div className="text-[11px] text-govblue mt-1">RBAC Matrix Enforced</div>
        </div>

        <div className="card">
          <div className="text-xs text-muted font-medium">Quantum Engine Jobs</div>
          <div className="text-2xl font-black text-indigo-600 mt-1">148 QAOA Circuits</div>
          <div className="text-[11px] text-muted mt-1 font-mono">Qiskit Aer Simulator</div>
        </div>

        <div className="card">
          <div className="text-xs text-muted font-medium">Audit Trail Size</div>
          <div className="text-2xl font-black text-dark mt-1">1,240 Events</div>
          <div className="text-[11px] text-emerald-700 mt-1 flex items-center gap-1 font-medium">
            <Lock className="w-3 h-3" /> SHA-256 Tamper Sealed
          </div>
        </div>
      </div>

      {/* Administration Quick Modules */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          onClick={() => navigate('/admin/users')}
          className="card-hover cursor-pointer p-5 flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-lg bg-govblue/10 text-govblue flex items-center justify-center mb-3">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-navy">User Management</h3>
            <p className="text-xs text-muted mt-1 leading-relaxed">
              Create, deactivate, or assign role-based permissions for GIS officers, planners, revenue authorities, and auditors.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs font-semibold text-govblue">
            <span>Manage Accounts</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>

        <div
          onClick={() => navigate('/admin/audit')}
          className="card-hover cursor-pointer p-5 flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center mb-3">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-navy">Security Audit Logs</h3>
            <p className="text-xs text-muted mt-1 leading-relaxed">
              Immutable ledger of all data uploads, ULPIN generations, validation overrides, and authentication attempts.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs font-semibold text-purple-700">
            <span>View Immutable Trail</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>

        <div
          onClick={() => navigate('/admin/health')}
          className="card-hover cursor-pointer p-5 flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-navy">System Health & Services</h3>
            <p className="text-xs text-muted mt-1 leading-relaxed">
              Diagnostic probes for PostGIS 16, FastAPI backend, Cesium Ion credentials, and memory allocation.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs font-semibold text-emerald-700">
            <span>Run Diagnostics</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  )
}
