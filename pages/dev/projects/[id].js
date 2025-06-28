// File: pages/dev/projects/[id].js

import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Sidebar } from '../../../components/Sidebar';
import { Header } from '../../../components/Header';
import { Card } from '../../../components/Card';

const S3_BASE_URL = `https://${process.env.NEXT_PUBLIC_S3_BUCKET}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com`;

export default function ProjectDetail() {
  const router = useRouter();
  const { id } = router.query;

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState('');
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

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

  // Load attachments
  useEffect(() => {
    if (!id) return;
    fetch(`/api/dev/files?project_id=${id}`, { credentials: 'include' })
      .then(r => {
        if (!r.ok) throw new Error(`Files fetch failed (${r.status})`);
        return r.json();
      })
      .then(setFiles)
      .catch(e => setError(e.message));
  }, [id]);

  async function handleUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const r = await fetch('/api/chat/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentType: file.type, file_name: file.name })
      });
      if (!r.ok) throw new Error('Failed to get upload URL');
      const { url, key } = await r.json();
      await fetch(url, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });
      const r2 = await fetch('/api/dev/files', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: id, s3_key: key, file_name: file.name, content_type: file.type })
      });
      if (!r2.ok) throw new Error('Failed to save file record');
      const { id: fid } = await r2.json();
      setFiles([...files, { id: fid, project_id: id, s3_key: key, file_name: file.name, content_type: file.type }]);
    } catch (err) {
      setError(err.message);
    }
    setUploading(false);
    e.target.value = '';
  }

  async function handleDelete() {
    if (!confirm('Delete this project?')) return;
    const r = await fetch(`/api/dev/projects/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    if (r.ok) {
      router.push('/dev/projects');
    }
  }

  if (error) {
    return <p className="p-8 text-red-500">Error: {error}</p>;
  }
  if (!project) {
    return <p className="p-8">Loading project…</p>;
  }

  return (
    <div className="min-h-screen flex flex-col sm:flex-row">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-y-auto">
        <Header />
        <main className="p-8 space-y-6">
          <Head><title>Project – {project.name}</title></Head>

          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">
              {project.name}
            </h1>
          <div className="flex items-center space-x-4">
            <Link href={`/dev/projects/${id}/edit`} className="button-secondary">
              Edit Project
            </Link>
            <button onClick={handleDelete} className="text-red-500 hover:underline">
              Delete Project
            </button>
            <Link href="/dev/projects" className="text-[var(--color-primary)] hover:underline">
              &larr; Back to Projects
            </Link>
          </div>
          </div>

          {project.description && (
            <p className="text-[var(--color-text-secondary)]">{project.description}</p>
          )}

          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-[var(--color-text-primary)]">Tasks</h2>
            <Link href={`/dev/projects/${id}/tasks/new`} className="button">
              + Add Task
            </Link>
          </div>

          {!tasks.length ? (
            <p className="text-[var(--color-text-secondary)]">No tasks yet.</p>
          ) : (
            <div className="grid gap-4">
              {tasks.map(t => (
                <Card key={t.id} className="group relative">
                  <Link href={`/dev/tasks/${t.id}`} className="block">
                    <h3 className="text-xl font-semibold text-black dark:text-white">
                      {t.title}
                    </h3>
                    <p className="mt-1 text-black dark:text-white">
                      Status: {t.status}
                    </p>
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

          <div className="flex justify-between items-center mt-8">
            <h2 className="text-2xl font-semibold text-[var(--color-text-primary)]">Attachments</h2>
            <input type="file" onChange={handleUpload} disabled={uploading} />
          </div>
          {!files.length ? (
            <p className="text-[var(--color-text-secondary)]">No files uploaded.</p>
          ) : (
            <ul className="list-disc pl-5 space-y-1">
              {files.map(f => (
                <li key={f.id}>
                  {f.content_type && f.content_type.startsWith('image/') ? (
                    <img src={`${S3_BASE_URL}/${f.s3_key}`} alt="attachment" className="max-w-xs" />
                  ) : (
                    <a href={`${S3_BASE_URL}/${f.s3_key}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline" download>
                      {f.file_name || f.s3_key.split('/').pop()}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          )}
        </main>
      </div>
    </div>
  );
}
