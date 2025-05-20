// File: pages/dev/projects/index.js

import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Sidebar } from '../../../components/Sidebar';
import { Header } from '../../../components/Header';
import { Card } from '../../../components/Card';

export default function Projects() {
  const router = useRouter();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadProjects = async () => {
    setError(null);
    try {
      const res = await fetch('/api/dev/projects', {
        credentials: 'include'
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setProjects(data);
    } catch (err) {
      console.error('ERROR loading projects', err);
      setError(err.message || 'Failed to load');
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this project?')) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/dev/projects/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!res.ok) {
        const body = await res.text();
        throw new Error(body || res.statusText);
      }
      await loadProjects();
    } catch (err) {
      console.error('DELETE error', err);
      alert('Failed to delete: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[var(--color-bg)]">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="p-8 space-y-6">
          <Head><title>Dev Portal – Projects</title></Head>
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">Projects</h1>
            <button
              onClick={() => router.push('/dev/projects/new')}
              className="button"
              disabled={loading}
            >
              + Create New Project
            </button>
          </div>

          {error && (
            <div className="text-red-500">Error: {error}</div>
          )}

          {!projects.length && !error ? (
            <p className="text-[var(--color-text-secondary)]">No projects yet.</p>
          ) : (
            <div className="grid gap-4">
              {projects.map(p => (
                <Card key={p.id} className="group relative">
                  <Link href={`/dev/projects/${p.id}`}>
                    <a className="block">
                      <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">
                        {p.name}
                      </h2>
                      {p.description && (
                        <p className="mt-1 text-[var(--color-text-secondary)]">
                          {p.description}
                        </p>
                      )}
                      <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                        Created by {p.creator} on {new Date(p.created_at).toLocaleDateString()}
                      </p>
                    </a>
                  </Link>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="absolute top-4 right-4 text-red-500 opacity-0 group-hover:opacity-100 transition"
                    disabled={loading}
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
