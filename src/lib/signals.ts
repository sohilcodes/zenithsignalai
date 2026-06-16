import { Candle, Signal, SignalType, SignalStrength, Indicators, PairData } from '@/src/types'

export function calcEMA(data: number[], period: number): number[] {
  if (data.length < period) return data.map(() => data[0])
  const k = 2 / (period + 1)
  const ema: number[] = [data.slice(0, period).reduce((a, b) => a + b, 0) / period]
  for (let i = period; i < data.length; i++) {
    ema.push(data[i] * k + ema[ema.length - 1] * (1 - k))
  }
  const padding = new Array(period - 1).fill(ema[0])
  return [...padding, ...ema]
}

export function calcRSI(data: number[], period = 14): number {
  if (data.length < period + 1) return 50
  const changes = data.slice(1).map((v, i) => v - data[i])
  const gains = changes.map(c => Math.max(c, 0))
  const losses = changes.map(c => Math.max(-c, 0))
  let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period
  let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period
  for (let i = period; i < changes.length; i++) {
    avgGain = (avgGain * (period - 1) + gains[i]) / period
    avgLoss = (avgLoss * (period - 1) + losses[i]) / period
  }
  if (avgLoss === 0) return 100
  return parseFloat((100 - 100 / (1 + avgGain / avgLoss)).toFixed(2))
}

export function generateSignal(indicators: Indicators, pair: string): { type: SignalType; strength: SignalStrength; reason: string } {
  const { rsi, ema9, ema21 } = indicators
  const bullCross = ema9 > ema21
  const bearCross = ema9 < ema21
  const crossGap = Math.abs(ema9 - ema21) / ema21 * 100

  if (rsi < 30 && bullCross && crossGap > 0.01)
    return { type: 'BUY', strength: 'HIGH', reason: `RSI oversold (${rsi.toFixed(1)}) + strong EMA bullish crossover` }
  if (rsi > 70 && bearCross && crossGap > 0.01)
    return { type: 'SELL', strength: 'HIGH', reason: `RSI overbought (${rsi.toFixed(1)}) + strong EMA bearish crossover` }
  if (rsi < 40 && bullCross)
    return { type: 'BUY', strength: 'MEDIUM', reason: `RSI low (${rsi.toFixed(1)}) + EMA bullish trend` }
  if (rsi > 60 && bearCross)
    return { type: 'SELL', strength: 'MEDIUM', reason: `RSI high (${rsi.toFixed(1)}) + EMA bearish trend` }
  if (rsi < 35 && rsi > 30)
    return { type: 'BUY', strength: 'LOW', reason: `RSI approaching oversold (${rsi.toFixed(1)})` }
  if (rsi > 65 && rsi < 70)
    return { type: 'SELL', strength: 'LOW', reason: `RSI approaching overbought (${rsi.toFixed(1)})` }

  return { type: 'WAIT', strength: 'LOW', reason: `No clear setup. RSI: ${rsi.toFixed(1)}, EMA trend: ${bullCross ? 'bullish' : 'bearish'}` }
}

export function processCandles(candles: Candle[], pair: string): { indicators: Indicators; signal: ReturnType<typeof generateSignal> } {
  const closes = candles.map(c => c.close)
  const rsi = calcRSI(closes)
  const ema9arr = calcEMA(closes, 9)
  const ema21arr = calcEMA(closes, 21)
  const ema50arr = calcEMA(closes, 50)

  const indicators: Indicators = {
    rsi,
    ema9: ema9arr[ema9arr.length - 1],
    ema21: ema21arr[ema21arr.length - 1],
    ema50: ema50arr[ema50arr.length - 1],
  }
  const signal = generateSignal(indicators, pair)
  return { indicators, signal }
}

export function buildSignalRecord(pair: string, price: number, indicators: Indicators, sig: ReturnType<typeof generateSignal>): Signal {
  return {
    id: `${pair}-${Date.now()}`,
    pair,
    type: sig.type,
    strength: sig.strength,
    entry: price,
    rsi: indicators.rsi,
    ema9: indicators.ema9,
    ema21: indicators.ema21,
    reason: sig.reason,
    timestamp: new Date().toISOString(),
    result: 'PENDING',
    expiry: 5,
  }
}

// Generate mock candles for demo/fallback
export function generateMockCandles(pair: string, count = 60): Candle[] {
  const bases: Record<string, number> = {
    'CHF/JPY': 175.5, 'EUR/USD': 1.085, 'GBP/USD': 1.271,
    'USD/JPY': 157.2, 'AUD/USD': 0.652, 'EUR/GBP': 0.853,
  }
  let price = bases[pair] ?? 1.0
  const candles: Candle[] = []
  const now = new Date()

  for (let i = count; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 5 * 60 * 1000)
    const volatility = price * 0.0008
    const change = (Math.random() - 0.48) * volatility
    const open = price
    price = parseFloat((price + change).toFixed(5))
    const high = parseFloat((Math.max(open, price) + Math.random() * volatility * 0.5).toFixed(5))
    const low = parseFloat((Math.min(open, price) - Math.random() * volatility * 0.5).toFixed(5))
    candles.push({
      datetime: time.toISOString().slice(0, 16).replace('T', ' '),
      open, high, low, close: price,
    })
  }
  return candles
    }
  
