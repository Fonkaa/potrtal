"use client"

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { 
  Award, 
  Settings as SettingsIcon, 
  LogOut, 
  PlusCircle, 
  Trash2, 
  Users, 
  CheckCircle2, 
  Trophy, 
  Medal,
  Sliders,
  KeyRound,
  LayoutDashboard,
  Edit3,
  Printer,
  Trash2 as TrashIcon,
  Save,
  Check,
  Search
} from 'lucide-react'

export default function AdminDashboard() {
  const [isMounted, setIsMounted] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'register' | 'scores' | 'results' | 'settings'>('overview')
  
  const [results, setResults] = useState<any[]>([])
  const [cutoff, setCutoff] = useState('15')
  const [newEmail, setNewEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  
  // Registration form state
  const [studentId, setStudentId] = useState('')
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')

  // Search filter query state for Ranks tab
  const [searchFilter, setSearchFilter] = useState('')

  // Local scores dictionary: { [id]: scoreValue }
  const [localScores, setLocalScores] = useState<{ [key: string]: string }>({})
  const [scoreMessage, setScoreMessage] = useState('')
  const [isSubmittingScores, setIsSubmittingScores] = useState(false)

  // Inline editing tracker for individual rows
  const [editingRowId, setEditingRowId] = useState<string | null>(null)

  const router = useRouter()

  useEffect(() => {
    setIsMounted(true)
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const resResults = await fetch('/api/admin/results')
      const dataResults = await resResults.json()
      
      // GUARANTEE results is always an array to prevent runtime filter errors
      const safeResults = Array.isArray(dataResults) ? dataResults : []
      setResults(safeResults)

      const scoresMap: { [key: string]: string } = {}
      safeResults.forEach((r: any) => {
        scoresMap[r.id] = r.score !== undefined && r.score !== null ? r.score.toString() : ''
      })

      setLocalScores(scoresMap)

      const resSettings = await fetch('/api/admin/settings')
      const dataSettings = await resSettings.json()
      if (dataSettings && dataSettings.cutoff) {
        setCutoff(dataSettings.cutoff)
      }
    } catch (err) {
      console.error('Error fetching admin data', err)
      setResults([])
    }
  }

  // DYNAMIC RANKING ENGINE & FILTERING FOR ID/NAME: ONLY includes students who have a non-null score submitted
  const rankedResults = useMemo(() => {
    if (!Array.isArray(results) || results.length === 0) return []
    
    const submittedStudents = results.filter(r => r && r.score !== undefined && r.score !== null)

    const sorted = [...submittedStudents].sort((a, b) => (b.score || 0) - (a.score || 0))
    let currentRank = 1
    const rankedAll = sorted.map((student, index, arr) => {
      if (index > 0 && student.score < arr[index - 1].score) {
        currentRank = index + 1
      }
      return { ...student, rank: currentRank }
    })

    // Apply Name or ID Filter search query
    if (!searchFilter.trim()) return rankedAll
    const query = searchFilter.toLowerCase()
    return rankedAll.filter(
      (r: any) =>
        (r.studentId && r.studentId.toLowerCase().includes(query)) ||
        (r.name && r.name.toLowerCase().includes(query))
    )
  }, [results, searchFilter])
const handleRegisterStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')
    
    try {
      const res = await fetch('/api/admin/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, name, score: null }),
      })
      
      const data = await res.json()

      if (res.ok) {
        setMessage('Student registered successfully! Proceed to the "Enter Scores" tab to record their exam result.')
        setStudentId('')
        setName('')
        fetchData()
      } else {
        setMessage(data.error || 'Error registering student. Student ID may already exist in the database.')
      }
    } catch (err) {
      console.error(err)
      setMessage('Error connecting to server.')
    }
  }

  const handleScoreInputChange = (id: string, val: string) => {
    setLocalScores(prev => ({ ...prev, [id]: val }))
  }

  const handleBatchSubmitScores = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmittingScores(true)
    setScoreMessage('')

    try {
      for (const r of results) {
        const valStr = localScores[r.id] !== undefined ? localScores[r.id] : ''
        const parsedScore = valStr.trim() === '' ? null : parseFloat(valStr)

        if (parsedScore !== null && (isNaN(parsedScore) || parsedScore < 0 || parsedScore > 30)) {
          alert(`Invalid score for ${r.name}. Must be between 0 and 30.`)
          setIsSubmittingScores(false)
          return
        }

        await fetch('/api/admin/results', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: r.id, studentId: r.studentId, name: r.name, score: parsedScore }),
        })
      }

      setScoreMessage('Scores successfully submitted and synced!')
      await fetchData()
    } catch (err) {
      console.error(err)
      alert('Error submitting scores.')
    } finally {
      setIsSubmittingScores(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this student record?')) return
    await fetch(`/api/admin/results?id=${id}`, { method: 'DELETE' })
    fetchData()
  }

  const handleClearAll = async () => {
    if (!confirm('⚠️ WARNING: This will permanently delete ALL student records from the database. Are you sure?')) return
    try {
      for (const r of results) {
        await fetch(`/api/admin/results?id=${r.id}`, { method: 'DELETE' })
      }
      await fetchData()
      alert('All student data cleared successfully from the database.')
    } catch (err) {
      console.error('Error clearing data:', err)
      alert('Failed to clear database records.')
    }
  }

  const handleUpdateCutoff = async (e: React.FormEvent) => {
    e.preventDefault()
    const val = parseFloat(cutoff)
    if (val < 0 || val > 30) {
      alert('Cutoff score out of 30 must be between 0 and 30.')
      return
    }
    await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cutoff: val.toString() }),
    })
    alert('Passing cutoff score updated successfully!')
  }

  const handleUpdateCredentials = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newEmail: newEmail || undefined, newPassword: newPassword || undefined }),
    })
    alert('Admin credentials updated successfully!')
    setNewEmail('')
    setNewPassword('')
  }

  if (!isMounted) return <div className="min-h-screen bg-[#070F1E]" />

  const cutoffNum = parseFloat(cutoff) || 15
  const pendingCount = Array.isArray(results) ? results.filter(r => r.score === null || r.score === undefined).length : 0
  const topScorer = rankedResults.length > 0 ? rankedResults[0] : null

  return (
    <div className="min-h-screen bg-[#070F1E] text-slate-100 flex flex-col md:flex-row pb-20 md:pb-0">
      
      {/* SIDEBAR NAVIGATION (Desktop) */}
      <aside className="hidden md:flex flex-col w-64 lg:w-72 bg-[#0B192C]/90 backdrop-blur-2xl border-r border-slate-800/80 p-6 sticky top-0 h-screen z-30">
        <div className="flex items-center gap-3 pb-6 border-b border-slate-800">
          <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-amber-400/50 shadow-lg bg-white shrink-0">
            <Image src="/logo.png" alt="ECIC Logo" fill className="object-cover" />
          </div>
          <div>
            <h1 className="font-bold text-xs lg:text-sm tracking-wide text-white uppercase">ECIC Portal</h1>
            <p className="text-[10px] text-amber-400 font-semibold">Innovation Club Admin</p>
          </div>
        </div>

        <nav className="flex-1 py-6 space-y-2">
          {[
            { id: 'overview', name: 'Dashboard Overview', icon: LayoutDashboard },
            { id: 'register', name: 'Register Students', icon: PlusCircle },
            { id: 'scores', name: 'Enter Scores (/30)', icon: Edit3 },
            { id: 'results', name: 'All Results & Ranks', icon: Award },
            { id: 'settings', name: 'System Settings', icon: SettingsIcon },
          ].map(item => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl font-medium transition-all text-xs lg:text-sm ${
                  isActive 
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30 ring-1 ring-blue-400/30' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} className={isActive ? 'text-white' : 'text-amber-400'} />
                  <span>{item.name}</span>
                </div>
                {item.id === 'scores' && pendingCount > 0 && (
                  <span className="px-2 py-0.5 bg-amber-500 text-slate-950 font-bold text-[10px] rounded-full">
                    {pendingCount}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        <div className="pt-4 border-t border-slate-800">
          <button 
            onClick={() => router.push('/admin/login')} 
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-xl text-xs font-semibold transition-all"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* MOBILE BOTTOM NAVIGATION DOCK */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0B192C]/95 backdrop-blur-2xl border-t border-slate-800 p-2 z-50 flex justify-around items-center">
        {[
          { id: 'overview', name: 'Home', icon: LayoutDashboard },
          { id: 'register', name: 'Register', icon: PlusCircle },
          { id: 'scores', name: 'Scores', icon: Edit3 },
          { id: 'results', name: 'Ranks', icon: Award },
          { id: 'settings', name: 'Settings', icon: SettingsIcon },
        ].map(item => {
          const Icon = item.icon
          const isActive = activeTab === item.id
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`flex flex-col items-center p-2 rounded-xl transition-all relative ${
                isActive ? 'text-amber-400 bg-slate-800/60' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Icon size={18} />
              <span className="text-[10px] mt-1 font-medium">{item.name}</span>
              {item.id === 'scores' && pendingCount > 0 && (
                <span className="absolute top-1 right-2 w-4 h-4 bg-amber-500 text-slate-950 font-bold text-[9px] rounded-full flex items-center justify-center">
                  {pendingCount}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-4 sm:p-6 md:p-10 space-y-6 md:space-y-8 max-w-7xl mx-auto w-full">
        
        {/* Top Header Card */}
        <div className="bg-[#0B192C]/80 backdrop-blur-xl p-4 sm:p-6 rounded-2xl md:rounded-3xl shadow-2xl border border-slate-800/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3.5">
            <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden border-2 border-amber-400/50 shadow-lg bg-white shrink-0">
              <Image src="/logo.png" alt="ECIC Logo" fill className="object-cover" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg md:text-2xl font-black text-white tracking-tight">ECIC Command Center</h1>
              <p className="text-[11px] md:text-xs text-amber-400 font-medium">Cutoff Benchmark: <span className="font-bold text-white">{cutoffNum} / 30</span></p>
            </div>
          </div>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              <div className="bg-[#0B192C]/80 p-5 md:p-6 rounded-2xl md:rounded-3xl border border-slate-800 shadow-xl space-y-1.5">
                <p className="text-[11px] text-slate-400 font-semibold uppercase">Total Registered</p>
                <p className="text-2xl md:text-3xl font-black text-white">{results.length}</p>
              </div>
              <div className="bg-[#0B192C]/80 p-5 md:p-6 rounded-2xl md:rounded-3xl border border-slate-800 shadow-xl space-y-1.5">
                <p className="text-[11px] text-slate-400 font-semibold uppercase">Submitted Results</p>
                <p className="text-2xl md:text-3xl font-black text-emerald-400">{results.filter(r => r.score !== null).length}</p>
              </div>
              <div className="bg-[#0B192C]/80 p-5 md:p-6 rounded-2xl md:rounded-3xl border border-slate-800 shadow-xl space-y-1.5">
                <p className="text-[11px] text-slate-400 font-semibold uppercase">Pending Score Entry</p>
                <p className="text-2xl md:text-3xl font-black text-amber-400">{pendingCount}</p>
              </div>
              <div className="bg-[#0B192C]/80 p-5 md:p-6 rounded-2xl md:rounded-3xl border border-slate-800 shadow-xl space-y-1.5">
                <p className="text-[11px] text-amber-400 font-semibold uppercase flex items-center gap-1"><Trophy size={14} /> Top Scorer</p>
                <p className="text-lg md:text-xl font-black text-white truncate">
                  {topScorer ? `${topScorer.name} (${topScorer.score}/30)` : 'No records'}
                </p>
                <p className="text-[10px] font-mono text-slate-400">{topScorer ? topScorer.studentId : '-'}</p>
              </div>
            </div>

            <div className="bg-[#0B192C]/80 p-6 md:p-8 rounded-2xl md:rounded-3xl border border-slate-800 shadow-xl space-y-3">
              <h3 className="text-base md:text-lg font-bold text-white flex items-center gap-2">
                <Award className="text-amber-400" size={20} /> ECIC Portal Operations
              </h3>
              <p className="text-xs md:text-sm text-slate-400 leading-relaxed">
                Use the sidebar or bottom app navigation to manage student registrations, enter scores out of 30, view real-time ranked results, update admin credentials, and export official PDF score sheets.
              </p>
            </div>
          </div>
        )}

        {/* TAB 2: REGISTER STUDENTS */}
        {activeTab === 'register' && (
          <div className="bg-[#0B192C]/80 backdrop-blur-xl p-6 md:p-8 rounded-2xl md:rounded-3xl shadow-2xl border border-slate-800 space-y-6 max-w-xl mx-auto w-full">
            <div className="flex items-center gap-3">
              <div className="p-2.5 md:p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                <PlusCircle size={20} />
              </div>
              <div>
                <h2 className="text-base md:text-lg font-bold text-white">Register Student</h2>
                <p className="text-xs text-slate-400">Score defaults to null. Enter scores in the Scores tab to publish.</p>
              </div>
            </div>

            {message && (
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium flex items-center gap-2">
                <CheckCircle2 size={16} className="shrink-0" /> {message}
              </div>
            )}

            <form onSubmit={handleRegisterStudent} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Student ID</label>
                <input 
                  type="text" 
                  placeholder="e.g. ugr/33771/16" 
                  value={studentId} 
                  onChange={(e) => setStudentId(e.target.value)} 
                  required 
                  className="w-full bg-[#070F1E] border border-slate-700 rounded-xl px-4 py-3 text-xs md:text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-400/50" 
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Full Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Abdulbasit Ylkal" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required 
                  className="w-full bg-[#070F1E] border border-slate-700 rounded-xl px-4 py-3 text-xs md:text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-400/50" 
                />
              </div>
              <button 
                type="submit" 
                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-xl text-xs md:text-sm transition shadow-xl"
              >
                Register Student Record
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: ENTER SCORES */}
        {activeTab === 'scores' && (
          <div className="bg-[#0B192C]/80 backdrop-blur-xl p-6 md:p-8 rounded-2xl md:rounded-3xl shadow-2xl border border-slate-800 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base md:text-lg font-bold text-white">Dynamic Score Entry (Out of 30)</h2>
                <p className="text-xs text-slate-400">Leave blank to submit as null. Enter scores and submit to publish.</p>
              </div>
            </div>

            {scoreMessage && (
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium flex items-center gap-2">
                <CheckCircle2 size={16} className="shrink-0" /> {scoreMessage}
              </div>
            )}

            <form onSubmit={handleBatchSubmitScores} className="space-y-6">
              <div className="overflow-x-auto rounded-2xl border border-slate-800">
                <table className="w-full text-left text-sm min-w-[500px]">
                  <thead className="bg-[#070F1E] text-slate-400 uppercase text-xs tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="p-3.5 sm:p-4">Student ID</th>
                      <th className="p-3.5 sm:p-4">Full Name</th>
                      <th className="p-3.5 sm:p-4">Score (/30)</th>
                      <th className="p-3.5 sm:p-4 text-right">Edit Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {results.length > 0 ? (
                      results.map((r) => {
                        const currentScoreVal = localScores[r.id] !== undefined ? localScores[r.id] : ''
                        const hasExistingScore = r.score !== undefined && r.score !== null
                        const isEditing = !hasExistingScore || editingRowId === r.id

                        return (
                          <tr key={r.id} className="hover:bg-slate-800/30 transition-colors">
                            <td className="p-3.5 sm:p-4 font-mono text-amber-400 text-xs sm:text-sm">{r.studentId}</td>
                            <td className="p-3.5 sm:p-4 font-semibold text-white text-xs sm:text-sm">{r.name}</td>
                            <td className="p-3.5 sm:p-4">
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  step="any"
                                  min="0"
                                  max="30"
                                  value={currentScoreVal}
                                  disabled={!isEditing}
                                  placeholder="Leave blank"
                                  onChange={(e) => handleScoreInputChange(r.id, e.target.value)}
                                  className={`w-28 bg-[#070F1E] border rounded-xl px-3 py-2 text-xs sm:text-sm text-white font-bold focus:ring-2 focus:ring-amber-400 ${
                                    isEditing ? 'border-amber-400 ring-1 ring-amber-400' : 'border-slate-700 opacity-80'
                                  }`}
                                />
                                <span className="text-xs text-slate-500">/ 30</span>
                              </div>
                            </td>
                            <td className="p-3.5 sm:p-4 text-right">
                              {hasExistingScore ? (
                                <button
                                  type="button"
                                  onClick={() => setEditingRowId(editingRowId === r.id ? null : r.id)}
                                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ml-auto ${
                                    editingRowId === r.id 
                                      ? 'bg-emerald-600 text-white shadow-lg' 
                                      : 'bg-slate-800 text-amber-400 border border-slate-700'
                                  }`}
                                >
                                  {editingRowId === r.id ? <Check size={14} /> : <Edit3 size={14} />}
                                  {editingRowId === r.id ? 'Lock' : 'Edit'}
                                </button>
                              ) : (
                                <span className="text-xs text-amber-400 font-medium">Pending (Null)</span>
                              )}
                            </td>
                          </tr>
                        )
                      })
                    ) : (
                      <tr>
                        <td colSpan={4} className="p-12 text-center text-slate-500 text-xs sm:text-sm">
                          No students registered yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {results.length > 0 && (
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmittingScores}
                    className="flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold text-xs sm:text-sm transition shadow-xl"
                  >
                    <Save size={16} /> {isSubmittingScores ? 'Submitting...' : 'Submit All Scores & Sync to Sheet'}
                  </button>
                </div>
              )}
            </form>
          </div>
        )}

        {/* TAB 4: ALL STUDENT RESULTS & DYNAMIC RANKS (WITH NAME & ID SEARCH FILTER BAR) */}
        {activeTab === 'results' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base sm:text-lg md:text-xl font-black text-white">All Student Results & Dynamic Ranks</h2>
                <p className="text-xs text-slate-400">Displays submitted scores. Filter by name or Student ID below.</p>
              </div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <button 
                  onClick={handleClearAll}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-bold transition shrink-0"
                >
                  <TrashIcon size={14} /> Clear Data
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex items-center justify-center gap-2 px-4.5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs sm:text-sm transition shadow-lg shrink-0"
                >
                  <Printer size={16} /> Print Sheet PDF
                </button>
              </div>
            </div>

            {/* SEARCH FILTER INPUT BAR FOR NAME & ID */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Filter by Student ID or Full Name..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full bg-[#0B192C]/80 border border-slate-800 rounded-2xl pl-10 pr-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
              />
            </div>

            {/* Printable Sheet Container */}
            <div id="printable-sheet" className="bg-[#0B192C]/80 backdrop-blur-xl p-4 sm:p-6 md:p-8 rounded-2xl md:rounded-3xl shadow-2xl border border-slate-800 space-y-6">
              <div className="hidden print:block text-center mb-6">
                <h1 className="text-xl font-bold text-black">Electronics and Communication Engineering Innovation Club (ECIC)</h1>
                <p className="text-sm text-gray-700">Official Exam Result & Merit Ranking Sheet</p>
                <hr className="my-2 border-gray-400" />
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-800">
                <table className="w-full text-left text-sm min-w-[550px]">
                  <thead className="bg-[#070F1E] text-slate-400 uppercase text-xs tracking-wider border-b border-slate-800 print:bg-gray-100 print:text-black">
                    <tr>
                      <th className="p-3.5 sm:p-4">Rank</th>
                      <th className="p-3.5 sm:p-4">Student ID</th>
                      <th className="p-3.5 sm:p-4">Full Name</th>
                      <th className="p-3.5 sm:p-4">Score (/30)</th>
                      <th className="p-3.5 sm:p-4">Status</th>
                      <th className="p-3.5 sm:p-4 text-right print:hidden">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 print:divide-gray-300">
                    {rankedResults.length > 0 ? (
                      rankedResults.map((r) => {
                        const scoreVal = r.score
                        const isPass = scoreVal >= cutoffNum

                        return (
                          <tr key={r.id} className="hover:bg-slate-800/40 transition-colors">
                            <td className="p-3.5 sm:p-4 font-bold text-xs sm:text-sm">
                              <div className="flex items-center gap-2">
                                {r.rank === 1 && <Trophy size={16} className="text-amber-400 shrink-0" />}
                                {r.rank === 2 && <Medal size={16} className="text-slate-300 shrink-0" />}
                                {r.rank === 3 && <Medal size={16} className="text-amber-600 shrink-0" />}
                                <span className="text-white print:text-black font-mono">#{r.rank}</span>
                              </div>
                            </td>
                            <td className="p-3.5 sm:p-4 font-mono text-amber-400 print:text-black text-xs sm:text-sm">{r.studentId}</td>
                            <td className="p-3.5 sm:p-4 font-semibold text-white print:text-black text-xs sm:text-sm">{r.name}</td>
                            <td className="p-3.5 sm:p-4 font-bold text-slate-200 print:text-black text-xs sm:text-sm">{scoreVal} / 30</td>
                            <td className="p-3.5 sm:p-4">
                              <span className={`px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold tracking-wide ${
                                isPass 
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 print:bg-emerald-100 print:text-emerald-800' 
                                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20 print:bg-rose-100 print:text-rose-800'
                              }`}>
                                {isPass ? 'PASS' : 'FAIL'}
                              </span>
                            </td>
                            <td className="p-3.5 sm:p-4 text-right print:hidden">
                              <button onClick={() => handleDelete(r.id)} className="p-2 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition">
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        )
                      })
                    ) : (
                      <tr>
                        <td colSpan={6} className="p-12 text-center text-slate-500 text-xs sm:text-sm">
                          {searchFilter ? 'No matching student records found.' : 'No submitted score records found.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: SYSTEM SETTINGS (CUTOFF & CREDENTIALS) */}
        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Cutoff Card */}
            <div className="bg-[#0B192C]/80 backdrop-blur-xl p-6 md:p-8 rounded-2xl md:rounded-3xl shadow-2xl border border-slate-800 space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                  <Sliders size={20} />
                </div>
                <div>
                  <h2 className="text-base md:text-lg font-bold text-white">Passing Cutoff Benchmark</h2>
                  <p className="text-xs text-slate-400">Configure passing mark out of 30</p>
                </div>
              </div>
              <form onSubmit={handleUpdateCutoff} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Cutoff Score (Out of 30)</label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    max="30"
                    value={cutoff}
                    onChange={(e) => setCutoff(e.target.value)}
                    className="w-full bg-[#070F1E] border border-slate-700 rounded-xl px-4 py-3 text-xs md:text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
                <button type="submit" className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs md:text-sm transition shadow-lg">
                  Update Cutoff Benchmark
                </button>
              </form>
            </div>

            {/* Admin Credentials Card */}
            <div className="bg-[#0B192C]/80 backdrop-blur-xl p-6 md:p-8 rounded-2xl md:rounded-3xl shadow-2xl border border-slate-800 space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
                  <KeyRound size={20} />
                </div>
                <div>
                  <h2 className="text-base md:text-lg font-bold text-white">Admin Credentials</h2>
                  <p className="text-xs text-slate-400">Update sign-in security details</p>
                </div>
              </div>
              <form onSubmit={handleUpdateCredentials} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">New Email</label>
                  <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="leave blank to keep current" className="w-full bg-[#070F1E] border border-slate-700 rounded-xl px-4 py-2.5 text-xs md:text-sm text-white focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">New Password</label>
                  <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="leave blank to keep current" className="w-full bg-[#070F1E] border border-slate-700 rounded-xl px-4 py-2.5 text-xs md:text-sm text-white focus:outline-none" />
                </div>
                <button type="submit" className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs md:text-sm transition shadow-lg">
                  Update Admin Credentials
                </button>
              </form>
            </div>

          </div>
        )}

      </main>

      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          #printable-sheet, #printable-sheet * { visibility: visible; }
          #printable-sheet {
            position: absolute; left: 0; top: 0; width: 100%;
            background: white !important; color: black !important;
          }
        }
      `}</style>
    </div>
  )
}