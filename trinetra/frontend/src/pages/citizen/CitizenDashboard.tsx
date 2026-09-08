import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search, Shield, CheckCircle, QrCode, Building,
  FileText, Download, ExternalLink, MapPin, AlertCircle
} from 'lucide-react'

export default function CitizenDashboard() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('IN-3D-HYD0-2024-0001')
  const [foundProperty, setFoundProperty] = useState<any>({
    ulpin: 'IN-3D-HYD0-2024-0001',
    property_ref: 'PROP-HYD-2024-001',
    name: 'Srinivas Commercial Complex',
    address: 'Plot 42, Road 12, Banjara Hills, Hyderabad, Telangana 500034',
    parcel_ref: 'HYD/BH/123/4',
    levels: 'Basement + Ground + 5 Upper Floors (7 Levels)',
    total_builtup_m2: 1512.0,
    status: 'VERIFIED & REGISTERED',
    tax_status: 'PAID & UP TO DATE (GHMC 2025-26)',
    registered_owner: 'M. Srinivas Reddy & Co-owners',
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.includes('HYD') || searchQuery.includes('Srinivas') || searchQuery.includes('0001')) {
      setFoundProperty({
        ulpin: 'IN-3D-HYD0-2024-0001',
        property_ref: 'PROP-HYD-2024-001',
        name: 'Srinivas Commercial Complex',
        address: 'Plot 42, Road 12, Banjara Hills, Hyderabad, Telangana 500034',
        parcel_ref: 'HYD/BH/123/4',
        levels: 'Basement + Ground + 5 Upper Floors (7 Levels)',
        total_builtup_m2: 1512.0,
        status: 'VERIFIED & REGISTERED',
        tax_status: 'PAID & UP TO DATE (GHMC 2025-26)',
        registered_owner: 'M. Srinivas Reddy & Co-owners',
      })
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="card p-6 bg-gradient-to-r from-govblue via-teal to-emerald-700 text-white rounded-xl shadow-lg">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="badge bg-white/20 text-white font-mono text-xs uppercase px-2.5 py-1 rounded">
              Citizen Self-Service Portal
            </span>
            <span className="badge bg-white text-emerald-800 font-bold text-xs px-2.5 py-1 rounded">
              VERIFIED CITIZEN ACCESS
            </span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">
            My Properties & Vertical Title Verification
          </h1>
          <p className="text-white/80 text-sm mt-1 max-w-2xl">
            Search, verify, and view authentic 3D ULPIN property credentials, floor-level ownership units, and property passports.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mt-6 flex max-w-xl gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-muted" />
            <input
              type="text"
              placeholder="Search by 3D ULPIN, Survey Khata, or Address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 text-xs text-dark rounded-lg border-0 focus:ring-2 focus:ring-amber-400 outline-none shadow"
            />
          </div>
          <button type="submit" className="btn bg-navy text-white text-xs px-5 font-semibold rounded-lg hover:bg-black">
            Search Record
          </button>
        </form>
      </div>

      {/* Property Search Result Card */}
      {foundProperty && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-4">
            <div className="card border-govblue/30 shadow-md">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-border">
                <div>
                  <span className="badge-verified text-xs font-semibold mb-1">
                    <CheckCircle className="w-3.5 h-3.5 mr-1 inline" />
                    {foundProperty.status}
                  </span>
                  <h2 className="text-xl font-bold text-navy">{foundProperty.name}</h2>
                  <p className="text-xs text-muted flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-govblue" />
                    {foundProperty.address}
                  </p>
                </div>

                <button
                  onClick={() => navigate(`/passport/${foundProperty.property_ref}`)}
                  className="btn-primary text-xs"
                >
                  <QrCode className="w-3.5 h-3.5 mr-1" /> View Official QR Passport
                </button>
              </div>

              {/* Specification Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 text-xs">
                <div className="p-3 bg-surface rounded-lg">
                  <span className="text-muted block text-[11px]">3D ULPIN Identifier</span>
                  <span className="font-mono font-bold text-govblue text-sm block mt-0.5">
                    {foundProperty.ulpin}
                  </span>
                </div>

                <div className="p-3 bg-surface rounded-lg">
                  <span className="text-muted block text-[11px]">Revenue Cadastral Parcel</span>
                  <span className="font-medium text-dark text-sm block mt-0.5">
                    {foundProperty.parcel_ref}
                  </span>
                </div>

                <div className="p-3 bg-surface rounded-lg">
                  <span className="text-muted block text-[11px]">Vertical Dimensions</span>
                  <span className="font-medium text-dark text-sm block mt-0.5">
                    {foundProperty.levels}
                  </span>
                </div>

                <div className="p-3 bg-surface rounded-lg">
                  <span className="text-muted block text-[11px]">Total Built-Up Area</span>
                  <span className="font-bold text-dark text-sm block mt-0.5">
                    {foundProperty.total_builtup_m2} m²
                  </span>
                </div>

                <div className="p-3 bg-surface rounded-lg">
                  <span className="text-muted block text-[11px]">Registered Title Holder</span>
                  <span className="font-medium text-dark text-sm block mt-0.5">
                    {foundProperty.registered_owner}
                  </span>
                </div>

                <div className="p-3 bg-surface rounded-lg">
                  <span className="text-muted block text-[11px]">Municipal Tax Clearance</span>
                  <span className="font-semibold text-emerald-700 text-sm block mt-0.5">
                    {foundProperty.tax_status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right 4 Cols: Quick Actions & QR Passport Teaser */}
          <div className="lg:col-span-4 space-y-4">
            <div className="card text-center p-6 space-y-4">
              <div className="w-24 h-24 mx-auto bg-surface border-2 border-border p-2 rounded-xl flex items-center justify-center">
                <QrCode className="w-20 h-20 text-navy" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-navy">Digital Property QR</h4>
                <p className="text-xs text-muted mt-1">
                  Scan to verify genuine land registration on DoLR public portal.
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  onClick={() => navigate(`/passport/${foundProperty.property_ref}`)}
                  className="btn-primary w-full text-xs justify-center"
                >
                  <FileText className="w-3.5 h-3.5 mr-1" /> Open Property Passport
                </button>
                <button
                  onClick={() => navigate(`/gis/twin/${foundProperty.property_ref}`)}
                  className="btn-secondary w-full text-xs justify-center"
                >
                  <ExternalLink className="w-3.5 h-3.5 mr-1" /> View 3D Digital Twin
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
