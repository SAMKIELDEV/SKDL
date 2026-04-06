import { Metadata } from 'next'
import FeedbackForm from './FeedbackForm'

export const metadata: Metadata = {
  title: 'Feedback — SKDL',
  description: 'Submit your feedback, bug reports, or suggestions for SKDL.',
}

export default function FeedbackPage() {
  return (
    <main className="max-w-xl mx-auto px-6 py-20 min-h-screen">
      <div className="space-y-12">
        <header className="space-y-2">
          <h1 className="font-space text-4xl font-bold tracking-tighter uppercase">Feedback</h1>
          <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-[0.3em]">System Input Terminal</p>
        </header>

        <FeedbackForm />
      </div>
    </main>
  )
}
