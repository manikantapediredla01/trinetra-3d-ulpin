import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Shield, CheckCircle, QrCode, Building, Printer,
  Download, ExternalLink, MapPin, Share2, Info, Lock
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function PropertyPassportPublic() {
  const { propertyId } = useParams()
  const navigate = useNavigate()

  const handlePrint = () => {
    window.print()
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success('Passport verification link copied to clipboard!')
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 max-w-4xl mx-auto space-y-6">
      {/* Top Government Embellishment Bar */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-navy text-white flex items-center justify-center font-bold text-lg shadow">
            🇮🇳
          </div>
          <div>
            <div className="text-[11px] font-bold tracking-wider text-muted uppercase">
              Government of India | Ministry of Rural Development
            </div>
            <h1 className="text-base font-bold text-navy">
              Department of Land Resources (DoLR) — 3D ULPIN Registry
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 print:hidden">
          <button onClick={handleShare} className="btn-secondary text-xs">
            <Share2 className="w-3.5 h-3.5 mr-1" /> Share
          </button>
          <button onClick={handlePrint} className="btn-primary text-xs">
            <Printer className="w-3.5 h-3.5 mr-1" /> Print Passport
          </button>
        </div>
      </div>

      {/* Official 3D Property Passport Certificate Card */}
      <div className="card border-2 border-govblue/30 shadow-2xl p-8 bg-white relative overflow-hidden">
        {/* Background Watermark */}
        <div className="absolute -right-16 -bottom-16 opacity-5 pointer-events-none">
          <Shield className="w-96 h-96 text-navy" />
        </div>

        <div className="relative z-10 space-y-6">
          {/* Header Ribbon */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-govblue pb-4">
            <div>
              <span className="badge-verified text-xs font-semibold px-2.5 py-1 mb-2">
                <CheckCircle className="w-3.5 h-3.5 mr-1 inline" /> OFFICIALLY VERIFIED & REGISTERED
              </span>
              <h2 className="text-2xl font-black text-navy tracking-tight mt-1">
                Srinivas Commercial Complex
              </h2>
              <p className="text-xs text-muted mt-0.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-govblue" />
                Plot 42, Road 12, Banjara Hills, Hyderabad, Telangana 500034
              </p>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-mono text-muted uppercase tracking-wider block">
                3D ULPIN IDENTIFIER
              </span>
              <span className="font-mono text-xl font-black text-govblue tracking-wide">
                IN-3D-HYD0-2024-0001
              </span>
            </div>
          </div>

          {/* Central Specification Grid & QR Code */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Left 2 Cols: Details */}
            <div className="md:col-span-2 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-surface rounded-lg">
                  <span className="text-muted block text-[11px]">Revenue Cadastral Parcel</span>
                  <span className="font-semibold text-dark text-sm block mt-0.5">
                    HYD/BH/123/4 (GHMC)
                  </span>
                </div>

                <div className="p-3 bg-surface rounded-lg">
                  <span className="text-muted block text-[11px]">Vertical Height & Levels</span>
                  <span className="font-semibold text-dark text-sm block mt-0.5">
                    7 Levels (Basement + G + 5)
                  </span>
                </div>

                <div className="p-3 bg-surface rounded-lg">
                  <span className="text-muted block text-[11px]">Total Built-up Area</span>
                  <span className="font-semibold text-dark text-sm block mt-0.5">
                    1,512.0 m² (12 Units)
                  </span>
                </div>

                <div className="p-3 bg-surface rounded-lg">
                  <span className="text-muted block text-[11px]">3D Enclosed Volume</span>
                  <span className="font-semibold text-dark text-sm block mt-0.5">
                    4,838.4 m³ (LoD-2 Model)
                  </span>
                </div>

                <div className="p-3 bg-surface rounded-lg">
                  <span className="text-muted block text-[11px]">Ground Elevation Datum</span>
                  <span className="font-mono font-bold text-dark text-sm block mt-0.5">
                    536.0 m MSL (Copernicus DEM)
                  </span>
                </div>

                <div className="p-3 bg-surface rounded-lg">
                  <span className="text-muted block text-[11px]">Composite Confidence</span>
                  <span className="font-bold text-emerald-700 text-sm block mt-0.5">
                    94.0% (Tier 1 Verified)
                  </span>
                </div>
              </div>
            </div>

            {/* Right Col: Official Verification QR */}
            <div className="flex flex-col items-center justify-center p-4 bg-slate-50 border border-border rounded-xl text-center space-y-2">
              <div className="p-2 bg-white rounded-lg border shadow-sm">
                <QrCode className="w-28 h-28 text-navy" />
              </div>
              <span className="text-[10px] font-mono text-muted uppercase tracking-wider">
                Cryptographic Seal SHA-256
              </span>
              <span className="text-[9px] font-mono text-slate-500 truncate max-w-[180px]">
                e3b0c44298fc1c149afbf4c8996fb92427
              </span>
            </div>
          </div>

          {/* Statutory Tiered Disclosure Panel */}
          <div className="pt-4 border-t border-border">
            <h4 className="text-xs font-bold uppercase tracking-wider text-navy mb-2 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-govblue" />
              Statutory Three-Tiered Disclosure Access
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded text-emerald-950">
                <div className="font-bold text-emerald-800">1. Citizen / Public Tier</div>
                <p className="text-[11px] text-emerald-900 mt-0.5">
                  ULPIN, building name, verified levels, and municipal registration status.
                </p>
              </div>

              <div className="p-2.5 bg-blue-50 border border-blue-200 rounded text-blue-950">
                <div className="font-bold text-blue-800">2. Financial Institution Tier</div>
                <p className="text-[11px] text-blue-900 mt-0.5">
                  Unit-level carpet area, TG-bPASS sanction compliance, and encumbrance logs.
                </p>
              </div>

              <div className="p-2.5 bg-purple-50 border border-purple-200 rounded text-purple-950">
                <div className="font-bold text-purple-800">3. Revenue Enforcement Tier</div>
                <p className="text-[11px] text-purple-900 mt-0.5">
                  Full 3D encroachment geometry, temporal change deltas, and court notices.
                </p>
              </div>
            </div>
          </div>

          {/* Footer Seals & Attestation */}
          <div className="pt-4 border-t border-border flex flex-wrap items-center justify-between text-[11px] text-muted gap-2">
            <div>
              Certified by: <strong>Survey & Settlement Department, Government of Telangana</strong>
            </div>
            <div className="font-mono">
              Issued: 15-JUN-2026 | Valid Through: 14-JUN-2031
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
