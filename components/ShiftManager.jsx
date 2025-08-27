import React, { useState, useEffect } from 'react';
import { format, startOfWeek, addDays, parseISO } from 'date-fns';

export default function ShiftManager({ currentWeek, engineers }) {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showShiftForm, setShowShiftForm] = useState(false);
  const [editingShift, setEditingShift] = useState(null);
  const [formData, setFormData] = useState({
    employee_id: '',
    start_time: '',
    end_time: '',
    date: ''
  });

  useEffect(() => {
    loadShifts();
  }, [currentWeek]);

  const loadShifts = async () => {
    setLoading(true);
    try {
      const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
      const weekEnd = addDays(weekStart, 7);
      
      const response = await fetch(`/api/shifts?start_date=${weekStart.toISOString()}&end_date=${weekEnd.toISOString()}`);
      const data = await response.json();
      setShifts(data);
    } catch (error) {
      console.error('Error loading shifts:', error);
      setShifts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateShift = async (e) => {
    e.preventDefault();
    
    try {
      const shiftData = {
        employee_id: parseInt(formData.employee_id),
        start_time: `${formData.date}T${formData.start_time}:00`,
        end_time: `${formData.date}T${formData.end_time}:00`
      };

      const response = await fetch('/api/shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(shiftData)
      });

      if (response.ok) {
        setShowShiftForm(false);
        setFormData({ employee_id: '', start_time: '', end_time: '', date: '' });
        loadShifts();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create shift');
      }
    } catch (error) {
      console.error('Error creating shift:', error);
      alert('Failed to create shift');
    }
  };

  const handleUpdateShift = async (e) => {
    e.preventDefault();
    
    try {
      const shiftData = {
        id: editingShift.id,
        employee_id: parseInt(formData.employee_id),
        start_time: `${formData.date}T${formData.start_time}:00`,
        end_time: `${formData.date}T${formData.end_time}:00`
      };

      const response = await fetch('/api/shifts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(shiftData)
      });

      if (response.ok) {
        setShowShiftForm(false);
        setEditingShift(null);
        setFormData({ employee_id: '', start_time: '', end_time: '', date: '' });
        loadShifts();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update shift');
      }
    } catch (error) {
      console.error('Error updating shift:', error);
      alert('Failed to update shift');
    }
  };

  const handleDeleteShift = async (shiftId) => {
    if (!confirm('Are you sure you want to delete this shift?')) return;
    
    try {
      const response = await fetch(`/api/shifts?id=${shiftId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        loadShifts();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete shift');
      }
    } catch (error) {
      console.error('Error deleting shift:', error);
      alert('Failed to delete shift');
    }
  };

  const handleEditShift = (shift) => {
    setEditingShift(shift);
    setFormData({
      employee_id: shift.employee_id.toString(),
      start_time: format(parseISO(shift.start_time), 'HH:mm'),
      end_time: format(parseISO(shift.end_time), 'HH:mm'),
      date: format(parseISO(shift.start_time), 'yyyy-MM-dd')
    });
    setShowShiftForm(true);
  };

  const openNewShiftForm = () => {
    setEditingShift(null);
    setFormData({
      employee_id: '',
      start_time: '09:00',
      end_time: '17:00',
      date: format(new Date(), 'yyyy-MM-dd')
    });
    setShowShiftForm(true);
  };

  const closeForm = () => {
    setShowShiftForm(false);
    setEditingShift(null);
    setFormData({ employee_id: '', start_time: '', end_time: '', date: '' });
  };

  const getEmployeeName = (employeeId) => {
    const engineer = engineers.find(e => e.id === employeeId);
    if (engineer?.first_name && engineer?.last_name) {
      return `${engineer.first_name} ${engineer.last_name}`;
    }
    return engineer?.username || 'Unknown';
  };

  const formatTime = (timeString) => {
    return format(parseISO(timeString), 'HH:mm');
  };

  const formatDate = (dateString) => {
    return format(parseISO(dateString), 'EEE, MMM do');
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading shifts...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header Actions */}
      <div className="mb-6 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Shift Management
        </h3>
        <button
          onClick={openNewShiftForm}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          ➕ Add New Shift
        </button>
      </div>

      {/* Shifts List */}
      <div className="space-y-4">
        {shifts.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>No shifts scheduled for this week</p>
            <p className="text-sm mt-2">Click "Add New Shift" to get started</p>
          </div>
        ) : (
          shifts.map((shift) => (
            <div 
              key={shift.id}
              className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-semibold">
                    {getEmployeeName(shift.employee_id).charAt(0)}
                  </div>
                  
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {getEmployeeName(shift.employee_id)}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(shift.start_time)} • {formatTime(shift.start_time)} - {formatTime(shift.end_time)}
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditShift(shift)}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDeleteShift(shift.id)}
                    className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Shift Form Modal */}
      {showShiftForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {editingShift ? 'Edit Shift' : 'Create New Shift'}
            </h3>
            
            <form onSubmit={editingShift ? handleUpdateShift : handleCreateShift} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Employee
                </label>
                <select
                  value={formData.employee_id}
                  onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  required
                >
                  <option value="">Select Employee</option>
                  {engineers.map((engineer) => (
                    <option key={engineer.id} value={engineer.id}>
                      {engineer.first_name && engineer.last_name 
                        ? `${engineer.first_name} ${engineer.last_name}`
                        : engineer.username
                      }
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingShift ? 'Update Shift' : 'Create Shift'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
