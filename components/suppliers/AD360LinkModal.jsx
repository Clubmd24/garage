import React, { useState } from 'react';

export default function AD360LinkModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    username: '',
    password: '',
    consent: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.consent) {
      setError('You must consent to automated fetching to use AD360 integration');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/integrations/ad360/link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: 1, // Default tenant ID
          supplierId: 7, // AD360 supplier ID
          username: form.username,
          password: form.password,
          consent: form.consent
        })
      });

      if (response.status === 401) {
        const data = await response.json();
        setError(data.error || 'Invalid credentials');
        return;
      }

      if (response.status === 409) {
        const data = await response.json();
        setError(data.error || 'Re-link required at AD360');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to link AD360 account');
      }

      onSuccess();

    } catch (error) {
      console.error('AD360 link error:', error);
      setError('Failed to link AD360 account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Link AD360 Account</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={isLoading}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              AD360 Username/Email
            </label>
            <input
              type="text"
              value={form.username}
              onChange={(e) => handleChange('username', e.target.value)}
              className="input w-full"
              placeholder="Enter your AD360 username or email"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              AD360 Password
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => handleChange('password', e.target.value)}
              className="input w-full"
              placeholder="Enter your AD360 password"
              required
              disabled={isLoading}
            />
          </div>

          <div className="flex items-start">
            <input
              type="checkbox"
              id="consent"
              checked={form.consent}
              onChange={(e) => handleChange('consent', e.target.checked)}
              className="mt-1 mr-2"
              disabled={isLoading}
            />
            <label htmlFor="consent" className="text-sm text-gray-700">
              I consent to automated fetching of parts data from AD360 for vehicle lookups.
              My credentials will not be stored - only an encrypted session will be saved.
            </label>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded p-3">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Your AD360 username and password are used only once to establish a secure session. 
              They are never stored in our system. Only an encrypted session token is saved for future API calls.
            </p>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={isLoading || !form.consent}
              className={`flex-1 px-4 py-2 rounded font-medium ${
                isLoading || !form.consent
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isLoading ? 'Linking...' : 'Link Account'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 border border-gray-300 rounded font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 