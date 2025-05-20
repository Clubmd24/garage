// File: pages/dev/projects/index.js
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sidebar } from '../../components/Sidebar';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await fetch('/api/dev/projects', { credentials: 'include' });
      const data = await res.json();
      setProjects(data);
    } catch (err) {
      console.error('Failed to load projects', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="flex min-h-screen bg-[var(--color-bg)] dark:bg-[var(--color-bg)]">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="p-8 space-y-6">
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">Projects</h1>

          <div>
            <Link href="/dev/projects/new">
              <a className="button">+ Create New Project</a>
            </Link>
          </div>

          {loading ? (
            <p>Loading…</p>
          ) : projects.length === 0 ? (
            <p className="text-[var(--color-text-secondary)]">No projects yet.</p>
          ) : (
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((p) => (
                <Card key={p.id}>
                  <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">
                    {p.name}
                  </h2>
                  <p className="text-[var(--color-text-secondary)] mb-4">
                    {p.description || '—'}
                  </p>
                  <Link href={`/dev/projects/${p.id}`}>
                    <a className="button text-sm">View Details</a>
                  </Link>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
