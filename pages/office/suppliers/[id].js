import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import OfficeLayout from '../../../components/OfficeLayout';
import AD360LinkModal from '../../../components/suppliers/AD360LinkModal';

export default function EditSupplierPage() {
  const router = useRouter();
  const { id } = router.query;
  const [form, setForm] = useState({
    name: '',
    address: '',
    contact_number: '',
    email_address: '',
    payment_terms: '',
    credit_limit: '',
  });
  const [error, setError] = useState(null);
  const [showAD360Modal, setShowAD360Modal] = useState(false);
  const [ad360Status, setAd360Status] = useState(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/suppliers/${id}`)
      .then(r => (r.ok ? r.json() : Promise.reject()))
      .then(setForm)
      .catch(() => setError('Failed to load supplier'));
  }, [id]);

  // Check AD360 status if this is the AD360 supplier
  useEffect(() => {
    if (id === '7') { // AD360 supplier ID
      checkAD360Status();
    }
  }, [id]);

  const checkAD360Status = async () => {
    try {
      const response = await fetch(`/api/integrations/ad360/status?tenantId=1&supplierId=7`);
      if (response.ok) {
        const data = await response.json();
        setAd360Status(data);
      } else {
        setAd360Status({ linked: false });
      }
    } catch (error) {
      console.error('Failed to check AD360 status:', error);
      setAd360Status({ linked: false });
    }
  };

  const change = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    try {
      await fetch(`/api/suppliers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      router.push('/office/suppliers');
    } catch {
      setError('Failed to update supplier');
    }
  };

  return (
    <OfficeLayout>
      <h1 className="text-2xl font-semibold mb-4">Edit Supplier</h1>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={submit} className="space-y-4 max-w-md">
        {['name','address','contact_number','email_address','payment_terms','credit_limit'].map(field => (
          <div key={field}>
            <label className="block mb-1">{field.replace('_',' ').replace(/\b\w/g,c=>c.toUpperCase())}</label>
            <input
              name={field}
              value={form[field] || ''}
              onChange={change}
              className="input w-full"
            />
          </div>
        ))}
        
        {/* AD360 Integration Section */}
        {id === '7' && (
          <div className="border-t pt-4 mt-4">
            <h3 className="text-lg font-medium mb-3">AD360 Integration</h3>
            
            {ad360Status ? (
              ad360Status.linked ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-800 font-medium">✓ AD360 Account Linked</p>
                      <p className="text-green-600 text-sm">
                        Last session: {ad360Status.lastSessionAt ? new Date(ad360Status.lastSessionAt).toLocaleString() : 'Unknown'}
                      </p>
                      <p className="text-green-600 text-sm">
                        Automated fetching: {ad360Status.consentAutomatedFetch ? 'Enabled' : 'Disabled'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowAD360Modal(true)}
                      className="px-3 py-1 bg-green-100 text-green-700 border border-green-300 rounded text-sm hover:bg-green-200"
                    >
                      Re-link
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
                  <p className="text-yellow-800 font-medium">⚠ AD360 Account Not Linked</p>
                  <p className="text-yellow-600 text-sm">
                    Link your AD360 account to enable parts lookup integration.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowAD360Modal(true)}
                    className="mt-2 px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                  >
                    Link AD360 Account
                  </button>
                </div>
              )
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-3">
                <p className="text-gray-600 text-sm">Checking AD360 status...</p>
              </div>
            )}
          </div>
        )}
        <div className="flex gap-2">
          <button type="submit" className="button">Save</button>
          <button
            type="button"
            onClick={() => router.back()}
            className="button-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
      
      {/* AD360 Link Modal */}
      {showAD360Modal && (
        <AD360LinkModal
          onClose={() => setShowAD360Modal(false)}
          onSuccess={() => {
            setShowAD360Modal(false);
            checkAD360Status();
          }}
        />
      )}
    </OfficeLayout>
  );
}
