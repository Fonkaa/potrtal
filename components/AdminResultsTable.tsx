export default function AdminResultsTable({ results, cutoff, onDelete }: any) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-slate-600 uppercase text-xs">
          <tr>
            <th className="p-3">Rank</th>
            <th className="p-3">ID</th>
            <th className="p-3">Name</th>
            <th className="p-3">Score</th>
            <th className="p-3">Status</th>
            <th className="p-3">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {results.map((r: any) => (
            <tr key={r.id}>
              <td className="p-3 font-semibold">#{r.rank}</td>
              <td className="p-3 font-mono text-slate-500">{r.studentId}</td>
              <td className="p-3 font-medium text-slate-800">{r.name}</td>
              <td className="p-3">{r.score}</td>
              <td className="p-3">
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${r.score >= parseFloat(cutoff) ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                  {r.score >= parseFloat(cutoff) ? 'Pass' : 'Fail'}
                </span>
              </td>
              <td className="p-3">
                <button onClick={() => onDelete(r.id)} className="text-rose-600 hover:underline text-xs font-medium">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
