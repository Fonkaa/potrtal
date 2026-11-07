"use client"

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { ArrowLeft, Award, CheckCircle2, XCircle, AlertCircle, BookOpen, Sparkles, Terminal } from 'lucide-react'

export default function StudentResultPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [resultData, setResultData] = useState<any>(null)
  const [recordExists, setRecordExists] = useState(false)
  const [cutoff, setCutoff] = useState(15)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (!query) {
      setLoading(false)
      setErrorMsg('No query provided.')
      return
    }

    async function fetchData() {
      try {
        const [resResults, resSettings] = await Promise.all([
          fetch('/api/admin/results'),
          fetch('/api/admin/settings')
        ])

        const allResults = await resResults.json()
        const settingsData = await resSettings.json()

        if (settingsData && settingsData.cutoff) {
          setCutoff(parseFloat(settingsData.cutoff))
        }

        const foundRecord = allResults.find(
          (r: any) =>
            r.studentId.toLowerCase() === query.toLowerCase() ||
            r.name.toLowerCase().includes(query.toLowerCase())
        )

        if (!foundRecord) {
          setRecordExists(false)
        } else {
          setRecordExists(true)

          // Compute exact dynamic ranks among submitted records
          const submittedStudents = allResults.filter((r: any) => r.score !== undefined && r.score !== null)
          const sorted = [...submittedStudents].sort((a, b) => (b.score || 0) - (a.score || 0))
          
          let currentRank = 1
          const rankedAll = sorted.map((student: any, index: number, arr: any[]) => {
            if (index > 0 && student.score < arr[index - 1].score) {
              currentRank = index + 1
            }
            return { ...student, rank: currentRank }
          })

          const rankedMatch = rankedAll.find((r: any) => r.id === foundRecord.id)
          setResultData(rankedMatch || foundRecord)
        }
      } catch (err) {
        console.error(err)
        setErrorMsg('Error connecting to ECIC database.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [query])

  const scoreVal = resultData?.score !== undefined && resultData?.score !== null ? resultData.score : null
  const isPass = scoreVal !== null && scoreVal >= cutoff

  return (
    <div className="min-h-screen bg-[#070F1E] text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 relative">
      <div className="w-full max-w-lg bg-[#0B192C]/90 backdrop-blur-2xl p-6 sm:p-8 rounded-3xl shadow-2xl border border-slate-800/80 relative overflow-hidden">
        
        <button 
          onClick={() => router.push('/')}
          className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold mb-6 hover:underline"
        >
          <ArrowLeft size={16} /> Back to Search
        </button>

        <div className="flex flex-col items-center text-center mb-6">
          <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-amber-400/50 shadow-xl bg-white mb-3">
            <Image src="/logo.png" alt="ECIC Logo" fill className="object-cover" />
          </div>
          <h1 className="text-xl font-black text-white">ECIC Result Verification</h1>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-400 text-sm animate-pulse">
            Searching ECIC secure records...
          </div>
        ) : errorMsg ? (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium text-center space-y-2">
            <AlertCircle size={24} className="mx-auto" />
            <p>{errorMsg}</p>
          </div>
        ) : !recordExists ? (
          /* NOT FOUND IN DATABASE */
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium text-center space-y-2">
            <AlertCircle size={24} className="mx-auto" />
            <p>Student record not found in the official registry.</p>
          </div>
        ) : scoreVal === null ? (
          /* FOUND IN DATABASE, BUT SCORE IS NULL */
          <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-center space-y-3">
            <AlertCircle size={32} className="mx-auto text-amber-400" />
            <h2 className="font-bold text-base text-white">{resultData.name} ({resultData.studentId})</h2>
            <p className="text-sm font-medium leading-relaxed">You did not take the exam, try next time.</p>
          </div>
        ) : isPass ? (
          /* SUCCESSFUL CANDIDATE (PASS): STATS + WELCOMING CLUB TEXT */
          <div className="space-y-5 text-left">
            <div className="bg-[#070F1E] p-4 rounded-2xl border border-slate-800 space-y-1 text-center">
              <p className="text-xs text-slate-400 uppercase font-semibold">Student Full Name</p>
              <p className="text-lg font-bold text-white">{resultData.name}</p>
              <p className="text-xs font-mono text-amber-400">{resultData.studentId}</p>
            </div>

            {/* STATS GRID */}
            <div className="grid grid-cols-3 gap-2.5">
              <div className="bg-[#070F1E] p-3.5 rounded-2xl border border-slate-800 text-center flex flex-col justify-center">
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Rank</p>
                <p className="text-lg font-black text-amber-400 mt-1 font-mono">#{resultData.rank || '-'}</p>
              </div>
              <div className="bg-[#070F1E] p-3.5 rounded-2xl border border-slate-800 text-center flex flex-col justify-center">
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Score</p>
                <p className="text-lg font-black text-white mt-1">{scoreVal} / 30</p>
              </div>
              <div className="bg-[#070F1E] p-3.5 rounded-2xl border border-slate-800 text-center flex flex-col items-center justify-center">
                <p className="text-[10px] text-slate-400 uppercase font-semibold mb-1">Status</p>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  PASS
                </span>
              </div>
            </div>

            {/* CLUB WELCOME MESSAGE */}
            <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed bg-[#070F1E] p-5 rounded-2xl border border-slate-800">
              <p className="font-bold text-amber-400 flex items-center gap-1.5">
                <Sparkles size={16} className="text-amber-400 shrink-0" /> Welcome to the ECIC Family!
              </p>
              <p>
                The Electronics and Communication Innovation Club (ECIC) expresses sincere appreciation for your dedication. Following our internal selection process, we have updated our leadership and active member structure for this academic year based on leadership potential and academic involvement.
              </p>
              <p>
                As we finalize our allocated departmental office space for innovation projects, weekly meetings, and student engagement activities, your presence will greatly enhance peer collaboration and technical development within the ECE department!
              </p>
            </div>
          </div>
        ) : (
          /* CANDIDATE WHO DID NOT MEET CUTOFF (FAIL): STATS + PREPARATION TEST */
          <div className="space-y-5 text-left">
            <div className="bg-[#070F1E] p-4 rounded-2xl border border-slate-800 space-y-1 text-center">
              <p className="text-xs text-slate-400 uppercase font-semibold">Student Full Name</p>
              <p className="text-lg font-bold text-white">{resultData.name}</p>
              <p className="text-xs font-mono text-amber-400">{resultData.studentId}</p>
            </div>

            {/* STATS GRID */}
            <div className="grid grid-cols-3 gap-2.5">
              <div className="bg-[#070F1E] p-3.5 rounded-2xl border border-slate-800 text-center flex flex-col justify-center">
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Rank</p>
                <p className="text-lg font-black text-amber-400 mt-1 font-mono">#{resultData.rank || '-'}</p>
              </div>
              <div className="bg-[#070F1E] p-3.5 rounded-2xl border border-slate-800 text-center flex flex-col justify-center">
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Score</p>
                <p className="text-lg font-black text-white mt-1">{scoreVal} / 30</p>
              </div>
              <div className="bg-[#070F1E] p-3.5 rounded-2xl border border-slate-800 text-center flex flex-col items-center justify-center">
                <p className="text-[10px] text-slate-400 uppercase font-semibold mb-1">Status</p>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  FAIL
                </span>
              </div>
            </div>

            {/* FORMAL PREPARATION TEST */}
            <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed bg-[#070F1E] p-5 rounded-2xl border border-slate-800">
              <p className="font-bold text-white flex items-center gap-1.5">
                <Terminal size={16} className="text-amber-400 shrink-0" /> 
              </p>
              <p className="text-slate-400 text-[11px]">
                Although your score is below the operational cutoff benchmark for this academic year, your journey in engineering innovation continues. 
              </p>
              
             

              <div className="pt-2 border-t border-slate-800 text-center">
                <p className="text-[11px] text-amber-400 font-medium">
                  Review different modules thoroughly, collaborate with peers, and re-apply during the next evaluation cycle. Keep building!
                </p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}