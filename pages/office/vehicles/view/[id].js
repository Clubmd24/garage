import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Layout } from '../../../../components/Layout';
import { Card } from '../../../../components/Card';

export default function VehicleViewPage() {
  const router = useRouter();
  const { id } = router.query;
  const [vehicle, setVehicle] = useState(null);
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    async function load() {
      try {
        const vRes = await fetch(`/api/vehicles/${id}`);
        if (!vRes.ok) throw new Error();
        const v = await vRes.json();
        setVehicle(v);
        if (v.customer_id) {
          const cRes = await fetch(`/api/clients/${v.customer_id}`);
          if (!cRes.ok) throw new Error();
          setClient(await cRes.json());
        }
      } catch (err) {
        setError('Failed to load');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const deleteVehicle = async () => {
    if (!confirm('Delete this vehicle?')) return;
    await fetch(`/api/vehicles/${id}`, { method: 'DELETE' });
    router.push('/office/vehicles');
  };

  if (loading) return <Layout><p>Loading…</p></Layout>;
  if (error) return <Layout><p className="text-red-500">{error}</p></Layout>;

  return (
    <Layout>
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <Link href={`/office/vehicles/${id}`}><a className="button">Edit Vehicle</a></Link>
        {client && (
          <Link href={`/office/clients/${client.id}`}><a className="button">Edit Client</a></Link>
        )}
        <button onClick={deleteVehicle} className="button bg-red-600 hover:bg-red-700">Delete</button>
        <Link href="/office/vehicles"><a className="button">Back to Vehicles</a></Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <h2 className="text-xl font-semibold mb-4">Client Info</h2>
          {client ? (
            <>
              <p><strong>Name:</strong> {client.first_name} {client.last_name}</p>
              <p><strong>Email:</strong> {client.email}</p>
              <p><strong>Mobile:</strong> {client.mobile}</p>
              <p><strong>Landline:</strong> {client.landline}</p>
              <p><strong>NIE Number:</strong> {client.nie_number}</p>
              <p><strong>Address:</strong> {client.street_address}, {client.town}, {client.province} {client.post_code}</p>
            </>
          ) : (
            <p>No client assigned</p>
          )}
        </Card>
        <Card>
          <h2 className="text-xl font-semibold mb-4">Vehicle Info</h2>
          <p><strong>Plate:</strong> {vehicle.licence_plate}</p>
          <p><strong>Make:</strong> {vehicle.make}</p>
          <p><strong>Model:</strong> {vehicle.model}</p>
          <p><strong>Color:</strong> {vehicle.color}</p>
          <p><strong>Fleet ID:</strong> {vehicle.fleet_id || 'N/A'}</p>
        </Card>
      </div>
    </Layout>
  );
}
