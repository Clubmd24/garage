import React, { useState, useEffect } from 'react';
import OfficeLayout from '../../../components/OfficeLayout';
import StaffRotaCalendar from '../../../components/StaffRotaCalendar';
import AttendanceTracker from '../../../components/AttendanceTracker';
import ShiftManager from '../../../components/ShiftManager';

export default function StaffRotaPage() {
  const [activeTab, setActiveTab] = useState('rota');
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [engineers, setEngineers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load engineers for the rota system
    fetch('/api/engineers')
      .then(res => res.json())
      .then(data => {
        setEngineers(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading engineers:', err);
        setLoading(false);
      });
  }, []);

  const getWeekStart = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    return new Date(d.setDate(diff));
  };

  const formatWeekRange = (date) => {
    const start = getWeekStart(date);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    
    return `${start.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' })} - ${end.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}`;
  };

  const navigateWeek = (direction) => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(newWeek.getDate() + (direction * 7));
    setCurrentWeek(newWeek);
  };

  if (loading) {
    return (
      <OfficeLayout>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading staff rota system...</p>
        </div>
      </OfficeLayout>
    );
  }

  return (
    <OfficeLayout>
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Staff Rota & Attendance
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage engineer schedules, track attendance, and monitor staff rotas
          </p>
        </div>

        {/* Week Navigation */}
        <div className="mb-6 flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <button
            onClick={() => navigateWeek(-1)}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            ← Previous Week
          </button>
          
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Week of {formatWeekRange(currentWeek)}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {getWeekStart(currentWeek).toLocaleDateString('en-GB', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          
          <button
            onClick={() => navigateWeek(1)}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Next Week →
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <nav className="flex space-x-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
            {[
              { id: 'rota', name: '📅 Rota Calendar', icon: '📅' },
              { id: 'attendance', name: '⏰ Attendance', icon: '⏰' },
              { id: 'shifts', name: '👥 Shift Manager', icon: '👥' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          {activeTab === 'rota' && (
            <StaffRotaCalendar 
              currentWeek={currentWeek} 
              engineers={engineers}
            />
          )}
          
          {activeTab === 'attendance' && (
            <AttendanceTracker 
              currentWeek={currentWeek}
              engineers={engineers}
            />
          )}
          
          {activeTab === 'shifts' && (
            <ShiftManager 
              currentWeek={currentWeek}
              engineers={engineers}
            />
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={() => setActiveTab('shifts')}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            ➕ Add New Shift
          </button>
          <button
            onClick={() => setActiveTab('attendance')}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            📊 View Attendance Report
          </button>
          <button
            onClick={() => setActiveTab('rota')}
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            📋 Print Weekly Rota
          </button>
        </div>
      </div>
    </OfficeLayout>
  );
}
