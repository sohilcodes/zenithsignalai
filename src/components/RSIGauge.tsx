'use client'

interface Props { rsi: number }

export default function RSIGauge({ rsi }: Props) {
  const pct = Math.min(Math.max(rsi, 0), 100)
  const color = rsi < 30 ? '#3fb950' : rsi > 70 ? '#f85149' : rsi < 45 ? '#3fb950' : rsi > 55 ? '#f85149' : '#e3b341'
  const label = rsi < 30 ? 'Oversold' : rsi > 70 ? 'Overbought' : 'Neutral'

  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-xs" style={{ color: '#8b949e' }}>
        <span>RSI</span>
        <span style={{ color }}>{rsi.toFixed(1)} <span className="opacity-60">{label}</span></span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#21262d' }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <div className="flex justify-between text-xs" style={{ color: '#484f58' }}>
        <span>0</span><span>30</span><span>50</span><span>70</span><span>100</span>
      </div>
    </div>
  )
}
