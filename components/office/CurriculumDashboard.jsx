import React, { useEffect, useState } from 'react';
import { Table } from '../ui/Table.jsx';
import { Modal } from '../ui/Modal.jsx';
import { Button } from '../ui/Button.jsx';
import { Card } from '../Card.js';
import { fetchJSON } from '../../lib/api';

export default function CurriculumDashboard({ active }) {
  const [standards, setStandards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);

  const load = () => {
    setLoading(true);
    fetchJSON('/api/standards/client-status')
      .then(d => {
        setStandards(d.standards || []);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load standards');
        setLoading(false);
      });
  };

  useEffect(() => {
    if (active) load();
  }, [active]);

  const handleView = std => {
    setSelected(std);
    setQuestions([]);
    setQuestionsLoading(true);
    fetchJSON(`/api/standards/client-questions?id=${std.id}`)
      .then(d => {
        setQuestions(d.questions || []);
        setQuestionsLoading(false);
      })
      .catch(() => {
        setQuestions([]);
        setQuestionsLoading(false);
      });
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
              <th className="px-2 py-1 text-left">PDF</th>
              <th className="px-2 py-1 text-left">Generated</th>
              <th className="px-2 py-1 text-left">Questions</th>
            </tr>
          </thead>
          <tbody>
            {standards.map(s => (
              <tr key={s.id || s.code}>
                <td className="px-2 py-1">{s.code}</td>
                <td className="px-2 py-1">{s.source_name}</td>
                <td className="px-2 py-1">
                  <a href={s.source_url} target="_blank" rel="noopener noreferrer">
                    PDF
                  </a>
                </td>
                <td className="px-2 py-1">
                  {s.generated_questions} / {s.target_questions}
                </td>
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
            <h2 className="text-lg font-semibold mb-2">{selected.source_name}</h2>
            {questionsLoading ? (
              <p>Loading…</p>
            ) : questions.length === 0 ? (
              <em>No questions found for this standard.</em>
            ) : (
              <Table>
                <thead>
                  <tr>
                    <th className="px-2 py-1 text-left">#</th>
                    <th className="px-2 py-1 text-left">Question</th>
                    <th className="px-2 py-1 text-left">Options</th>
                  </tr>
                </thead>
                <tbody>
                  {questions.map(q => (
                    <tr key={q.no}>
                      <td className="px-2 py-1">{q.no}</td>
                      <td className="px-2 py-1">{q.text}</td>
                      <td className="px-2 py-1">
                        <ul className="list-disc pl-4">
                          {q.options.map((opt, idx) => (
                            <li
                              key={idx}
                              className={idx === q.answer_index ? 'font-semibold' : ''}
                            >
                              {idx === q.answer_index ? '✓ ' : ''}
                              {opt}
                            </li>
                          ))}
                        </ul>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card>
        </Modal>
      )}
    </div>
  );
}
