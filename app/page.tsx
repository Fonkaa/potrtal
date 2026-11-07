"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Search, ShieldCheck, Sparkles } from 'lucide-react'

export default function Home() {
  const [query, setQuery] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) {
      setError('Please enter your Full Name or Student ID')
      return
    }
    router.push(`/result?q=${encodeURIComponent(query.trim())}`)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 relative">
      {/* Top Floating Badge */}
      <div className="absolute top-8 flex items-center gap-2 px-4 py-2 rounded-full bg-[#0B192C]/80 border border-amber-400/30 backdrop-blur-md shadow-lg shadow-amber-500/5">
        <Sparkles size={15} className="text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
        <span className="text-xs font-semibold text-slate-200 uppercase tracking-widest">ECIC Official Portal</span>
      </div>

      <div className="w-full max-w-lg bg-[#0B192C]/80 backdrop-blur-2xl p-10 rounded-3xl shadow-2xl border border-slate-800/80 relative overflow-hidden">
        {/* Subtle top gold highlight line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>

        {/* Logo and Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-amber-400/50 shadow-xl shadow-amber-500/20 bg-white mb-4">
            <Image src="/logo.png" alt="ECIC Logo" fill className="object-cover" priority />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Exam Result & Rank Portal</h1>
          <p className="text-xs text-amber-400 font-medium mt-1 uppercase tracking-wider">Electronics and Communication Engineering Innovation Club</p>
          <p className="text-sm text-slate-400 mt-3">Enter your student ID or full name below to lookup your performance evaluation.</p>
        </div>

        <form onSubmit={handleSearch} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Student ID</label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setError(''); }}
                placeholder="e.g., Ugr/33771/16"
                className="w-full bg-[#070F1E]/80 border border-slate-700/80 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/50 transition-all shadow-inner"
              />
            </div>
            {error && <p className="text-rose-400 text-xs mt-2 font-medium flex items-center gap-1">⚠️ {error}</p>}
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-600 text-white font-bold rounded-2xl transition-all shadow-xl shadow-blue-600/30 hover:shadow-blue-600/50 text-sm tracking-wide border border-blue-400/20"
          >
            Check Result & Rank
          </button>
        </form>
      </div>

      <p className="text-xs text-slate-500 mt-8 flex items-center gap-1.5">
        <ShieldCheck size={14} className="text-emerald-400" /> Secured & Powered by ECIC Systems Architecture
      </p>
    </div>
  )
}