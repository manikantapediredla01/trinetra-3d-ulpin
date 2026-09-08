import { useState, useRef, useEffect } from 'react'
import { MessageSquare, Send, Bot, User, Loader, Map, Database } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const DEMO_RESPONSES: Record<string, string> = {
  default: "I'm the TRINETRA GIS Assistant. I can answer queries about the demo property, pipeline status, or spatial data. Try asking about the demo property, encroachments, or floor data.",
}

function getDemoResponse(query: string): string {
  const q = query.toLowerCase()
  if (q.includes('ulpin')) return '🆔 The prototype 3D ULPIN for the demo property is **IN-3D-HYD0-2024-0001**. It was generated after all 8 validation checks passed for PROP-HYD-2024-001 (Srinivas Commercial Complex, Banjara Hills, Hyderabad).'
  if (q.includes('encroach')) return '⚠️ **POTENTIAL ENCROACHMENT — AUTHORIZED REVIEW REQUIRED.** The demo property (PROP-HYD-2024-001) shows its west wall extends approximately 2.3m beyond the TGRAC HMDA cadastral parcel boundary. Detection confidence: 88%. This requires field verification by an authorized officer.'
  if (q.includes('floor') || q.includes('unit')) return '🏢 The demo property has **7 floors** (Basement + Ground + Floors 1–5) and **12 units** distributed across all levels. Floors 2–5 are residential; Ground and 1st floor are commercial; Basement is parking.'
  if (q.includes('height') || q.includes('elevation')) return '📏 Building height: **22.4m** (7 floors × 3.2m). Ground elevation: **536.0m MSL** (from COP30 DEM real data). Building extends from 532.5m (basement bottom) to 554.9m (roof) MSL.'
  if (q.includes('area') || q.includes('size')) return '📐 Building dimensions: **18m × 14m = 252 m²** per floor. Total floor area: 1,764 m² (7 floors). Parcel area: 224 m² (16m × 14m). Note: building is 2m wider than parcel — see encroachment case.'
  if (q.includes('qaoa') || q.includes('quantum')) return '⚛️ QAOA simulation ran on Qiskit Aer (classical simulator). 7 qubits (one per candidate), p=1, 1024 shots. Selected bitstring: **0001000** (Candidate C3 — Optimal). Cost: 0.089. Classical baseline: 0.089. Optimality gap: 0.000. Note: this is NOT a quantum computer — no speedup is claimed.'
  if (q.includes('data') || q.includes('real') || q.includes('synthetic')) return '📊 Data composition: ~5% real data (COP30 DEM, TGRAC HMDA cadastral, IITH LiDAR ground, GHMC buildings, TG-bPASS floor plans) + ~95% synthetic demo data. All synthetic data is clearly labeled as SYNTHETIC DEMO in the UI.'
  if (q.includes('change') || q.includes('new floor') || q.includes('t1') || q.includes('t2')) return '🔍 Change detection found **1 major change** between T1 (2022-03-15) and T2 (2026-06-01): A new 6th floor (residential, 252 m²) was added. This represents a 16.7% increase in floor area and height. Review status: PENDING.'
  if (q.includes('confidence') || q.includes('score')) return '📊 Evidence confidence for PROP-HYD-2024-001: **94%**. Breakdown: LiDAR quality (92%), GIS parcel match (87%), DEM consistency (96%), floor plan alignment (89%), validation checks (100% pass).'
  if (q.includes('hyderabad') || q.includes('location')) return '📍 Demo property location: **Banjara Hills, Hyderabad, Telangana**. Coordinates: 78.4483°E, 17.4235°N. District: Rangareddy. Zone: Zone IV (HMDA). Survey number: 123/4.'
  return DEMO_RESPONSES.default
}

export default function GISAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content: "👋 Welcome to the **TRINETRA GIS Assistant**. I can answer questions about the demo property, pipeline stages, spatial data, and more. Try asking about the ULPIN, floors, encroachment, QAOA, or data sources.",
      timestamp: new Date(),
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const send = async () => {
    if (!input.trim() || loading) return
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input, timestamp: new Date() }
    setMessages(prev => [...prev, userMsg])
    const q = input
    setInput('')
    setLoading(true)
    await new Promise(r => setTimeout(r, 600))
    const response = getDemoResponse(q)
    setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: response, timestamp: new Date() }])
    setLoading(false)
  }

  const QUICK_QUERIES = [
    'What is the 3D ULPIN?',
    'Tell me about encroachment',
    'How many floors and units?',
    'What does QAOA select?',
    'What real data is used?',
    'Change detection findings',
  ]

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <div>
        <h1 className="page-title">GIS Natural Language Assistant</h1>
        <p className="text-muted text-sm mt-1">Ask natural language questions about the property, pipeline, and spatial data</p>
      </div>

      <div className="demo-banner">
        ℹ️ Demo assistant — responses are rule-based for this prototype.
        Production version would use an LLM connected to the PostGIS query engine.
      </div>

      <div className="card flex flex-col" style={{ height: '60vh' }}>
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
          {messages.map(m => (
            <div key={m.id} className={`flex items-start gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.role === 'assistant' ? 'bg-govblue text-white' : 'bg-surface border border-border text-dark'}`}>
                {m.role === 'assistant' ? <Bot size={16} /> : <User size={16} />}
              </div>
              <div className={`max-w-lg rounded-xl px-4 py-3 text-sm leading-relaxed ${m.role === 'assistant' ? 'bg-surface border border-border text-dark' : 'bg-govblue text-white'}`}>
                {m.content.split('**').map((part, i) => (
                  i % 2 === 1 ? <strong key={i}>{part}</strong> : <span key={i}>{part}</span>
                ))}
                <div className={`text-xs mt-1 ${m.role === 'assistant' ? 'text-muted' : 'text-white/60'}`}>
                  {m.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-govblue flex items-center justify-center">
                <Bot size={16} className="text-white" />
              </div>
              <div className="bg-surface border border-border rounded-xl px-4 py-3">
                <Loader size={16} className="text-govblue animate-spin" />
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Quick queries */}
        <div className="px-4 pt-2 flex flex-wrap gap-2 border-t border-border">
          {QUICK_QUERIES.map(q => (
            <button key={q} onClick={() => { setInput(q); }} className="btn-ghost btn-sm text-xs border border-border hover:border-govblue hover:text-govblue">
              {q}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="p-4 flex gap-3">
          <input
            className="input flex-1"
            placeholder="Ask about the property, QAOA, encroachment, data sources…"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
          />
          <button onClick={send} disabled={!input.trim() || loading} className="btn-primary px-4">
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
