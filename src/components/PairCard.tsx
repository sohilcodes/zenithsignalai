'use client'
import { useState } from 'react'
import MiniChart from './MiniChart'
import RSIGauge from './RSIGauge'
import SignalBadge from './SignalBadge'
import { calcEMA } from '@/src/lib/signals'
import type { SignalType, SignalStrength, Candle } from '@/src/types'

interface PairCardProps {
  pair: string
  label: string
  flag: string
  price: number
  change: number
  changePct: number
  signal: SignalType
  strength: SignalStrength
  reason: string
  rsi: number
  ema9: number
  ema21: number
  candles: Candle[]
  isDemo?: boolean
}

export default function PairCard(props: PairCardProps) {
  const { pair, label, flag, price, change, changePct, signal, strength, reason, rsi, ema9, ema21, candles, isDemo } = props
  const [expanded, setExpanded] = useState(false)

  const closes = candles.map(c => c.close)
  const ema9arr = calcEMA(closes, 9)
  const ema21arr = calcEMA(closes, 21)

  const up = change >= 0
  const borderColor = signal === 'BUY' ? '#3fb950' : signal === 'SELL' ? '#f85149' : '#30363d'

  return (
    <div
      onClick={() => setExpanded(e => !e)}
      className="rounded-lg p-4 cursor-pointer transition-all duration-200 hover:opacity-90"
      style={{ background: '#161b22', border: `1px solid ${borderColor}`, borderLeftWidth: 3 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{flag}</span>
          <div>
            <p className="text-sm font-semibold" style={{ color: '#e6edf3' }}>{label}</p>
            {isDemo && <span className="text-xs" style={{ color: '#484f58' }}>demo</span>}
          </div>
        </div>
        <SignalBadge type={signal} strength={strength} size="sm" />
      </div>

      {/* Price */}
      <div className="flex items-baseline gap-2 mb-3">
        <span className="text-xl font-mono font-semibold" style={{ color: '#e6edf3' }}>
          {price.toFixed(pair.includes('JPY') ? 3 : 5)}
        </span>
        <span className="text-xs font-mono" style={{ color: up ? '#3fb950' : '#f85149' }}>
          {up ? '▲' : '▼'} {Math.abs(changePct).toFixed(3)}%
        </span>
      </div>

      {/* Mini Chart */}
      <div className="mb-3">
        <MiniChart candles={candles} showEMA={expanded} ema9={ema9arr} ema21={ema21arr} />
      </div>

      {/* RSI */}
      <RSIGauge rsi={rsi} />

      {/* Expanded details */}
      {expanded && (
        <div className="mt-3 pt-3" style={{ borderTop: '1px solid #21262d' }}>
          <p className="text-xs mb-2" style={{ color: '#8b949e' }}>{reason}</p>
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div style={{ color: '#8b949e' }}>EMA 9 <span style={{ color: '#58a6ff' }}>{ema9.toFixed(pair.includes('JPY') ? 3 : 5)}</span></div>
            <div style={{ color: '#8b949e' }}>EMA 21 <span style={{ color: '#e3b341' }}>{ema21.toFixed(pair.includes('JPY') ? 3 : 5)}</span></div>
            <div style={{ color: '#8b949e' }}>Cross <span style={{ color: ema9 > ema21 ? '#3fb950' : '#f85149' }}>{ema9 > ema21 ? '↑ Bullish' : '↓ Bearish'}</span></div>
            <div style={{ color: '#8b949e' }}>Expiry <span style={{ color: '#e6edf3' }}>5 min</span></div>
          </div>
        </div>
      )}

      <p className="text-xs mt-2 text-right" style={{ color: '#484f58' }}>
        {expanded ? 'Click to collapse ↑' : 'Click for details ↓'}
      </p>
    </div>
  )
}
