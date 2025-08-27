import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import OfficeLayout from '../../../components/OfficeLayout';
import { fetchJobs } from '../../../lib/jobs';
import { fetchJobStatuses } from '../../../lib/jobStatuses';

export default function JobsPipelinePage() {
  const [jobs, setJobs] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, quotes, active, completed, invoices
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        // Load all jobs with their complete details
        const allJobs = await fetchJobs({});
        
        // Load quotes
        const quotesRes = await fetch('/api/quotes');
        const allQuotes = await quotesRes.json();
        
        // Load invoices
        const invoicesRes = await fetch('/api/invoices');
        const allInvoices = await invoicesRes.json();
        
        // Load job statuses
        const statuses = await fetchJobStatuses();
        
        setJobs(allJobs);
        setQuotes(allQuotes);
        setInvoices(allInvoices);
        setStatuses(statuses);
        
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    }
    
    load();
  }, []);

  // Create comprehensive pipeline data
  const pipelineData = useMemo(() => {
    const pipeline = [];
    
    // Add quotes that haven't been converted to jobs yet
    quotes.forEach(quote => {
      if (!jobs.find(job => job.quote_id === quote.id)) {
        pipeline.push({
          id: `quote_${quote.id}`,
          type: 'quote',
          status: quote.status,
          client: quote.client,
          vehicle: quote.vehicle,
          amount: quote.total_amount,
          created: quote.created_ts,
          data: quote,
          stage: 'Quote Created'
        });
      }
    });
    
    // Add active jobs
    jobs.forEach(job => {
      if (job.status !== 'completed') {
        pipeline.push({
          id: `job_${job.id}`,
          type: 'job',
          status: job.status,
          client: job.client,
          vehicle: job.vehicle,
          amount: job.quote?.total_amount,
          created: job.created_at,
          data: job,
          stage: `Job ${job.status.replace('_', ' ').toUpperCase()}`
        });
      }
    });
    
    // Add completed jobs that have invoices
    jobs.forEach(job => {
      if (job.status === 'completed') {
        const jobInvoices = invoices.filter(inv => inv.job_id === job.id);
        if (jobInvoices.length > 0) {
          pipeline.push({
            id: `completed_${job.id}`,
            type: 'completed',
            status: 'completed',
            client: job.client,
            vehicle: job.vehicle,
            amount: job.quote?.total_amount,
            created: job.created_at,
            data: job,
            invoices: jobInvoices,
            stage: 'Job Completed'
          });
        }
      }
    });
    
    // Add standalone invoices (not linked to jobs)
    invoices.forEach(invoice => {
      if (!jobs.find(job => job.id === invoice.job_id)) {
        pipeline.push({
          id: `invoice_${invoice.id}`,
          type: 'invoice',
          status: invoice.status,
          client: invoice.client,
          vehicle: invoice.vehicle,
          amount: invoice.amount,
          created: invoice.created_ts,
          data: invoice,
          stage: 'Invoice Only'
        });
      }
    });
    
    return pipeline.sort((a, b) => new Date(b.created) - new Date(a.created));
  }, [jobs, quotes, invoices]);

  // Filter pipeline data
  const filteredData = useMemo(() => {
    let filtered = pipelineData;
    
    // Apply type filter
    if (filter !== 'all') {
      filtered = filtered.filter(item => item.type === filter);
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => {
        const clientName = item.client?.first_name + ' ' + item.client?.last_name || '';
        const vehiclePlate = item.vehicle?.licence_plate || '';
        const vehicleMake = item.vehicle?.make || '';
        const vehicleModel = item.vehicle?.model || '';
        
        return (
          clientName.toLowerCase().includes(query) ||
          vehiclePlate.toLowerCase().includes(query) ||
          vehicleMake.toLowerCase().includes(query) ||
          vehicleModel.toLowerCase().includes(query) ||
          String(item.id).includes(query) ||
          String(item.amount).includes(query)
        );
      });
    }
    
    return filtered;
  }, [pipelineData, filter, searchQuery]);

  const getStatusColor = (status) => {
    const colors = {
      'draft': 'bg-gray-500',
      'pending': 'bg-yellow-500',
      'accepted': 'bg-green-500',
      'rejected': 'bg-red-500',
      'unassigned': 'bg-gray-500',
      'assigned': 'bg-blue-500',
      'in_progress': 'bg-yellow-500',
      'awaiting_parts': 'bg-orange-500',
      'ready_for_completion': 'bg-green-500',
      'completed': 'bg-green-600',
      'issued': 'bg-blue-600',
      'paid': 'bg-green-700',
      'overdue': 'bg-red-600'
    };
    return colors[status] || 'bg-gray-500';
  };

  const getTypeIcon = (type) => {
    const icons = {
      'quote': '📋',
      'job': '🔧',
      'completed': '✅',
      'invoice': '💰'
    };
    return icons[type] || '📄';
  };

  if (loading) return (
    <OfficeLayout>
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading job pipeline...</p>
      </div>
    </OfficeLayout>
  );

  if (error) return (
    <OfficeLayout>
      <div className="text-center py-8">
        <p className="text-red-500">{error}</p>
      </div>
    </OfficeLayout>
  );

  return (
    <OfficeLayout>
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Job Pipeline Hub
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Complete visibility across the entire quote → job → invoice pipeline
          </p>
        </div>

        {/* Filters and Search */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by client, vehicle, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="all">All Stages</option>
            <option value="quote">Quotes Only</option>
            <option value="job">Active Jobs</option>
            <option value="completed">Completed Jobs</option>
            <option value="invoice">Invoices Only</option>
          </select>
        </div>

        {/* Pipeline Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {quotes.filter(q => !jobs.find(j => j.quote_id === q.id)).length}
            </div>
            <div className="text-sm text-blue-600 dark:text-blue-400">Pending Quotes</div>
          </div>
          
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {jobs.filter(j => j.status !== 'completed').length}
            </div>
            <div className="text-sm text-yellow-600 dark:text-yellow-400">Active Jobs</div>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {jobs.filter(j => j.status === 'completed').length}
            </div>
            <div className="text-sm text-green-600 dark:text-green-400">Completed Jobs</div>
          </div>
          
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {invoices.length}
            </div>
            <div className="text-sm text-purple-600 dark:text-purple-400">Total Invoices</div>
          </div>
        </div>

        {/* Pipeline Items */}
        <div className="space-y-4">
          {filteredData.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">No items found matching your criteria</p>
            </div>
          ) : (
            filteredData.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-lg transition-shadow duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{getTypeIcon(item.type)}</div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {item.stage}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        ID: {item.data.id} • Created: {new Date(item.created).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(item.status)}`}>
                      {item.status.replace('_', ' ').toUpperCase()}
                    </span>
                    {item.amount && (
                      <span className="text-lg font-semibold text-gray-900 dark:text-white">
                        €{Number(item.amount).toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Client and Vehicle Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">Client</h4>
                    <p className="text-gray-900 dark:text-white">
                      {item.client ? `${item.client.first_name} ${item.client.last_name}` : 'N/A'}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">Vehicle</h4>
                    <p className="text-gray-900 dark:text-white">
                      {item.vehicle ? `${item.vehicle.licence_plate} - ${item.vehicle.make} ${item.vehicle.model}` : 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">
                  {/* View Details */}
                  {item.type === 'quote' && (
                    <Link
                      href={`/office/quotations/${item.data.id}/edit`}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      View Quote
                    </Link>
                  )}
                  
                  {item.type === 'job' && (
                    <Link
                      href={`/office/jobs/${item.data.id}`}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      View Job
                    </Link>
                  )}
                  
                  {item.type === 'completed' && (
                    <Link
                      href={`/office/jobs/${item.data.id}`}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      View Job
                    </Link>
                  )}
                  
                  {item.type === 'invoice' && (
                    <Link
                      href={`/office/invoices/${item.data.id}`}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                    >
                      View Invoice
                    </Link>
                  )}

                  {/* PDF Downloads */}
                  {item.type === 'quote' && (
                    <a
                      href={`/api/quotes/${item.data.id}/pdf`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
                    >
                      📄 Quote PDF
                    </a>
                  )}
                  
                  {item.type === 'completed' && item.invoices && item.invoices.length > 0 && (
                    <a
                      href={`/api/invoices/${item.invoices[0].id}/pdf`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
                    >
                      💰 Invoice PDF
                    </a>
                  )}
                  
                  {item.type === 'invoice' && (
                    <a
                      href={`/api/invoices/${item.data.id}/pdf`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
                    >
                      💰 Invoice PDF
                    </a>
                  )}

                  {/* Pipeline Navigation */}
                  {item.type === 'quote' && (
                    <Link
                      href={`/office/jobs/new?quote_id=${item.data.id}`}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
                    >
                      ➡️ Create Job
                    </Link>
                  )}
                  
                  {item.type === 'job' && item.status === 'ready_for_completion' && (
                    <Link
                      href={`/office/invoices/new?job_id=${item.data.id}`}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
                    >
                      ➡️ Create Invoice
                    </Link>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </OfficeLayout>
  );
}
