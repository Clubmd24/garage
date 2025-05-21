// File: pages/dev/projects/[id].js

import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Sidebar } from '../../../components/Sidebar';
import { Header } from '../../../components/Header';
import { Card } from '../../../components/Card';

export default function ProjectDetail() {
  const router = useRouter();
  const { id } = router.query;

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState('');

  // Load project
  useEffect(() => {
    if (!id) return;
    fetch(`/api/dev/projects/${id}`, { credentials: 'include' })
      .then(r => {
        if (!r.ok) throw new Error(`Project fetch failed (${r.status})`);
        return r.json();
      })
      .then(setProject)
      .catch(e => setError(e.message));
  }, [id]);

  // Load tasks under this project
  useEffect(() => {
    if (!id) return;
    fetch(`/api/dev/tasks?project_id=${id}`, { credentials: 'include' })
      .then(r => {
        if (!r.ok) throw new Error(`Tasks fetch failed (${r.status})`);
        return r.json();
      })
      .then(setTasks)
      .catch(e => setError(e.message));
  }, [id]);

  if (error) {
    return <p className="p-8 text-red-500">Error: {error}</p>;
  }
  if (!project) {
    return <p className="p-8">Loading project…</p>;
  }

  return (
    <div className="flex min-h-screen bg-[var(--color-bg)]">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="p-8 space-y-6">
          <Head><title>Project – {project.name}</title></Head>

          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">
              {project.name}
            </h1>
            <Link href="/dev/projects">
              <a className="text-[var(--color-primary)] hover:underline">&larr; Back to Projects</a>
            </Link>
          </div>

          {project.description && (
            <p className="text-[var(--color-text-secondary)]">{project.description}</p>
          )}

          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-[var(--color-text-primary)]">Tasks</h2>
            <Link href={`/dev/tasks/new?project_id=${id}`}>
              <a className="button">+ Add Task</a>
            </Link>
          </div>

          {!tasks.length ? (
            <p className="text-[var(--color-text-secondary)]">No tasks yet.</p>
          ) : (
            <div className="grid gap-4">
              {tasks.map(t => (
                <Card key={t.id} className="group relative">
                  <Link href={`/dev/tasks/${t.id}`}>
                    <a className="block">
                      <h3 className="text-xl font-semibold text-[var(--color-text-primary)]">
                        {t.title}
                      </h3>
                      <p className="mt-1 text-[var(--color-text-secondary)]">
                        Status: {t.status}
                      </p>
                    </a>
                  </Link>
                  <button
                    onClick={async () => {
                      if (!confirm('Delete this task?')) return;
                      await fetch(`/api/dev/tasks/${t.id}`, {
                        method: 'DELETE',
                        credentials: 'include'
                      });
                      setTasks(tasks.filter(x => x.id !== t.id));
                    }}
                    className="absolute top-4 right-4 text-red-500 opacity-0 group-hover:opacity-100 transition"
                  >
                    Delete
                  </button>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
