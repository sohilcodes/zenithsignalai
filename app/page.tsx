'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import PairCard from '@/src/components/PairCard'
import SignalHistory from '@/src/components/SignalHistory'
import SignalBadge from '@/src/components/SignalBadge'
import { Signal, SignalType } from '@/src/types'

interface PairResult {
  pair: string
  label: string
  flag: string
  price: number
  change: number
  changePct: number
  signal: SignalType
  strength: 'HIGH' | 'MEDIUM' | 'LOW'
  reason: string
  rsi: number
  ema9: number
  ema21: number
  candles: any[]
  signalRecord: Signal | null
  isDemo: boolean
}

const REFRESH_INTERVAL = 60 // seconds

export default function Dashboard() {
  const [data, setData] = useState<PairResult[]>([])
  const [history, setHistory] = useState<Signal[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<string>('')
  const [countdown, setCountdown] = useState(REFRESH_INTERVAL)
  const [filter, setFilter] = useState<'ALL' | SignalType>('ALL')
  const [isDemo, setIsDemo] = useState(false)
  const timerRef = useRef<NodeJS.Timeout>()
  const countRef = useRef<NodeJS.Timeout>()

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/signals')
      const json = await res.json()
      const results: PairResult[] = json.data

      setData(results)
      setIsDemo(results.some(r => r.isDemo))
      setLastUpdate(new Date().toLocaleTimeString('en-IN'))
      setCountdown(REFRESH_INTERVAL)

      // Add new signals to history (no duplicates by id)
      const newSignals = results
        .filter(r => r.signalRecord && (r.strength === 'HIGH' || r.strength === 'MEDIUM'))
        .map(r => r.signalRecord!)

      if (newSignals.length > 0) {
        setHistory(prev => {
          const existingIds = new Set(prev.map(s => s.id))
          const fresh = newSignals.filter(s => !existingIds.has(s.id))
          return [...fresh, ...prev].slice(0, 50)
        })
      }
    } catch (e) {
      console.error('Fetch error', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    timerRef.current = setInterval(fetchData, REFRESH_INTERVAL * 1000)
    countRef.current = setInterval(() => setCountdown(c => Math.max(0, c - 1)), 1000)
    return () => {
      clearInterval(timerRef.current)
      clearInterval(countRef.current)
    }
  }, [fetchData])

  const filtered = filter === 'ALL' ? data : data.filter(d => d.signal === filter)
  const buyCount = data.filter(d => d.signal === 'BUY').length
  const sellCount = data.filter(d => d.signal === 'SELL').length
  const waitCount = data.filter(d => d.signal === 'WAIT').length
  const highCount = data.filter(d => d.strength === 'HIGH' && d.signal !== 'WAIT').length

  return (
    <div className="min-h-screen" style={{ background: '#0d1117' }}>
      {/* Top Nav */}
      <nav className="sticky top-0 z-10 px-6 py-3 flex items-center justify-between" style={{ background: '#0d1117cc', backdropFilter: 'blur(8px)', borderBottom: '1px solid #21262d' }}>
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#3fb950' }} />
          <span className="text-sm font-semibold" style={{ color: '#e6edf3' }}>SIGNAL DASHBOARD</span>
          {isDemo && (
            <span className="text-xs px-2 py-0.5 rounded" style={{ background: '#21262d', color: '#e3b341', border: '1px solid #e3b341' }}>DEMO</span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs" style={{ color: '#8b949e' }}>
            Updated: <span style={{ color: '#e6edf3' }}>{lastUpdate || '—'}</span>
          </span>
          <span className="text-xs" style={{ color: '#8b949e' }}>
            Refresh in <span style={{ color: countdown < 10 ? '#e3b341' : '#58a6ff' }}>{countdown}s</span>
          </span>
          <button
            onClick={fetchData}
            className="text-xs px-3 py-1 rounded"
            style={{ background: '#21262d', color: '#8b949e', border: '1px solid #30363d' }}
          >
            ↻ Refresh
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats row */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { label: 'BUY signals', value: buyCount, color: '#3fb950' },
            { label: 'SELL signals', value: sellCount, color: '#f85149' },
            { label: 'WAIT', value: waitCount, color: '#8b949e' },
            { label: 'HIGH confidence', value: highCount, color: '#e3b341' },
          ].map(stat => (
            <div key={stat.label} className="rounded-lg p-4" style={{ background: '#161b22', border: '1px solid #30363d' }}>
              <p className="text-xs mb-1" style={{ color: '#8b949e' }}>{stat.label}</p>
              <p className="text-2xl font-mono font-semibold" style={{ color: stat.color }}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6">
          {(['ALL', 'BUY', 'SELL', 'WAIT'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="text-xs px-4 py-1.5 rounded-full font-mono transition-all"
              style={{
                background: filter === f ? '#21262d' : 'transparent',
                color: filter === f ? '#e6edf3' : '#8b949e',
                border: `1px solid ${filter === f ? '#58a6ff' : '#30363d'}`,
              }}
            >
              {f} {f !== 'ALL' && `(${f === 'BUY' ? buyCount : f === 'SELL' ? sellCount : waitCount})`}
            </button>
          ))}
        </div>

        {/* Pair cards grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-lg h-52 animate-pulse" style={{ background: '#161b22' }} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {filtered.map(pair => (
              <PairCard key={pair.pair} {...pair} />
            ))}
          </div>
        )}

        {/* Signal History */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold" style={{ color: '#8b949e' }}>
              SIGNAL HISTORY <span style={{ color: '#484f58' }}>({history.length})</span>
            </h2>
            {history.length > 0 && (
              <button
                onClick={() => setHistory([])}
                className="text-xs" style={{ color: '#484f58' }}
              >
                Clear
              </button>
            )}
          </div>
          <SignalHistory signals={history} />
        </div>

        {/* Footer disclaimer */}
        <p className="text-center text-xs mt-8" style={{ color: '#484f58' }}>
          Made for Zenith Trader Coded By Sohil Khan.
        </p>
      </div>
    </div>
  )
    }
            
