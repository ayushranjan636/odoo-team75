export default function AdminLocationsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Locations</h1>
          <p className="text-gray-600">Manage delivery and pickup locations</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Add Location</button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 p-4 bg-white rounded-lg border">
        <input type="text" placeholder="Search locations..." className="px-3 py-2 border rounded-md" />
        <select className="px-3 py-2 border rounded-md">
          <option>All Types</option>
          <option>Warehouse</option>
          <option>Pickup Point</option>
          <option>Service Center</option>
        </select>
        <select className="px-3 py-2 border rounded-md">
          <option>All Status</option>
          <option>Active</option>
          <option>Inactive</option>
        </select>
      </div>

      {/* Locations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-semibold text-gray-900">Mumbai Warehouse</h3>
              <p className="text-sm text-gray-500">Warehouse</p>
            </div>
            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Active</span>
          </div>
          <div className="space-y-2 text-sm text-gray-600">
            <p>📍 Andheri East, Mumbai</p>
            <p>📞 +91 98765 43210</p>
            <p>⏰ 9:00 AM - 6:00 PM</p>
            <p>📦 Capacity: 500 items</p>
          </div>
          <div className="mt-4 flex gap-2">
            <button className="text-blue-600 hover:text-blue-800 text-sm">Edit</button>
            <button className="text-red-600 hover:text-red-800 text-sm">Deactivate</button>
          </div>
        </div>
      </div>
    </div>
  )
}
