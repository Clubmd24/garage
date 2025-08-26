import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import OfficeLayout from '../../../components/OfficeLayout';

const EditEngineerPage = () => {
  const { id } = useRouter().query;
  const [form, setForm] = useState({
    username: '',
    email: '',
    first_name: '',
    surname: '',
    hourly_rate: '',
    street_address: '',
    post_code: '',
    ni_tie_number: '',
    contact_phone: '',
    date_of_birth: '',
    job_title: '',
    department: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (!id) return;
    fetch(`/api/engineers/${id}`)
      .then(r => r.json())
      .then(data => setForm(data))
      .catch(() => setError('Failed to load'))
      .finally(() => setLoading(false));
  }, [id]);

  const submit = async e => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/engineers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      router.push('/office/engineers');
    } catch {
      setError('Failed to update');
    }
  };

  const change = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  if (loading) return <OfficeLayout><p>Loading…</p></OfficeLayout>;

  return (
    <OfficeLayout>
      <h1 className="text-2xl font-semibold mb-4">Edit Engineer</h1>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={submit} className="space-y-6 max-w-4xl">
        {/* Basic Information */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                Username *
              </label>
              <input
                type="text"
                name="username"
                value={form.username || ''}
                onChange={change}
                className="w-full border border-gray-300 dark:border-gray-600 px-3 py-2 rounded text-black dark:text-white bg-white dark:bg-gray-700"
                required
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email || ''}
                onChange={change}
                className="w-full border border-gray-300 dark:border-gray-600 px-3 py-2 rounded text-black dark:text-white bg-white dark:bg-gray-700"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                New Password
              </label>
              <input
                type="password"
                name="password"
                onChange={change}
                className="w-full border border-gray-300 dark:border-gray-600 px-3 py-2 rounded text-black dark:text-white bg-white dark:bg-gray-700"
                placeholder="Leave blank to keep current password"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                First Name
              </label>
              <input
                type="text"
                name="first_name"
                value={form.first_name || ''}
                onChange={change}
                className="w-full border border-gray-300 dark:border-gray-600 px-3 py-2 rounded text-black dark:text-white bg-white dark:bg-gray-700"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                Surname
              </label>
              <input
                type="text"
                name="surname"
                value={form.surname || ''}
                onChange={change}
                className="w-full border border-gray-300 dark:border-gray-600 px-3 py-2 rounded text-black dark:text-white bg-white dark:bg-gray-700"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                Hourly Rate (€)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="hourly_rate"
                value={form.hourly_rate || ''}
                onChange={change}
                className="w-full border border-gray-300 dark:border-gray-600 px-3 py-2 rounded text-black dark:text-white bg-white dark:bg-gray-700"
                placeholder="0.00"
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Contact Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                Street Address
              </label>
              <input
                type="text"
                name="street_address"
                value={form.street_address || ''}
                onChange={change}
                className="w-full border border-gray-300 dark:border-gray-600 px-3 py-2 rounded text-black dark:text-white bg-white dark:bg-gray-700"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                Post Code
              </label>
              <input
                type="text"
                name="post_code"
                value={form.post_code || ''}
                onChange={change}
                className="w-full border border-gray-300 dark:border-gray-600 px-3 py-2 rounded text-black dark:text-white bg-white dark:bg-gray-700"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                NI / TIE Number
              </label>
              <input
                type="text"
                name="ni_tie_number"
                value={form.ni_tie_number || ''}
                onChange={change}
                className="w-full border border-gray-300 dark:border-gray-600 px-3 py-2 rounded text-black dark:text-white bg-white dark:bg-gray-700"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                Contact Phone
              </label>
              <input
                type="tel"
                name="contact_phone"
                value={form.contact_phone || ''}
                onChange={change}
                className="w-full border border-gray-300 dark:border-gray-600 px-3 py-2 rounded text-black dark:text-white bg-white dark:bg-gray-700"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                Date of Birth
              </label>
              <input
                type="date"
                name="date_of_birth"
                value={form.date_of_birth || ''}
                onChange={change}
                className="w-full border border-gray-300 dark:border-gray-600 px-3 py-2 rounded text-black dark:text-white bg-white dark:bg-gray-700"
              />
            </div>
          </div>
        </div>

        {/* Employment Information */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Employment Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                Job Title
              </label>
              <input
                type="text"
                name="job_title"
                value={form.job_title || ''}
                onChange={change}
                className="w-full border border-gray-300 dark:border-gray-600 px-3 py-2 rounded text-black dark:text-white bg-white dark:bg-gray-700"
                placeholder="e.g., Senior Mechanic"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                Department
              </label>
              <input
                type="text"
                name="department"
                value={form.department || ''}
                onChange={change}
                className="w-full border border-gray-300 dark:border-gray-700 px-3 py-2 rounded text-black dark:text-white bg-white dark:bg-gray-700"
                placeholder="e.g., Service Department"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button type="submit" className="button">Update Engineer</button>
          <button
            type="button"
            onClick={() => router.back()}
            className="button-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </OfficeLayout>
  );
};

export default EditEngineerPage;
