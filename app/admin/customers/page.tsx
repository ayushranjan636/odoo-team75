export default function AdminCustomersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Customers</h1>
        <p className="text-gray-600">Manage customer profiles and relationships</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 p-4 bg-white rounded-lg border">
        <input type="text" placeholder="Search customers..." className="px-3 py-2 border rounded-md" />
        <select className="px-3 py-2 border rounded-md">
          <option>All Segments</option>
          <option>VIP</option>
          <option>Regular</option>
          <option>New</option>
          <option>Inactive</option>
        </select>
        <select className="px-3 py-2 border rounded-md">
          <option>All Cities</option>
          <option>Mumbai</option>
          <option>Delhi</option>
          <option>Bangalore</option>
        </select>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-lg border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Customer</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Email</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Phone</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Orders</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Total Spent</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Segment</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="px-4 py-3">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm">
                      JD
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium">John Doe</div>
                      <div className="text-sm text-gray-500">Mumbai</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm">john@example.com</td>
                <td className="px-4 py-3 text-sm">+91 98765 43210</td>
                <td className="px-4 py-3 text-sm">12</td>
                <td className="px-4 py-3 text-sm">₹45,000</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">VIP</span>
                </td>
                <td className="px-4 py-3">
                  <button className="text-blue-600 hover:text-blue-800 text-sm">View Profile</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
