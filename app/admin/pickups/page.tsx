export default function AdminPickupsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Pickups</h1>
        <p className="text-gray-600">Schedule and manage pickup operations</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 p-4 bg-white rounded-lg border">
        <input type="date" className="px-3 py-2 border rounded-md" placeholder="Pickup Date" />
        <select className="px-3 py-2 border rounded-md">
          <option>All Status</option>
          <option>Scheduled</option>
          <option>In Progress</option>
          <option>Completed</option>
          <option>Failed</option>
        </select>
        <input type="text" placeholder="Search customer..." className="px-3 py-2 border rounded-md" />
      </div>

      {/* Pickup Schedule Table */}
      <div className="bg-white rounded-lg border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Order ID</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Customer</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Items</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Pickup Time</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Address</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="px-4 py-3 text-sm">#ORD-001</td>
                <td className="px-4 py-3 text-sm">John Doe</td>
                <td className="px-4 py-3 text-sm">3 items</td>
                <td className="px-4 py-3 text-sm">Today 2:00 PM</td>
                <td className="px-4 py-3 text-sm">123 Main St</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">Scheduled</span>
                </td>
                <td className="px-4 py-3">
                  <button className="text-blue-600 hover:text-blue-800 text-sm">Mark Complete</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
