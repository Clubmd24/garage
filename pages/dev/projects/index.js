// File: pages/dev/projects/index.js

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Sidebar } from '../../../components/Sidebar';
import { Header } from '../../../components/Header';
import { Card } from '../../../components/Card';

export default function Projects() {
  const router = useRouter();
  const [projects, setProjects] = useState([]);

  const loadProjects = async () => {
    try {
      await fetch('/api/auth/me', { credentials: 'include' }).then(r => {
        if (!r.ok) throw new Error();
      });
      const data = await fetch('/api/dev/projects', {
        credentials: 'include',
      }).then(r => r.json());
      setProjects(data);
    } catch {
      router.replace('/login');
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  return (
    <div className="flex min-h-screen bg-[var(--color-bg)]">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="p-8 space-y-8">
          <Head><title>Dev Portal – Projects</title></Head>

          <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">
            Projects
          </h1>

          <Card>
            <button
              onClick={() => router.push('/dev/projects/new')}
              className="button"
            >
              + Create New Project
            </button>
            {projects.length === 0 ? (
              <p className="mt-4 text-gray-500">No projects yet.</p>
            ) : (
              <ul className="mt-4 space-y-4">
                {projects.map(p => (
                  <li key={p.id}>
                    <Card>
                      <h2 className="text-lg font-medium">{p.name}</h2>
                      <p>{p.description}</p>
                      <div className="mt-2 text-sm text-gray-600">
                        Created by {p.creator} on{' '}
                        {new Date(p.created_at).toLocaleDateString()}
                      </div>
                    </Card>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </main>
      </div>
    </div>
  );
}
