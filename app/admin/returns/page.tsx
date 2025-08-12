export default function AdminReturnsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Returns</h1>
        <p className="text-gray-600">Track and process return operations</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 p-4 bg-white rounded-lg border">
        <input type="date" className="px-3 py-2 border rounded-md" placeholder="Return Date" />
        <select className="px-3 py-2 border rounded-md">
          <option>All Status</option>
          <option>Due Today</option>
          <option>Overdue</option>
          <option>Completed</option>
          <option>Late</option>
        </select>
        <input type="text" placeholder="Search customer..." className="px-3 py-2 border rounded-md" />
      </div>

      {/* Returns Table */}
      <div className="bg-white rounded-lg border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Order ID</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Customer</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Items</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Due Date</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Days Late</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="px-4 py-3 text-sm">#ORD-002</td>
                <td className="px-4 py-3 text-sm">Jane Smith</td>
                <td className="px-4 py-3 text-sm">2 items</td>
                <td className="px-4 py-3 text-sm">Yesterday</td>
                <td className="px-4 py-3 text-sm text-red-600">1 day</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">Overdue</span>
                </td>
                <td className="px-4 py-3">
                  <button className="text-blue-600 hover:text-blue-800 text-sm mr-2">Process Return</button>
                  <button className="text-red-600 hover:text-red-800 text-sm">Apply Late Fee</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
