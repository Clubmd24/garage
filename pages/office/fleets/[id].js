import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import OfficeLayout from '../../../components/OfficeLayout';

const EditFleetPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [pin, setPin] = useState(router.query.pin || '');
  const [form, setForm] = useState({
    company_name: '',
    garage_name: '',
    account_rep: '',
    payment_terms: '',
    street_address: '',
    contact_number_1: '',
    contact_number_2: '',
    email_1: '',
    email_2: '',
    credit_limit: '',
    tax_number: '',
    contact_name_1: '',
    contact_name_2: '',
  });
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/fleets/${id}`)
      .then(r => r.json())
      .then(data => {
        setForm(data);
        if (data.pin) setPin(data.pin);
      })
      .catch(() => setError('Failed to load'))
      .finally(() => setLoading(false));
    fetch('/api/vehicles')
      .then(r => r.json())
      .then(vs => setVehicles(vs.filter(v => String(v.fleet_id) === id)))
      .catch(() => {});
  }, [id]);

  const submit = async e => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/fleets/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      router.push('/office/fleets');
    } catch {
      setError('Failed to update');
    }
  };

  const change = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleDeleteVehicle = async vid => {
    if (!confirm('Delete this vehicle?')) return;
    await fetch(`/api/vehicles/${vid}`, { method: 'DELETE' });
    setVehicles(vs => vs.filter(v => v.id !== vid));
  };

  const regenerate = async () => {
    try {
      const res = await fetch(`/api/fleets/${id}/pin`, { method: 'POST' });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setPin(data.pin);
    } catch {
      setError('Failed to regenerate PIN');
    }
  };

  if (loading) return <OfficeLayout><p>Loading…</p></OfficeLayout>;

  return (
    <OfficeLayout>
      <h1 className="text-2xl font-semibold mb-4">Edit Fleet</h1>
      {pin && (
        <p className="mb-4 font-semibold">PIN: {pin}</p>
      )}
      <button onClick={regenerate} className="button mb-4">Regenerate PIN</button>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={submit} className="space-y-4 max-w-md">
        {[
          'company_name',
          'garage_name',
          'account_rep',
          'payment_terms',
          'street_address',
          'contact_number_1',
          'contact_number_2',
          'email_1',
          'email_2',
          'credit_limit',
          'tax_number',
          'contact_name_1',
          'contact_name_2',
        ].map(field => (
          <div key={field}>
            <label className="block mb-1">{field.replace('_',' ').replace(/\b\w/g,c=>c.toUpperCase())}</label>
            <input
              name={field}
              value={form[field] || ''}
              onChange={change}
              className="w-full border px-3 py-2 rounded text-black"
            />
          </div>
        ))}
        <div className="flex gap-2">
          <button type="submit" className="button">Update</button>
          <button
            type="button"
            onClick={() => router.back()}
            className="button-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
      <div className="mt-8">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-semibold">Vehicles</h2>
          <div className="flex gap-4">
            <Link href={`/office/vehicles/new?fleet_id=${id}`} className="button px-4">Add Vehicle</Link>
          </div>
        </div>
        {vehicles.length === 0 ? (
          <p>No vehicles</p>
        ) : (
          <table className="min-w-full bg-white border">
            <thead>
              <tr>
                <th className="px-4 py-2 border text-black">Plate</th>
                <th className="px-4 py-2 border text-black">Make</th>
                <th className="px-4 py-2 border text-black">Model</th>
                <th className="px-4 py-2 border text-black">Color</th>
                <th className="px-4 py-2 border text-black">Actions</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map(v => (
                <tr key={v.id}>
                  <td className="px-4 py-2 border text-black">{v.licence_plate}</td>
                  <td className="px-4 py-2 border text-black">{v.make}</td>
                  <td className="px-4 py-2 border text-black">{v.model}</td>
                  <td className="px-4 py-2 border text-black">{v.color}</td>
                  <td className="px-4 py-2 border text-black">
                    <Link href={`/office/vehicles/${v.id}`} className="mr-2 underline">Edit</Link>
                    <button onClick={() => handleDeleteVehicle(v.id)} className="underline text-red-600">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </OfficeLayout>
  );
};

export default EditFleetPage;

