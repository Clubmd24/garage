import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import OfficeLayout from '../../../components/OfficeLayout';
import AD360LinkModal from '../../../components/suppliers/AD360LinkModal';

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAD360Modal, setShowAD360Modal] = useState(false);
  const [ad360Status, setAd360Status] = useState(null);

  const load = () => {
    setLoading(true);
    fetch('/api/suppliers')
      .then(r => (r.ok ? r.json() : Promise.reject()))
      .then(setSuppliers)
      .catch(() => setError('Failed to load suppliers'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);
  
  // Check AD360 integration status
  useEffect(() => {
    const checkAD360Status = async () => {
      try {
        const response = await fetch('/api/suppliers/7');
        if (response.ok) {
          const supplier = await response.json();
          // Check if there's a linked account
          const accountResponse = await fetch('/api/integrations/ad360/status?tenantId=1&supplierId=7');
          if (accountResponse.ok) {
            const status = await accountResponse.json();
            setAd360Status(status);
          }
        }
      } catch (error) {
        console.error('Failed to check AD360 status:', error);
      }
    };
    
    checkAD360Status();
  }, []);

  const filtered = suppliers.filter(s =>
    (s.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <OfficeLayout>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Suppliers</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAD360Modal(true)}
            className="button-secondary"
          >
            🔗 Link AD360
          </button>
          <Link href="/office/suppliers/new" className="button">
            + New Supplier
          </Link>
        </div>
      </div>
      {error && <p className="text-red-500">{error}</p>}
      {loading ? (
        <p>Loading…</p>
      ) : (
        <>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search…"
            className="input mb-4 w-full"
          />
          <div className="grid gap-4 sm:grid-cols-2">
            {filtered.map(s => (
              <div key={s.id} className="item-card">
                <h2 className="font-semibold mb-1">{s.name}</h2>
                <p className="text-sm">{s.email_address}</p>
                <p className="text-sm">{s.contact_number}</p>
                {s.id === 7 && ad360Status && (
                  <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm">
                    <span className="text-green-700">✓ AD360 Linked</span>
                    <div className="text-xs text-green-600 mt-1">
                      Last linked: {new Date(ad360Status.lastSessionAt).toLocaleDateString()}
                    </div>
                  </div>
                )}
                <Link href={`/office/suppliers/${s.id}`} className="button mt-2 px-4 text-sm">
                  Edit
                </Link>
              </div>
            ))}
          </div>
        </>
      )}
      
      {showAD360Modal && (
        <AD360LinkModal
          onClose={() => setShowAD360Modal(false)}
          onSuccess={() => {
            setShowAD360Modal(false);
            // Refresh status
            window.location.reload();
          }}
        />
      )}
    </OfficeLayout>
  );
}
