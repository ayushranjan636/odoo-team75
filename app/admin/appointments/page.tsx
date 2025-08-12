export default function AdminAppointmentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Appointments</h1>
          <p className="text-gray-600">Schedule and manage customer appointments</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">New Appointment</button>
      </div>

      {/* Calendar View Toggle */}
      <div className="flex gap-4 p-4 bg-white rounded-lg border">
        <button className="px-3 py-2 bg-blue-100 text-blue-700 rounded-md">Calendar View</button>
        <button className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-md">List View</button>
        <input type="date" className="px-3 py-2 border rounded-md ml-auto" />
      </div>

      {/* Appointments Calendar/List */}
      <div className="bg-white rounded-lg border">
        <div className="p-6">
          <div className="grid grid-cols-7 gap-4 mb-4">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
              <div key={day} className="text-center font-medium text-gray-700 py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-4">
            {Array.from({ length: 35 }, (_, i) => (
              <div key={i} className="min-h-[100px] border rounded-lg p-2">
                <div className="text-sm text-gray-500 mb-1">{i + 1}</div>
                {i === 15 && (
                  <div className="bg-blue-100 text-blue-800 text-xs p-1 rounded mb-1">10:00 AM - John Doe</div>
                )}
                {i === 16 && (
                  <div className="bg-green-100 text-green-800 text-xs p-1 rounded mb-1">2:00 PM - Jane Smith</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
