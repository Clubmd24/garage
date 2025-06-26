import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Sidebar } from '../../../components/Sidebar';
import { Header } from '../../../components/Header';
import { Card } from '../../../components/Card';

export default function TaskDetail() {
  const router = useRouter();
  const { id } = router.query;

  const [task, setTask] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    fetch(`/api/dev/tasks/${id}`, { credentials: 'include' })
      .then(r => {
        if (!r.ok) throw new Error(`Task fetch failed (${r.status})`);
        return r.json();
      })
      .then(setTask)
      .catch(e => setError(e.message));
  }, [id]);

  if (error) {
    return <p className="p-8 text-red-500">Error: {error}</p>;
  }
  if (!task) {
    return <p className="p-8">Loading task…</p>;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="p-8 space-y-6">
          <Head><title>Task – {task.title}</title></Head>

          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">
              {task.title}
            </h1>
            <div className="flex items-center space-x-4">
              <Link href={`/dev/tasks/${id}/edit`} className="button-secondary">
                Edit Task
              </Link>
              <Link href={`/dev/projects/${task.dev_project_id}`} className="text-[var(--color-primary)] hover:underline">
                &larr; Back to Project
              </Link>
            </div>
          </div>

          <Card className="space-y-2">
            <p><strong>Description:</strong> {task.description || '—'}</p>
            <p><strong>Status:</strong> {task.status}</p>
            {task.assignee && <p><strong>Assigned To:</strong> {task.assignee}</p>}
            {task.due_date && <p><strong>Due Date:</strong> {task.due_date.slice(0,10)}</p>}
          </Card>
        </main>
      </div>
    </div>
  );
}
