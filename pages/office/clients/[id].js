// pages/office/clients/[id].js
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import OfficeLayout from '../../../components/OfficeLayout';
import { fetchVehicles } from '../../../lib/vehicles';

const EditClientPage = () => {
  const router = useRouter();
  const { id, pw } = router.query;
  const [pin, setPin] = useState(router.query.pin || '');
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    mobile: '',
    landline: '',
    nie_number: '',
    street_address: '',
    town: '',
    province: '',
    post_code: '',
  });
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/clients/${id}`)
      .then(r => r.json())
      .then(data => {
        setForm(data);
        if (data.pin) setPin(data.pin);
      })
      .catch(() => setError('Failed to load'))
      .finally(() => setLoading(false));
    fetchVehicles(id)
      .then(setVehicles)
      .catch(() => {})
      .finally(() => {});
  }, [id]);

  const submit = async e => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/clients/${id}`, {
        method: 'PUT',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      router.push('/office/clients');
    } catch {
      setError('Failed to update');
    }
  };

  const change = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleDeleteVehicle = async vid => {
    if (!confirm('Delete this vehicle?')) return;
    await fetch(`/api/vehicles/${vid}`, { method: 'DELETE' });
    fetchVehicles(id).then(setVehicles);
  };

  if (loading) return <OfficeLayout><p>Loading…</p></OfficeLayout>;

  return (
    <OfficeLayout>
      <h1 className="text-2xl font-semibold mb-4">Edit Client</h1>
      {pw && (
        <p className="mb-4 font-semibold">Password: {pw}</p>
      )}
      {pin && (
        <p className="mb-4 font-semibold">PIN: {pin}</p>
      )}
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={submit} className="space-y-4 max-w-md">
        {[
          'first_name',
          'last_name',
          'email',
          'mobile',
          'landline',
          'nie_number',
          'street_address',
          'town',
          'province',
          'post_code',
        ].map(field => (
          <div key={field}>
            <label className="block mb-1">{field.replace('_',' ').replace(/\b\w/g, c => c.toUpperCase())}</label>
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
            <Link href={`/office/vehicles/new?customer_id=${id}`} className="button px-4">
              Add Vehicle
            </Link>
            <Link href={`/office/quotations/new?client_id=${id}`} className="button px-4">
              New Quote
            </Link>
            <Link href={`/office/jobs/new?client_id=${id}`} className="button px-4">
              New Job
            </Link>
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
                    <Link href={`/office/vehicles/${v.id}`}>
                      <a className="mr-2 underline">Edit</a>
                    </Link>
                    <button
                      onClick={() => handleDeleteVehicle(v.id)}
                      className="underline text-red-600"
                    >
                      Delete
                    </button>
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

export default EditClientPage;
