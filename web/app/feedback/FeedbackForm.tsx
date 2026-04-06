'use client'

import { useState } from 'react'

type FeedbackType = 'bug' | 'suggestion' | 'general'

export default function FeedbackForm() {
  const [type, setType] = useState<FeedbackType>('general')
  const [message, setMessage] = useState('')
  const [name, setName] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return

    setStatus('loading')
    setErrorMsg('')

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, message, name }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Something went wrong')
      }

      setStatus('success')
      setMessage('')
      setName('')
      setType('general')
    } catch (err: any) {
      setStatus('error')
      setErrorMsg(err.message)
    }
  }

  if (status === 'success') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <h1 className="font-space text-2xl font-bold tracking-tighter uppercase mb-2">Sent. Thanks.</h1>
        <button 
          onClick={() => setStatus('idle')}
          className="font-mono text-xs uppercase tracking-widest text-zinc-500 hover:text-white transition-colors"
        >
          Send another?
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Type Selector */}
      <div className="space-y-4">
        <label className="font-mono text-[10px] text-zinc-600 uppercase tracking-widest block">Select Category</label>
        <div className="flex flex-wrap gap-2">
          {(['bug', 'suggestion', 'general'] as FeedbackType[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`px-4 py-2 font-mono text-[10px] uppercase tracking-widest border transition-all ${
                type === t 
                  ? 'bg-white text-black border-white' 
                  : 'bg-transparent text-zinc-500 border-zinc-800 hover:border-zinc-600'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Message Textarea */}
      <div className="space-y-4">
        <label htmlFor="message" className="font-mono text-[10px] text-zinc-600 uppercase tracking-widest block">
          Message <span className="text-zinc-800">(Required)</span>
        </label>
        <textarea
          id="message"
          required
          maxLength={1000}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="What's on your mind?"
          rows={6}
          className="w-full bg-transparent border border-zinc-800 p-4 font-mono text-sm focus:outline-none focus:border-zinc-500 transition-colors resize-none placeholder:text-zinc-800"
        />
        <div className="flex justify-end">
          <span className={`font-mono text-[10px] uppercase tracking-widest ${message.length > 900 ? 'text-yellow-500' : 'text-zinc-700'}`}>
            {message.length} / 1000
          </span>
        </div>
      </div>

      {/* Name Input */}
      <div className="space-y-4">
        <label htmlFor="name" className="font-mono text-[10px] text-zinc-600 uppercase tracking-widest block">
          Identification <span className="text-zinc-800">(Optional)</span>
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Leave blank to stay anonymous"
          className="w-full bg-transparent border border-zinc-800 p-4 font-mono text-sm focus:outline-none focus:border-zinc-500 transition-colors placeholder:text-zinc-800"
        />
      </div>

      {/* Submit Button */}
      <div className="pt-4">
        <button
          type="submit"
          disabled={status === 'loading'}
          className="w-full py-4 border border-zinc-800 font-mono text-xs uppercase tracking-[0.3em] font-bold transition-all hover:bg-white hover:text-black hover:border-white disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-zinc-500 disabled:hover:border-zinc-800"
        >
          {status === 'loading' ? 'Transmitting...' : 'Dispatch Feedback'}
        </button>
        {status === 'error' && (
          <p className="mt-4 font-mono text-[10px] text-red-500 uppercase tracking-widest text-center">
            Error: {errorMsg}
          </p>
        )}
      </div>
    </form>
  )
}
