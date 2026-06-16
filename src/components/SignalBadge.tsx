'use client'
import { SignalType, SignalStrength } from '@/src/types'

interface Props {
  type: SignalType
  strength?: SignalStrength
  size?: 'sm' | 'md' | 'lg'
}

const colors: Record<SignalType, string> = {
  BUY: 'bg-green-900/40 text-green-400 border border-green-500/40',
  SELL: 'bg-red-900/40 text-red-400 border border-red-500/40',
  WAIT: 'bg-yellow-900/40 text-yellow-400 border border-yellow-500/40',
}

const sizes = {
  sm: 'text-xs px-2 py-0.5 rounded',
  md: 'text-sm px-3 py-1 rounded-md font-mono font-semibold tracking-wider',
  lg: 'text-xl px-5 py-2 rounded-md font-mono font-bold tracking-widest',
}

const strengthDots: Record<SignalStrength, string> = {
  HIGH: '●●●',
  MEDIUM: '●●○',
  LOW: '●○○',
}

export default function SignalBadge({ type, strength, size = 'md' }: Props) {
  return (
    <span className={`inline-flex items-center gap-2 ${colors[type]} ${sizes[size]}`}>
      {type}
      {strength && size !== 'sm' && (
        <span className="text-xs opacity-60 tracking-widest">{strengthDots[strength]}</span>
      )}
    </span>
  )
}
