import { useState, useEffect } from 'react';

export default function JobHistory({ jobId }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!jobId) return;
    
    async function loadHistory() {
      try {
        const res = await fetch(`/api/jobs/${jobId}/history`);
        if (!res.ok) throw new Error('Failed to load history');
        const data = await res.json();
        setHistory(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadHistory();
  }, [jobId]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getIcon = (type) => {
    switch (type) {
      case 'quote_created':
        return '📋';
      case 'job_created':
        return '🔧';
      case 'status_change':
        return '🔄';
      case 'engineer_assigned':
        return '👨‍🔧';
      default:
        return '📝';
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'unassigned': 'bg-gray-500',
      'assigned': 'bg-blue-500',
      'in_progress': 'bg-yellow-500',
      'awaiting_parts': 'bg-orange-500',
      'ready_for_completion': 'bg-green-500',
      'completed': 'bg-green-600',
      'cancelled': 'bg-red-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  if (loading) return <div className="text-center py-4">Loading history...</div>;
  if (error) return <div className="text-red-500 py-4">Error: {error}</div>;

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold mb-4">Job History</h3>
      
      {history.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No history available</p>
      ) : (
        <div className="space-y-3">
          {history.map((item, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm">
                {getIcon(item.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">
                    {item.description}
                  </p>
                  <span className="text-xs text-gray-500">
                    {formatDate(item.timestamp)}
                  </span>
                </div>
                
                {item.details && (
                  <div className="mt-2 text-sm text-gray-600">
                    {item.type === 'quote_created' && (
                      <p>Quote #{item.details.quote_id} created by {item.details.created_by}</p>
                    )}
                    
                    {item.type === 'job_created' && (
                      <p>Job created by {item.details.created_by}</p>
                    )}
                    
                    {item.type === 'status_change' && (
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded text-xs text-white ${getStatusColor(item.details.old_status)}`}>
                            {item.details.old_status}
                          </span>
                          <span>→</span>
                          <span className={`px-2 py-1 rounded text-xs text-white ${getStatusColor(item.details.new_status)}`}>
                            {item.details.new_status}
                          </span>
                        </div>
                        {item.details.changed_by && (
                          <p className="mt-1">Changed by: {item.details.changed_by}</p>
                        )}
                        {item.details.notes && (
                          <p className="mt-1 italic">"{item.details.notes}"</p>
                        )}
                      </div>
                    )}
                    
                    {item.type === 'engineer_assigned' && (
                      <div>
                        <p><strong>Engineer:</strong> {item.details.engineer_name}</p>
                        {item.details.scheduled_start && (
                          <p><strong>Scheduled:</strong> {formatDate(item.details.scheduled_start)}</p>
                        )}
                        {item.details.duration && (
                          <p><strong>Duration:</strong> {item.details.duration} minutes</p>
                        )}
                        {item.details.assigned_by && (
                          <p><strong>Assigned by:</strong> {item.details.assigned_by}</p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 