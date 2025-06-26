import Link from 'next/link';
import { useState,useEffect } from 'react';
import { Sidebar } from '../../../components/Sidebar';
import { Header } from '../../../components/Header';
import { Card } from '../../../components/Card';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState('');
  useEffect(() => {
    async function loadProjects() {
      try {
        const r = await fetch('/api/dev/projects', { credentials: 'include' });
        if (!r.ok) throw new Error(`Projects fetch failed (${r.status})`);
        const data = await r.json();
        setProjects(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message);
      }
    }
    loadProjects();
  }, []);
  return (
    <div className="min-h-screen flex flex-col sm:flex-row">
      <Sidebar/>
      <div className="flex-1 flex flex-col overflow-y-auto">
        <Header/>
        <main className="p-8">
          <h1 className="text-3xl mb-4">Projects</h1>
          <Link href="/dev/projects/new" className="button">+ New Project</Link>
          {error && <p className="text-red-500 mt-4">{error}</p>}
          <div className="mt-4 space-y-4">
            {projects.map(p=>(
              <Card key={p.id}>
                <Link href={`/dev/projects/${p.id}`} className="block">
                  <h2 className="font-semibold">{p.name}</h2>
                  <p className="text-sm">{p.description}</p>
                </Link>
              </Card>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
