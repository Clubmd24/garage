// pages/dev/projects/new.js
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { Header } from '../../../components/Header'
import { Sidebar } from '../../../components/Sidebar'
import { Card } from '../../../components/Card'

export default function NewProject() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', description: '' })
  const [user, setUser] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // load current user
    fetch('/api/auth/me', { credentials: 'include' })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(setUser)
      .catch(() => router.replace('/login'))
  }, [])

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    if (!form.name) {
      setError('Missing required fields')
      return
    }
    setLoading(true)
    const res = await fetch('/api/dev/projects', {
      method: 'POST',
      credentials: 'include',                  // ← include the auth cookie
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        description: form.description,
        created_by: user.id                    // ← pass the current user’s ID
      })
    })
    setLoading(false)

    if (res.ok) {
      router.push('/dev/projects')
    } else if (res.status === 401) {
      setError('Unauthorized – please log in again')
      router.replace('/login')
    } else {
      const { error } = await res.json().catch(() => ({}))
      setError(error || 'Something went wrong')
    }
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <main className="p-8">
          <h1 className="text-3xl font-bold mb-6">Create New Project</h1>
          <Card>
            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="block">
                <span className="text-sm">Name <span className="text-red-500">*</span></span>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="input w-full"
                  required
                />
              </label>
              <label className="block">
                <span className="text-sm">Description</span>
                <textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className="input w-full h-24"
                />
              </label>
              {error && <p className="text-red-500">{error}</p>}
              <button
                type="submit"
                className="button"
                disabled={loading}
              >
                {loading ? 'Creating…' : 'Create Project'}
              </button>
            </form>
          </Card>
        </main>
      </div>
    </div>
  )
}
