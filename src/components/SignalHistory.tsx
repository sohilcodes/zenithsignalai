'use client'
import { Signal } from '@/src/types'
import SignalBadge from './SignalBadge'

interface Props { signals: Signal[] }

export default function SignalHistory({ signals }: Props) {
  if (signals.length === 0) {
    return (
      <div className="rounded-lg p-8 text-center" style={{ background: '#161b22', border: '1px solid #30363d' }}>
        <p style={{ color: '#8b949e' }}>No signals yet. Waiting for strong setups...</p>
        <p className="text-xs mt-1" style={{ color: '#484f58' }}>Only HIGH and MEDIUM confidence signals are recorded.</p>
      </div>
    )
  }

  const wins = signals.filter(s => s.result === 'WIN').length
  const losses = signals.filter(s => s.result === 'LOSS').length
  const settled = wins + losses
  const accuracy = settled > 0 ? Math.round((wins / settled) * 100) : null

  return (
    <div className="rounded-lg overflow-hidden" style={{ background: '#161b22', border: '1px solid #30363d' }}>
      {/* Stats bar */}
      {settled > 0 && (
        <div className="flex gap-6 px-4 py-3" style={{ borderBottom: '1px solid #21262d' }}>
          <div className="text-xs" style={{ color: '#8b949e' }}>
            Total <span style={{ color: '#e6edf3' }}>{signals.length}</span>
          </div>
          <div className="text-xs" style={{ color: '#8b949e' }}>
            Wins <span style={{ color: '#3fb950' }}>{wins}</span>
          </div>
          <div className="text-xs" style={{ color: '#8b949e' }}>
            Losses <span style={{ color: '#f85149' }}>{losses}</span>
          </div>
          {accuracy !== null && (
            <div className="text-xs" style={{ color: '#8b949e' }}>
              Accuracy <span style={{ color: accuracy >= 60 ? '#3fb950' : '#f85149' }}>{accuracy}%</span>
            </div>
          )}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-xs font-mono">
          <thead>
            <tr style={{ borderBottom: '1px solid #21262d' }}>
              {['Time', 'Pair', 'Signal', 'Entry', 'RSI', 'EMA Cross', 'Reason', 'Result'].map(h => (
                <th key={h} className="text-left px-4 py-2" style={{ color: '#8b949e', fontWeight: 400 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {signals.map(s => (
              <tr key={s.id} style={{ borderBottom: '1px solid #21262d' }} className="hover:bg-white/5 transition-colors">
                <td className="px-4 py-2.5" style={{ color: '#8b949e' }}>
                  {new Date(s.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </td>
                <td className="px-4 py-2.5" style={{ color: '#e6edf3' }}>{s.pair}</td>
                <td className="px-4 py-2.5">
                  <SignalBadge type={s.type} size="sm" />
                </td>
                <td className="px-4 py-2.5" style={{ color: '#e6edf3' }}>
                  {s.entry.toFixed(s.pair.includes('JPY') ? 3 : 5)}
                </td>
                <td className="px-4 py-2.5" style={{ color: s.rsi < 35 ? '#3fb950' : s.rsi > 65 ? '#f85149' : '#e6edf3' }}>
                  {s.rsi.toFixed(1)}
                </td>
                <td className="px-4 py-2.5" style={{ color: s.ema9 > s.ema21 ? '#3fb950' : '#f85149' }}>
                  {s.ema9 > s.ema21 ? '↑ Bull' : '↓ Bear'}
                </td>
                <td className="px-4 py-2.5 max-w-xs truncate" style={{ color: '#8b949e' }} title={s.reason}>
                  {s.reason}
                </td>
                <td className="px-4 py-2.5">
                  {s.result === 'WIN' && <span style={{ color: '#3fb950' }}>✓ WIN</span>}
                  {s.result === 'LOSS' && <span style={{ color: '#f85149' }}>✗ LOSS</span>}
                  {s.result === 'PENDING' && <span style={{ color: '#e3b341' }}>⏳ pending</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
