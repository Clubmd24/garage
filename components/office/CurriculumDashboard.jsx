import React, { useEffect, useState } from 'react';
import Table from '../ui/Table.jsx';
import Modal from '../ui/Modal.jsx';
import Button from '../ui/Button.jsx';
import { Card } from '../Card.js';
import { fetchJSON } from '@/lib/api';

export default function CurriculumDashboard() {
  const [standards, setStandards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    fetchJSON(
      `/api/standards/status?secret=${process.env.NEXT_PUBLIC_API_SECRET}`
    )
      .then(d => {
        setStandards(d.standards || []);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load standards');
        setLoading(false);
      });
  }, []);

  const handleView = std => {
    setSelected(std);
    setQuestions([]);
    fetchJSON(
      `/api/standards/${std.id}?secret=${process.env.NEXT_PUBLIC_API_SECRET}`
    )
      .then(d => setQuestions(d.questions || []))
      .catch(() => setQuestions([]));
  };

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
              <th className="px-2 py-1 text-left">Questions</th>
            </tr>
          </thead>
          <tbody>
            {standards.map(s => (
              <tr key={s.id || s.code}>
                <td className="px-2 py-1">{s.code}</td>
                <td className="px-2 py-1">{s.title}</td>
                <td className="px-2 py-1">
                  <Button className="button-secondary" onClick={() => handleView(s)}>
                    View Questions
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
                  <th className="px-2 py-1 text-left">Question</th>
                </tr>
              </thead>
              <tbody>
                {questions.map(q => (
                  <tr key={q.no}>
                    <td className="px-2 py-1">{q.no}</td>
                    <td className="px-2 py-1">{q.text}</td>
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
