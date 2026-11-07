export default function AdminSettingsForm({ cutoff, setCutoff, onUpdateCutoff }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
      <h2 className="text-lg font-bold text-slate-800">System Passing Cutoff</h2>
      <form onSubmit={onUpdateCutoff} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">Cutoff Score</label>
          <input
            type="number"
            step="any"
            value={cutoff}
            onChange={(e) => setCutoff(e.target.value)}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm"
          />
        </div>
        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700">Update Cutoff</button>
      </form>
    </div>
  )
}
