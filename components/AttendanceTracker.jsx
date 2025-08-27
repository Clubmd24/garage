import React, { useState, useEffect } from 'react';
import { format, startOfWeek, addDays, parseISO } from 'date-fns';

export default function AttendanceTracker({ currentWeek, engineers }) {
  const [currentAttendance, setCurrentAttendance] = useState([]);
  const [weeklyAttendance, setWeeklyAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  useEffect(() => {
    loadAttendance();
  }, [currentWeek]);

  const loadAttendance = async () => {
    setLoading(true);
    try {
      // Load current attendance (who's clocked in)
      const currentResponse = await fetch('/api/attendance?current=true');
      if (!currentResponse.ok) {
        throw new Error(`Current attendance HTTP error! status: ${currentResponse.status}`);
      }
      const currentData = await currentResponse.json();
      setCurrentAttendance(Array.isArray(currentData) ? currentData : []);

      // Load weekly attendance
      const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
      const weekEnd = addDays(weekStart, 7);
      
      const weeklyResponse = await fetch(`/api/attendance?start_date=${weekStart.toISOString()}&end_date=${weekEnd.toISOString()}`);
      if (!weeklyResponse.ok) {
        throw new Error(`Weekly attendance HTTP error! status: ${weeklyResponse.status}`);
      }
      const weeklyData = await weeklyResponse.json();
      setWeeklyAttendance(Array.isArray(weeklyData) ? weeklyData : []);
    } catch (error) {
      console.error('Error loading attendance:', error);
      setCurrentAttendance([]);
      setWeeklyAttendance([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClockIn = async (employeeId) => {
    try {
      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'clock_in',
          employee_id: employeeId
        })
      });

      if (response.ok) {
        loadAttendance();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to clock in');
      }
    } catch (error) {
      console.error('Error clocking in:', error);
      alert('Failed to clock in');
    }
  };

  const handleClockOut = async (employeeId) => {
    try {
      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'clock_out',
          employee_id: employeeId
        })
      });

      if (response.ok) {
        loadAttendance();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to clock out');
      }
    } catch (error) {
      console.error('Error clocking out:', error);
      alert('Failed to clock out');
    }
  };

  const isClockedIn = (employeeId) => {
    return currentAttendance.some(record => record.employee_id === employeeId);
  };

  const getEmployeeAttendance = (employeeId) => {
    return weeklyAttendance.filter(record => record.employee_id === employeeId);
  };

  const calculateTotalHours = (attendanceRecords) => {
    let totalMinutes = 0;
    attendanceRecords.forEach(record => {
      if (record.clock_in && record.clock_out) {
        const start = parseISO(record.clock_in);
        const end = parseISO(record.clock_out);
        totalMinutes += (end - start) / (1000 * 60);
      }
    });
    return Math.round((totalMinutes / 60) * 100) / 100;
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    return format(parseISO(timeString), 'HH:mm');
  };

  const getWeekDays = () => {
    const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
    const days = [];
    for (let i = 0; i < 7; i++) {
      days.push(addDays(weekStart, i));
    }
    return days;
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading attendance...</p>
      </div>
    );
  }

  const weekDays = getWeekDays();

  return (
    <div className="p-6">
      {/* Current Status */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Current Attendance Status
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {engineers.map((engineer) => {
            const clockedIn = isClockedIn(engineer.id);
            const attendanceRecord = currentAttendance.find(record => record.employee_id === engineer.id);
            
            return (
              <div 
                key={engineer.id}
                className={`p-4 rounded-lg border-2 transition-all ${
                  clockedIn 
                    ? 'border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-700' 
                    : 'border-gray-200 bg-gray-50 dark:bg-gray-700 dark:border-gray-600'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      clockedIn ? 'bg-green-500' : 'bg-gray-400'
                    }`}></div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {engineer.username}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {engineer.email}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    {clockedIn && attendanceRecord && (
                      <div className="text-sm text-green-600 dark:text-green-400">
                        Since {formatTime(attendanceRecord.clock_in)}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  {!clockedIn ? (
                    <button
                      onClick={() => handleClockIn(engineer.id)}
                      className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                    >
                      ⏰ Clock In
                    </button>
                  ) : (
                    <button
                      onClick={() => handleClockOut(engineer.id)}
                      className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                    >
                      🚪 Clock Out
                    </button>
                  )}
                  
                  <button
                    onClick={() => setSelectedEmployee(engineer.id === selectedEmployee ? null : engineer.id)}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    📊 Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Weekly Attendance Table */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Weekly Attendance Summary
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-200 dark:border-gray-700">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700">
                <th className="border border-gray-200 dark:border-gray-600 p-3 text-left font-medium text-gray-900 dark:text-white">
                  Staff Member
                </th>
                {weekDays.map((day) => (
                  <th key={day.toISOString()} className="border border-gray-200 dark:border-gray-600 p-3 text-center font-medium text-gray-900 dark:text-white">
                    <div className="text-sm font-semibold">
                      {format(day, 'EEE')}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {format(day, 'dd/MM')}
                    </div>
                  </th>
                ))}
                <th className="border border-gray-200 dark:border-gray-600 p-3 text-center font-medium text-gray-900 dark:text-white">
                  Total Hours
                </th>
              </tr>
            </thead>
            
            <tbody>
              {engineers.map((engineer) => {
                const employeeAttendance = getEmployeeAttendance(engineer.id);
                const totalHours = calculateTotalHours(employeeAttendance);
                
                return (
                  <tr key={engineer.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="border border-gray-200 dark:border-gray-600 p-3 font-medium text-gray-900 dark:text-white">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 text-sm font-semibold">
                          {engineer.first_name?.[0] || engineer.username?.[0] || 'E'}
                        </div>
                        <div>
                          <div className="font-medium">
                            {engineer.username}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {engineer.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    {weekDays.map((day) => {
                      const dayAttendance = employeeAttendance.filter(record => 
                        format(parseISO(record.clock_in), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
                      );
                      
                      return (
                        <td key={day.toISOString()} className="border border-gray-200 dark:border-gray-600 p-2 text-center">
                          {dayAttendance.length > 0 ? (
                            <div className="text-xs">
                              {dayAttendance.map((record, index) => (
                                <div key={record.id} className="mb-1 last:mb-0">
                                  <div className="text-green-600 dark:text-green-400">
                                    {formatTime(record.clock_in)} - {formatTime(record.clock_out) || 'Active'}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-gray-400 dark:text-gray-500 text-sm">
                              No record
                            </div>
                          )}
                        </td>
                      );
                    })}
                    
                    <td className="border border-gray-200 dark:border-gray-600 p-3 text-center font-medium text-gray-900 dark:text-white">
                      {totalHours}h
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Employee Details Panel */}
      {selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Attendance Details
              </h3>
              <button
                onClick={() => setSelectedEmployee(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              {getEmployeeAttendance(selectedEmployee).map((record) => (
                <div key={record.id} className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {format(parseISO(record.clock_in), 'EEEE, MMMM do, yyyy')}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Clock In: {formatTime(record.clock_in)}
                        {record.clock_out && ` | Clock Out: ${formatTime(record.clock_out)}`}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      {record.clock_out ? (
                        <div className="text-sm text-green-600 dark:text-green-400">
                          Completed
                        </div>
                      ) : (
                        <div className="text-sm text-blue-600 dark:text-blue-400">
                          Active
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
