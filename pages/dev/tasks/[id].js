import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Sidebar from '../../../components/Sidebar';
import Header from '../../../components/Header';
import Card from '../../../components/Card';
import Image from 'next/image';

const S3_BASE_URL = `https://${process.env.NEXT_PUBLIC_S3_BUCKET}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com`;

export default function TaskDetail() {
  const router = useRouter();
  const { id } = router.query;

  const [task, setTask] = useState(null);
  const [error, setError] = useState('');
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

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

  useEffect(() => {
    if (!id) return;
    fetch(`/api/dev/files?task_id=${id}`, { credentials: 'include' })
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
        body: JSON.stringify({ task_id: id, s3_key: key, file_name: file.name, content_type: file.type })
      });
      if (!r2.ok) throw new Error('Failed to save file record');
      const { id: fid } = await r2.json();
      setFiles([...files, { id: fid, task_id: id, s3_key: key, file_name: file.name, content_type: file.type }]);
    } catch (err) {
      setError(err.message);
    }
    setUploading(false);
    e.target.value = '';
  }

  if (error) {
    return <p className="p-8 text-red-500">Error: {error}</p>;
  }
  if (!task) {
    return <p className="p-8">Loading task…</p>;
  }

  return (
    <div className="min-h-screen flex flex-col sm:flex-row">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-y-auto">
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

          <div className="flex justify-between items-center">
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
                    <Image
                      src={`${S3_BASE_URL}/${f.s3_key}`}
                      alt="attachment"
                      width={0}
                      height={0}
                      sizes="100vw"
                      style={{ width: '100%', height: 'auto' }}
                      className="max-w-xs"
                    />
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
