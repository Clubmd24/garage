// pages/office/clients/index.js
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import OfficeLayout from '../../../components/OfficeLayout';
import { fetchClients } from '../../../lib/clients';
import { fetchVehicles } from '../../../lib/vehicles';
import { fetchFleets } from '../../../lib/fleets';

const ClientsPage = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [vehicles, setVehicles] = useState([]);
  const [fleets, setFleets] = useState([]);
  const [selectedFleet, setSelectedFleet] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'fleet', 'local'

  const load = () => {
    setLoading(true);
    Promise.all([fetchClients(), fetchVehicles(), fetchFleets()])
      .then(([c, v, f]) => {
        setClients(c);
        setVehicles(v);
        setFleets(f);
      })
      .catch(() => setError('Failed to load clients'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDelete = async id => {
    if (!confirm('Delete this client?')) return;
    await fetch(`/api/clients/${id}`, { method: 'DELETE' });
    load();
  };

  const filteredClients = clients.filter(c => {
    // Apply tab filtering using new client_type field
    if (activeTab === 'fleet' && c.client_type !== 'fleet') return false;
    if (activeTab === 'local' && c.client_type !== 'local') return false;
    if (activeTab === 'no-vehicles' && c.client_type !== 'no-vehicles') return false;
    
    // Apply fleet filtering
    if (
      selectedFleet &&
      !vehicles.some(
        v => v.customer_id === c.id && String(v.fleet_id) === selectedFleet,
      )
    )
      return false;
    
    // Apply search filtering
    const q = searchQuery.toLowerCase();
    const name = `${c.first_name || ''} ${c.last_name || ''}`.toLowerCase();
    return (
      name.includes(q) ||
      (c.email || '').toLowerCase().includes(q) ||
      (c.nie_number || '').toLowerCase().includes(q)
    );
  });

  const getClientType = (client) => {
    // Use the new client_type field if available, fallback to vehicle-based logic
    if (client.client_type) {
      return client.client_type;
    }
    if (client.has_fleet_vehicles) return 'fleet';
    if (client.has_local_vehicles) return 'local';
    if (client.has_no_vehicles) return 'no-vehicles';
    return 'unknown';
  };

  const getClientTypeLabel = (client) => {
    const type = getClientType(client);
    switch (type) {
      case 'fleet': return 'Fleet Client';
      case 'local': return 'Local Client (Individual)';
      case 'no-vehicles': return 'No Vehicles - Orphaned';
      default: return 'Unknown';
    }
  };

  const getClientTypeColor = (client) => {
    const type = getClientType(client);
    switch (type) {
      case 'fleet': return 'bg-blue-100 border-blue-300 dark:bg-blue-900/20 dark:border-blue-700';
      case 'local': return 'bg-green-100 border-green-300 dark:bg-green-900/20 dark:border-green-700';
      case 'no-vehicles': return 'bg-red-100 border-red-300 dark:bg-red-900/20 dark:border-red-700';
      default: return 'bg-gray-100 border-gray-300 dark:bg-gray-900/20 dark:border-gray-700';
    }
  };

  return (
    <OfficeLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Clients</h1>
        <Link href="/office/clients/new" className="button">
          + New Client
        </Link>
      </div>
      
      {loading && <p>Loading…</p>}
      {error && <p className="text-red-500">{error}</p>}
      
      {!loading && !error && (
        <>
          {/* Search and Fleet Filter */}
          <div className="mb-6 space-y-4">
            <input
              type="text"
              placeholder="Search clients by name, email, or NIE number…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="input w-full max-w-md"
            />
            
            <select
              value={selectedFleet}
              onChange={e => setSelectedFleet(e.target.value)}
              className="input w-full max-w-md"
            >
              <option value="">All Fleets</option>
              {fleets.filter(f => f.id !== 2).map(f => (
                <option key={f.id} value={f.id}>
                  {f.company_name}
                </option>
              ))}
            </select>
          </div>

          {/* Tabs */}
          <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('all')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'all'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                All Clients ({clients.length})
              </button>
              <button
                onClick={() => setActiveTab('fleet')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'fleet'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Fleet Clients ({clients.filter(c => c.client_type === 'fleet').length})
              </button>
              <button
                onClick={() => setActiveTab('local')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'local'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Local/Individual Clients ({clients.filter(c => c.client_type === 'local').length})
              </button>
              <button
                onClick={() => setActiveTab('no-vehicles')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'no-vehicles'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                No Vehicles - Cleanup ({clients.filter(c => c.has_no_vehicles).length})
              </button>
            </nav>
          </div>

          {/* Warning for No Vehicles tab */}
          {activeTab === 'no-vehicles' && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                    Data Cleanup Required
                  </h3>
                  <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                    <p>
                      These clients have no vehicles associated with them and may be orphaned records. 
                      Review each one carefully before deletion. Consider if they need to be:
                    </p>
                    <ul className="list-disc list-inside mt-2 ml-4">
                      <li>Merged with existing clients</li>
                      <li>Updated with vehicle information</li>
                      <li>Deleted if confirmed to be duplicate/orphaned</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bulk Delete Button for No Vehicles */}
          {activeTab === 'no-vehicles' && filteredClients.length > 0 && (
            <div className="mb-6 flex justify-between items-center">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {filteredClients.length} client{filteredClients.length !== 1 ? 's' : ''} with no vehicles found
              </div>
              <button
                onClick={() => {
                  if (confirm(`Are you sure you want to delete ALL ${filteredClients.length} clients with no vehicles? This action cannot be undone.`)) {
                    // Bulk delete all clients with no vehicles
                    Promise.all(filteredClients.map(c => fetch(`/api/clients/${c.id}`, { method: 'DELETE' })))
                      .then(() => {
                        alert(`Successfully deleted ${filteredClients.length} clients with no vehicles`);
                        load(); // Reload the data
                      })
                      .catch(error => {
                        console.error('Error during bulk delete:', error);
                        alert('Error during bulk delete. Please check the console for details.');
                      });
                  }
                }}
                className="button bg-red-600 hover:bg-red-700 text-white px-6 py-2"
              >
                🗑️ Bulk Delete All ({filteredClients.length})
              </button>
            </div>
          )}

          {/* Client Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredClients.map(c => (
              <div 
                key={c.id} 
                className={`item-card border-2 ${getClientTypeColor(c)} hover:shadow-lg transition-shadow duration-200`}
              >
                {/* Client Type Badge */}
                <div className="mb-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    getClientType(c) === 'fleet' 
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      : getClientType(c) === 'local'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : getClientType(c) === 'no-vehicles'
                      ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                  }`}>
                    {getClientTypeLabel(c)}
                  </span>
                </div>

                {/* Client Name */}
                <h2 className="font-semibold text-black dark:text-white text-lg mb-2">
                  {`${c.first_name || ''} ${c.last_name || ''}`.trim() || 'Unnamed'}
                </h2>
                
                {/* Contact Info */}
                <div className="space-y-1 mb-3">
                  {c.email && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                      <span className="mr-2">📧</span>
                      {c.email}
                    </p>
                  )}
                  {c.mobile && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                      <span className="mr-2">📱</span>
                      {c.mobile}
                    </p>
                  )}
                  {c.nie_number && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                      <span className="mr-2">🆔</span>
                      {c.nie_number}
                    </p>
                  )}
                </div>

                {/* Vehicle Information */}
                {c.licence_plates && (
                  <div className="mb-4 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <h3 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                      <span className="mr-2">🚗</span>
                      Vehicles
                    </h3>
                    <div className="space-y-1">
                      {c.licence_plates.split(', ').map((plate, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span className="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                            {plate}
                          </span>
                          {c.makes && c.makes.split(', ')[index] && (
                            <span className="text-gray-500 dark:text-gray-400 text-xs">
                              {c.makes.split(', ')[index]} {c.models && c.models.split(', ')[index]}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">
                  <Link href={`/office/clients/view/${c.id}`} className="button px-4 text-sm flex-1 text-center">
                    View
                  </Link>
                  <Link href={`/office/clients/${c.id}`} className="button px-4 text-sm flex-1 text-center">
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="button px-4 text-sm bg-red-600 hover:bg-red-700 flex-1"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredClients.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                {searchQuery || selectedFleet || activeTab !== 'all' 
                  ? 'No clients found matching your criteria.'
                  : 'No clients found.'
                }
              </p>
            </div>
          )}
        </>
      )}
    </OfficeLayout>
  );
};

export default ClientsPage;
