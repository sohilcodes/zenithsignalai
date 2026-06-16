export type SignalType = 'BUY' | 'SELL' | 'WAIT'
export type SignalStrength = 'HIGH' | 'MEDIUM' | 'LOW'

export interface Candle {
  datetime: string
  open: number
  high: number
  low: number
  close: number
  volume?: number
}

export interface Indicators {
  rsi: number
  ema9: number
  ema21: number
  ema50: number
}

export interface Signal {
  id: string
  pair: string
  type: SignalType
  strength: SignalStrength
  entry: number
  rsi: number
  ema9: number
  ema21: number
  reason: string
  timestamp: string
  result?: 'WIN' | 'LOSS' | 'PENDING'
  expiry?: number
}

export interface PairData {
  pair: string
  label: string
  price: number
  change: number
  changePct: number
  signal: SignalType
  strength: SignalStrength
  rsi: number
  ema9: number
  ema21: number
  candles: Candle[]
  lastUpdated: string
}

export const PAIRS = [
  { symbol: 'CHF/JPY', label: 'CHF/JPY', flag: '🇨🇭🇯🇵' },
  { symbol: 'EUR/USD', label: 'EUR/USD', flag: '🇪🇺🇺🇸' },
  { symbol: 'GBP/USD', label: 'GBP/USD', flag: '🇬🇧🇺🇸' },
  { symbol: 'USD/JPY', label: 'USD/JPY', flag: '🇺🇸🇯🇵' },
  { symbol: 'AUD/USD', label: 'AUD/USD', flag: '🇦🇺🇺🇸' },
  { symbol: 'EUR/GBP', label: 'EUR/GBP', flag: '🇪🇺🇬🇧' },
]
