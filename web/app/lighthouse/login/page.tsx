'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, Delete } from 'lucide-react'
import { login } from './actions'

export default function LoginPage() {
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleInput = (digit: string) => {
    if (pin.length < 4) {
      setPin(prev => prev + digit)
      setError(false)
    }
  }

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1))
    setError(false)
  }

  const handleSubmit = async (currentPin: string) => {
    if (currentPin.length !== 4) return
    
    setLoading(true)
    const result = await login(currentPin)
    if (result.success) {
      router.push('/lighthouse')
      router.refresh()
    } else {
      setError(true)
      setPin('')
      // Shake animation is handled by the error state class
      setTimeout(() => setError(false), 500)
    }
    setLoading(false)
  }

  useEffect(() => {
    if (pin.length === 4) {
      handleSubmit(pin)
    }
  }, [pin])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        handleInput(e.key)
      } else if (e.key === 'Backspace') {
        handleDelete()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [pin])

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      <div className={`max-w-xs w-full space-y-12 text-center transition-all duration-300 ${error ? 'animate-shake' : ''}`}>
        <div className="space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-zinc-900 border border-white/5 shadow-2xl mb-2">
            <Lock className="w-10 h-10 text-white" />
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tighter uppercase font-space">Lighthouse</h1>
            <p className="text-zinc-500 text-[10px] font-mono tracking-[0.3em] uppercase">Private Access Terminal</p>
          </div>
        </div>

        <div className="flex gap-5 justify-center py-4">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full border-2 transition-all duration-300 ${
                pin.length > i 
                  ? 'bg-white border-white scale-125 shadow-[0_0_15px_rgba(255,255,255,0.5)]' 
                  : 'bg-transparent border-zinc-800'
              } ${error ? 'bg-red-500 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]' : ''}`}
            />
          ))}
        </div>

        <div className="grid grid-cols-3 gap-4 w-full max-w-[280px] mx-auto">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleInput(num.toString())}
              disabled={loading}
              className="h-16 rounded-2xl bg-zinc-900/40 hover:bg-zinc-800/60 border border-white/5 text-2xl font-mono transition-all active:scale-90 disabled:opacity-50 backdrop-blur-sm"
            >
              {num}
            </button>
          ))}
          <div className="h-16" />
          <button
            onClick={() => handleInput('0')}
            disabled={loading}
            className="h-16 rounded-2xl bg-zinc-900/40 hover:bg-zinc-800/60 border border-white/5 text-2xl font-mono transition-all active:scale-90 disabled:opacity-50 backdrop-blur-sm"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="h-16 rounded-2xl bg-zinc-900/40 hover:bg-zinc-800/60 border border-white/5 flex items-center justify-center transition-all active:scale-90 disabled:opacity-50 backdrop-blur-sm"
          >
            <Delete className="w-7 h-7 text-zinc-500" />
          </button>
        </div>

        {error && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <p className="text-red-500/20 text-8xl font-black uppercase tracking-tighter opacity-10 select-none">Access Denied</p>
          </div>
        )}
      </div>
      
      <div className="mt-20 text-[10px] font-mono text-zinc-700 uppercase tracking-widest animate-pulse">
        System Standing By
      </div>
    </div>
  )
}
