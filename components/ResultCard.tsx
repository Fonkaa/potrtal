export default function ResultCard({ name, studentId, score, rank, isPass, cutoff }: any) {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 max-w-md w-full">
      <div className="text-center mb-6">
        <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-3 ${isPass ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
          {isPass ? '🎉 Welcome & Pass' : '❌ Fail'}
        </span>
        <h1 className="text-2xl font-bold text-slate-800">{name}</h1>
        <p className="text-xs text-slate-400 font-mono mt-1">ID: {studentId}</p>
      </div>

      <div className="bg-slate-50 rounded-xl p-4 mb-6 space-y-3">
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-500">Score</span>
          <span className="font-bold text-slate-800">{score} / 100</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-500">Rank</span>
          <span className="font-bold text-slate-800">#{rank}</span>
        </div>
        <div className="flex justify-between items-center text-sm border-t border-slate-200 pt-3">
          <span className="text-slate-500">Passing Cutoff</span>
          <span className="font-semibold text-indigo-600">{cutoff}</span>
        </div>
      </div>
    </div>
  )
}
