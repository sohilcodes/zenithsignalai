'use client'
import { LineChart, Line, ResponsiveContainer, Tooltip, ReferenceLine } from 'recharts'
import { Candle } from '@/src/types'

interface Props {
  candles: Candle[]
  color?: string
  showEMA?: boolean
  ema9?: number[]
  ema21?: number[]
}

export default function MiniChart({ candles, color = '#58a6ff', showEMA = false, ema9 = [], ema21 = [] }: Props) {
  const data = candles.map((c, i) => ({
    time: c.datetime.slice(11, 16),
    price: c.close,
    ema9: ema9[i],
    ema21: ema21[i],
  }))

  const prices = candles.map(c => c.close)
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  const mid = (min + max) / 2

  const isUp = prices[prices.length - 1] >= prices[0]
  const lineColor = isUp ? '#3fb950' : '#f85149'

  return (
    <ResponsiveContainer width="100%" height={60}>
      <LineChart data={data} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
        <Tooltip
          contentStyle={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 6, fontSize: 11, color: '#e6edf3' }}
          formatter={(val: number) => [val.toFixed(5), '']}
          labelStyle={{ color: '#8b949e' }}
        />
        <Line type="monotone" dataKey="price" stroke={lineColor} strokeWidth={1.5} dot={false} />
        {showEMA && ema9.length > 0 && <Line type="monotone" dataKey="ema9" stroke="#58a6ff" strokeWidth={1} dot={false} strokeDasharray="0" />}
        {showEMA && ema21.length > 0 && <Line type="monotone" dataKey="ema21" stroke="#e3b341" strokeWidth={1} dot={false} strokeDasharray="3 2" />}
      </LineChart>
    </ResponsiveContainer>
  )
}
