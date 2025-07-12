import React, { useEffect, useState } from 'react';
import Table from '../ui/Table.jsx';
import Modal from '../ui/Modal.jsx';
import Button from '../ui/Button.jsx';
import { Card } from '../Card.js';

export default function CurriculumDashboard() {
  const [standards, setStandards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetch('/api/standards/status')
      .then(r => (r.ok ? r.json() : Promise.reject()))
      .then(d => {
        setStandards(d.standards || []);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load standards');
        setLoading(false);
      });
  }, []);

  return (
    <div>
      {loading && <p>Loading…</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && !error && (
        <Table>
          <thead>
            <tr>
              <th className="px-2 py-1 text-left">Code</th>
              <th className="px-2 py-1 text-left">Title</th>
              <th className="px-2 py-1 text-left">Sections</th>
            </tr>
          </thead>
          <tbody>
            {standards.map(s => (
              <tr key={s.id || s.code}>
                <td className="px-2 py-1">{s.code}</td>
                <td className="px-2 py-1">{s.title}</td>
                <td className="px-2 py-1">
                  <Button className="button-secondary" onClick={() => setSelected(s)}>
                    View
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
      {selected && (
        <Modal onClose={() => setSelected(null)}>
          <Card>
            <h2 className="text-lg font-semibold mb-2">{selected.title}</h2>
            <Table>
              <thead>
                <tr>
                  <th className="px-2 py-1 text-left">#</th>
                  <th className="px-2 py-1 text-left">Title</th>
                  <th className="px-2 py-1 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {(selected.sections || []).map(sec => (
                  <tr key={sec.id || sec.number}>
                    <td className="px-2 py-1">{sec.number}</td>
                    <td className="px-2 py-1">{sec.title}</td>
                    <td className="px-2 py-1">{sec.status}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
        </Modal>
      )}
    </div>
  );
}
