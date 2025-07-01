import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import OfficeLayout from '../../../../components/OfficeLayout';
import { Card } from '../../../../components/Card';
import { fetchDocuments } from '../../../../lib/documents';

export default function VehicleViewPage() {
  const router = useRouter();
  const { id } = router.query;
  const [vehicle, setVehicle] = useState(null);
  const [client, setClient] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [fleet, setFleet] = useState(null);
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
        if (v.fleet_id) {
          const fRes = await fetch(`/api/fleets/${v.fleet_id}`);
          if (!fRes.ok) throw new Error();
          setFleet(await fRes.json());
        }
        const docs = await fetchDocuments('vehicle', id);
        setDocuments(docs);
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

  if (loading) return <OfficeLayout><p>Loading…</p></OfficeLayout>;
  if (error) return <OfficeLayout><p className="text-red-500">{error}</p></OfficeLayout>;

  return (
    <OfficeLayout>
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <Link href={`/office/vehicles/${id}`}><a className="button">Edit Vehicle</a></Link>
        {client && (
          <Link href={`/office/clients/${client.id}`}><a className="button">Edit Client</a></Link>
        )}
        <Link href={`/office/quotations/new?vehicle_id=${id}`}><a className="button">New Quote</a></Link>
        <Link href={`/office/jobs/new?vehicle_id=${id}`}><a className="button">New Job</a></Link>
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
          <p><strong>Fleet:</strong> {fleet ? fleet.company_name : (vehicle.fleet_id || 'N/A')}</p>
        </Card>
        <Card>
          <h2 className="text-xl font-semibold mb-4">Documents</h2>
          {documents.length === 0 ? (
            <p>No documents</p>
          ) : (
            <ul className="list-disc pl-5 space-y-1">
              {documents.map(doc => (
                <li key={doc.id}>
                  <a href={doc.url} className="underline text-blue-600" download>
                    {doc.filename}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </OfficeLayout>
  );
}
