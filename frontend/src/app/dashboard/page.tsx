export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Overview Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <p className="text-sm text-slate-500 mb-1">Total Lots</p>
          <h2 className="text-3xl font-bold text-slate-900">550</h2>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <p className="text-sm text-slate-500 mb-1">Pending QC</p>
          <h2 className="text-3xl font-bold text-blue-600">42</h2>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <p className="text-sm text-slate-500 mb-1">In Production</p>
          <h2 className="text-3xl font-bold text-green-600">128</h2>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h3 className="font-bold mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded bg-slate-100 flex items-center justify-center">📦</div>
                <div>
                  <p className="text-sm font-medium">Lot #LOT-20260528-{100 + i} created</p>
                  <p className="text-xs text-slate-400">By Intake Staff • 2 hours ago</p>
                </div>
              </div>
              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">PENDING_QC</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
