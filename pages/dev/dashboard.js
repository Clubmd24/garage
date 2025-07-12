import { useEffect, useState } from 'react';
import Head from 'next/head';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import Image from 'next/image';
import Card from '../../components/Card';
import { highlightMentions } from '../../lib/highlightMentions.js';

const S3_BASE_URL = `https://${process.env.NEXT_PUBLIC_S3_BUCKET}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com`;

const userColor = (name) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue} 65% 45%)`;
};

export default function DevDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const r = await fetch('/api/dev/dashboard', { credentials: 'include' });
        if (!r.ok) throw new Error(`Fetch failed (${r.status})`);
        const d = await r.json();
        setData(d);
      } catch (err) {
        setError(err.message);
      }
    }
    load();
  }, []);

  if (error) {
    return <p className="p-8 text-red-500">Error: {error}</p>;
  }
  if (!data) {
    return <p className="p-8">Loading dashboard…</p>;
  }

  const { projects, announcements } = data;

  return (
    <div className="min-h-screen flex flex-col sm:flex-row">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-y-auto">
        <Header />
        <main className="p-8 space-y-8">
          <Head><title>Dashboard</title></Head>
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">Dashboard</h1>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-[var(--color-text-primary)]">Project Summary</h2>
            <div className="space-y-4">
              {projects.map(p => (
                <Card key={p.id} className="flex justify-between items-center">
                  <span className="font-semibold">{p.name}</span>
                  <div className="flex space-x-4 text-sm">
                    <span>Todo: {p.todo}</span>
                    <span>In Progress: {p.in_progress}</span>
                    <span>Done: {p.done}</span>
                  </div>
                </Card>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-[var(--color-text-primary)]">Important Announcements</h2>
            {!announcements.length ? (
              <p className="text-[var(--color-text-secondary)]">No announcements.</p>
            ) : (
              <div className="space-y-4">
                {announcements.map(a => (
                  <Card key={a.id}>
                    <div>
                      <span className="font-semibold mr-2" style={{ color: userColor(a.user) }}>
                        {a.user}:
                      </span>
                      <span>{highlightMentions(a.body)}</span>
                      {a.s3_key && (
                        a.content_type && a.content_type.startsWith('image/') ? (
                          <Image
                            src={`${S3_BASE_URL}/${a.s3_key}`}
                            alt="attachment"
                            width={0}
                            height={0}
                            sizes="100vw"
                            style={{ width: '100%', height: 'auto' }}
                            className="mt-2 max-w-xs"
                          />
                        ) : (
                          <a href={`${S3_BASE_URL}/${a.s3_key}`} target="_blank" rel="noopener noreferrer" className="block mt-2 text-blue-500 underline" download>
                            {a.file_name || a.s3_key.split('/').pop()}
                          </a>
                        )
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
