import React, { useState, useEffect } from 'react';
import { format, startOfWeek, addDays, isSameDay, parseISO } from 'date-fns';

export default function StaffRotaCalendar({ currentWeek, engineers }) {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedShift, setSelectedShift] = useState(null);
  const [showShiftModal, setShowShiftModal] = useState(false);

  useEffect(() => {
    loadShifts();
  }, [currentWeek]);

  const loadShifts = async () => {
    setLoading(true);
    try {
      const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 }); // Monday start
      const response = await fetch(`/api/shifts?week_start=${weekStart.toISOString()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Ensure data is an array
      if (!Array.isArray(data)) {
        console.error('Expected array from API, got:', typeof data, data);
        setShifts([]);
        return;
      }
      
      setShifts(data);
    } catch (error) {
      console.error('Error loading shifts:', error);
      setShifts([]);
    } finally {
      setLoading(false);
    }
  };

  const getWeekDays = () => {
    const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 }); // Monday start
    const days = [];
    for (let i = 0; i < 7; i++) {
      days.push(addDays(weekStart, i));
    }
    return days;
  };

  const getShiftsForDayAndEmployee = (date, employeeId) => {
    return shifts.filter(shift => 
      isSameDay(parseISO(shift.start_time), date) && 
      shift.employee_id === employeeId
    );
  };

  const formatTime = (timeString) => {
    return format(parseISO(timeString), 'HH:mm');
  };

  const getShiftDuration = (startTime, endTime) => {
    const start = parseISO(startTime);
    const end = parseISO(endTime);
    const diffMs = end - start;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m`;
    }
    return `${diffMinutes}m`;
  };

  const handleCellClick = (date, employeeId) => {
    const dayShifts = getShiftsForDayAndEmployee(date, employeeId);
    if (dayShifts.length > 0) {
      setSelectedShift(dayShifts[0]);
      setShowShiftModal(true);
    }
  };

  const handleDuplicateWeek = async () => {
    try {
      const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
      const nextWeekStart = addDays(weekStart, 7);
      
      const response = await fetch('/api/shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'duplicate_week',
          source_week: weekStart.toISOString(),
          target_week: nextWeekStart.toISOString()
        })
      });
      
      if (response.ok) {
        loadShifts();
        alert('Week duplicated successfully!');
      }
    } catch (error) {
      console.error('Error duplicating week:', error);
      alert('Failed to duplicate week');
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading rota...</p>
      </div>
    );
  }

  const weekDays = getWeekDays();

  return (
    <div className="p-6">
      {/* Header Actions */}
      <div className="mb-6 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Weekly Rota Calendar
        </h3>
        <div className="flex gap-2">
          <button
            onClick={handleDuplicateWeek}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            📋 Duplicate Week
          </button>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
          >
            🖨️ Print Rota
          </button>
        </div>
      </div>

      {/* Rota Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-200 dark:border-gray-700">
          {/* Header Row */}
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-700">
              <th className="border border-gray-200 dark:border-gray-600 p-3 text-left font-medium text-gray-900 dark:text-white min-w-[150px]">
                Staff Member
              </th>
              {weekDays.map((day) => (
                <th key={day.toISOString()} className="border border-gray-200 dark:border-gray-600 p-3 text-center font-medium text-gray-900 dark:text-white min-w-[120px]">
                  <div className="text-sm font-semibold">
                    {format(day, 'EEE')}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {format(day, 'dd/MM')}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          
          {/* Staff Rows */}
          <tbody>
            {engineers.map((engineer) => (
              <tr key={engineer.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="border border-gray-200 dark:border-gray-600 p-3 font-medium text-gray-900 dark:text-white">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 text-sm font-semibold">
                      {engineer.first_name?.[0] || engineer.username?.[0] || 'E'}
                    </div>
                    <div>
                      <div className="font-medium">
                        {engineer.first_name && engineer.last_name 
                          ? `${engineer.first_name} ${engineer.last_name}`
                          : engineer.username
                        }
                      </div>
                      {engineer.employee_id && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          ID: {engineer.employee_id}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                
                {weekDays.map((day) => {
                  const dayShifts = getShiftsForDayAndEmployee(day, engineer.id);
                  const hasShift = dayShifts.length > 0;
                  
                  return (
                    <td 
                      key={day.toISOString()} 
                      className={`border border-gray-200 dark:border-gray-600 p-2 cursor-pointer transition-colors ${
                        hasShift ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                      onClick={() => handleCellClick(day, engineer.id)}
                    >
                      {hasShift ? (
                        <div className="text-center">
                          {dayShifts.map((shift, index) => (
                            <div key={shift.id} className="mb-1 last:mb-0">
                              <div className="text-xs font-medium text-blue-700 dark:text-blue-300">
                                {formatTime(shift.start_time)} - {formatTime(shift.end_time)}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {getShiftDuration(shift.start_time, shift.end_time)}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center text-gray-400 dark:text-gray-500 text-sm">
                          No shift
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Legend</h4>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded"></div>
            <span className="text-gray-600 dark:text-gray-400">Scheduled Shift</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-100 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded"></div>
            <span className="text-gray-600 dark:text-gray-400">No Shift</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded"></div>
            <span className="text-gray-600 dark:text-gray-400">Present (Clock In)</span>
          </div>
        </div>
      </div>

      {/* Shift Details Modal */}
      {showShiftModal && selectedShift && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Shift Details
            </h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Employee
                </label>
                <p className="text-gray-900 dark:text-white">
                  {engineers.find(e => e.id === selectedShift.employee_id)?.first_name || 'Unknown'}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Date
                </label>
                <p className="text-gray-900 dark:text-white">
                  {format(parseISO(selectedShift.start_time), 'EEEE, MMMM do, yyyy')}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Time
                </label>
                <p className="text-gray-900 dark:text-white">
                  {formatTime(selectedShift.start_time)} - {formatTime(selectedShift.end_time)}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Duration
                </label>
                <p className="text-gray-900 dark:text-white">
                  {getShiftDuration(selectedShift.start_time, selectedShift.end_time)}
                </p>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowShiftModal(false)}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  // TODO: Implement edit functionality
                  setShowShiftModal(false);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Edit Shift
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
