import { NextRequest, NextResponse } from 'next/server'
import { processCandles, buildSignalRecord, generateMockCandles } from '@/src/lib/signals'
import { Candle, PAIRS } from '@/src/types'

async function fetchTwelveData(symbol: string, apiKey: string): Promise<Candle[]> {
  const url = `https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(symbol)}&interval=5min&outputsize=60&apikey=${apiKey}`
  const res = await fetch(url, { next: { revalidate: 60 } })
  const json = await res.json()
  if (json.status === 'error' || !json.values) throw new Error(json.message ?? 'API error')
  return (json.values as Array<{ datetime: string; open: string; high: string; low: string; close: string }>)
    .reverse()
    .map(v => ({
      datetime: v.datetime,
      open: parseFloat(v.open),
      high: parseFloat(v.high),
      low: parseFloat(v.low),
      close: parseFloat(v.close),
    }))
}

export async function GET(req: NextRequest) {
  const apiKey = process.env.TWELVE_DATA_API_KEY ?? ''
  const useMock = !apiKey || apiKey === 'demo'
  const results = []

  for (const pair of PAIRS) {
    try {
      const candles = useMock
        ? generateMockCandles(pair.symbol)
        : await fetchTwelveData(pair.symbol, apiKey)

      const { indicators, signal } = processCandles(candles, pair.symbol)
      const price = candles[candles.length - 1].close
      const prevPrice = candles[candles.length - 2]?.close ?? price
      const change = parseFloat((price - prevPrice).toFixed(5))
      const changePct = parseFloat(((change / prevPrice) * 100).toFixed(3))

      const signalRecord = signal.type !== 'WAIT'
        ? buildSignalRecord(pair.symbol, price, indicators, signal)
        : null

      results.push({
        pair: pair.symbol,
        label: pair.label,
        flag: pair.flag,
        price,
        change,
        changePct,
        signal: signal.type,
        strength: signal.strength,
        reason: signal.reason,
        rsi: indicators.rsi,
        ema9: parseFloat(indicators.ema9.toFixed(5)),
        ema21: parseFloat(indicators.ema21.toFixed(5)),
        ema50: parseFloat(indicators.ema50.toFixed(5)),
        candles: candles.slice(-30),
        signalRecord,
        lastUpdated: new Date().toISOString(),
        isDemo: useMock,
      })
    } catch (err) {
      const candles = generateMockCandles(pair.symbol)
      const { indicators, signal } = processCandles(candles, pair.symbol)
      const price = candles[candles.length - 1].close
      results.push({
        pair: pair.symbol,
        label: pair.label,
        flag: pair.flag,
        price,
        change: 0,
        changePct: 0,
        signal: signal.type,
        strength: signal.strength,
        reason: signal.reason,
        rsi: indicators.rsi,
        ema9: indicators.ema9,
        ema21: indicators.ema21,
        ema50: indicators.ema50,
        candles: candles.slice(-30),
        signalRecord: null,
        lastUpdated: new Date().toISOString(),
        isDemo: true,
        error: String(err),
      })
    }
  }

  return NextResponse.json({ data: results, timestamp: new Date().toISOString() })
        }
