import React, { useState, useEffect } from 'react';
import OfficeLayout from '../../../components/OfficeLayout.jsx';

// Simple date formatting function
const formatDate = (date) => {
  const d = new Date(date);
  return d.toISOString().split('T')[0];
};

export default function SupplierCreditManagementPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [creditSummary, setCreditSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load suppliers with credit info
      const suppliersResponse = await fetch('/api/suppliers/credit');
      if (!suppliersResponse.ok) {
        throw new Error(`Failed to load suppliers: ${suppliersResponse.status}`);
      }
      const suppliersData = await suppliersResponse.json();
      
      // Ensure suppliers data is an array and has valid structure
      if (Array.isArray(suppliersData)) {
        setSuppliers(suppliersData);
      } else {
        console.error('Suppliers data is not an array:', suppliersData);
        setSuppliers([]);
      }
      
      // Load credit summary
      const summaryResponse = await fetch('/api/suppliers/credit?summary=true');
      if (!summaryResponse.ok) {
        throw new Error(`Failed to load summary: ${summaryResponse.status}`);
      }
      const summaryData = await summaryResponse.json();
      
      // Ensure summary data has valid structure
      if (summaryData && typeof summaryData === 'object') {
        setCreditSummary(summaryData);
      } else {
        console.error('Summary data is not valid:', summaryData);
        setCreditSummary(null);
      }
    } catch (error) {
      console.error('Error loading supplier credit data:', error);
      setSuppliers([]);
      setCreditSummary(null);
    } finally {
      setLoading(false);
    }
  };

  const getCreditStatusColor = (status) => {
    switch (status) {
      case 'At Limit': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'Near Limit': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'OK': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getCreditUsagePercentage = (used, limit) => {
    if (!limit || limit === 0) return 0;
    return Math.min((used / limit) * 100, 100);
  };

  const handlePaymentSubmit = async (paymentData) => {
    try {
      const response = await fetch('/api/suppliers/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...paymentData,
          created_by: 1 // TODO: Get from auth context
        })
      });

      if (response.ok) {
        setShowPaymentModal(false);
        loadData(); // Refresh data
        alert('Payment recorded successfully!');
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error recording payment:', error);
      alert('Failed to record payment');
    }
  };

  const handleLimitUpdate = async (supplierId, newLimit) => {
    try {
      const response = await fetch(`/api/suppliers/${supplierId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credit_limit: newLimit })
      });

      if (response.ok) {
        setShowLimitModal(false);
        loadData(); // Refresh data
        alert('Credit limit updated successfully!');
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error updating credit limit:', error);
      alert('Failed to update credit limit');
    }
  };

  if (loading) {
    return (
      <OfficeLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </OfficeLayout>
    );
  }

  return (
    <OfficeLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Supplier Credit Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Monitor and manage supplier credit limits, usage, and payments
          </p>
        </div>

        {/* Credit Summary Cards */}
        {creditSummary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Suppliers</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">{creditSummary.total_suppliers}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-green-100 dark:bg-green-900">
                  <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">With Limits</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">{creditSummary.suppliers_with_limits}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-yellow-100 dark:bg-yellow-900">
                  <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Near Limit</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">{creditSummary.near_limit}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-red-100 dark:bg-red-900">
                  <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">At Limit</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">{creditSummary.at_limit}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Suppliers Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Supplier Credit Status</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Supplier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Credit Limit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Used
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Available
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {Array.isArray(suppliers) && suppliers.length > 0 ? (
                  suppliers.map((supplier) => {
                    // Ensure supplier has required properties
                    if (!supplier || typeof supplier !== 'object') {
                      console.error('Invalid supplier data:', supplier);
                      return null;
                    }
                    
                    return (
                      <tr key={supplier.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {supplier.name || 'Unknown Supplier'}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              ID: {supplier.id || 'N/A'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {supplier.credit_limit ? `€${Number(supplier.credit_limit).toFixed(2)}` : 'No Limit'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            €{supplier.current_credit_balance ? Number(supplier.current_credit_balance).toFixed(2) : '0.00'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {supplier.credit_limit ? `€${supplier.available_credit ? Number(supplier.available_credit).toFixed(2) : '0.00'}` : 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCreditStatusColor(supplier.credit_status)}`}>
                            {supplier.credit_status || 'Unknown'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setSelectedSupplier(supplier);
                                setShowPaymentModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                              Record Payment
                            </button>
                            <button
                              onClick={() => {
                                setSelectedSupplier(supplier);
                                setShowLimitModal(true);
                              }}
                              className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                            >
                              Set Limit
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                      {suppliers.length === 0 ? 'No suppliers found' : 'Loading suppliers...'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment Modal */}
        {showPaymentModal && selectedSupplier && (
          <PaymentModal
            supplier={selectedSupplier}
            onClose={() => setShowPaymentModal(false)}
            onSubmit={handlePaymentSubmit}
          />
        )}

        {/* Credit Limit Modal */}
        {showLimitModal && selectedSupplier && (
          <CreditLimitModal
            supplier={selectedSupplier}
            onClose={() => setShowLimitModal(false)}
            onSubmit={handleLimitUpdate}
          />
        )}
      </div>
    </OfficeLayout>
  );
}

// Payment Modal Component
function PaymentModal({ supplier, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    payment_amount: '',
    payment_date: formatDate(new Date()),
    payment_method: 'bank_transfer',
    reference_number: '',
    description: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      supplier_id: supplier.id,
      ...formData
    });
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Record Payment - {supplier.name}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Payment Amount (€)
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.payment_amount}
                onChange={(e) => setFormData({...formData, payment_amount: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Payment Date
              </label>
              <input
                type="date"
                required
                value={formData.payment_date}
                onChange={(e) => setFormData({...formData, payment_date: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Payment Method
              </label>
              <select
                value={formData.payment_method}
                onChange={(e) => setFormData({...formData, payment_method: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cheque">Cheque</option>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Reference Number
              </label>
              <input
                type="text"
                value={formData.reference_number}
                onChange={(e) => setFormData({...formData, reference_number: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Invoice number, cheque number, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Payment description..."
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md hover:bg-gray-200 dark:hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
              >
                Record Payment
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Credit Limit Modal Component
function CreditLimitModal({ supplier, onClose, onSubmit }) {
  const [creditLimit, setCreditLimit] = useState(supplier.credit_limit || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(supplier.id, parseFloat(creditLimit));
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Set Credit Limit - {supplier.name}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Credit Limit (€)
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={creditLimit}
                onChange={(e) => setCreditLimit(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter credit limit amount"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md hover:bg-gray-200 dark:hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700"
              >
                Set Limit
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
