import React from 'react';
import { useRouter } from 'next/router';
import { Layout } from '../../../components/Layout';
import PartAutocomplete from '../../../components/PartAutocomplete';

export default function NewQuotationPage() {
  const { query } = useRouter();
  return (
    <Layout>
      <h1 className="text-2xl font-semibold mb-4">New Quote</h1>
      <p className="text-sm">Placeholder page for creating a quote.</p>
      <div className="max-w-sm mt-4">
        <label className="block mb-1">Add Part</label>
        <PartAutocomplete onSelect={p => console.log('selected', p)} />
      </div>
      {query.client_id && (
        <p className="text-sm">Client ID: {query.client_id}</p>
      )}
      {query.vehicle_id && (
        <p className="text-sm">Vehicle ID: {query.vehicle_id}</p>
      )}
    </Layout>
  );
}
