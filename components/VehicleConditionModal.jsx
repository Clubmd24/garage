import { useState } from 'react';
import { Modal } from './ui/Modal.jsx';

export default function VehicleConditionModal({ jobId, onComplete }) {
  const [description, setDescription] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [none, setNone] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    if (!none && (!description || !photoUrl)) return;
    try {
      const res = await fetch(`/api/jobs/${jobId}/condition`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          none ? { none: true } : { description, photo_url: photoUrl }
        ),
      });
      if (!res.ok) throw new Error('Failed');
      onComplete?.();
    } catch (err) {
      setError('Submission failed');
    }
  };

  return (
    <Modal>
      <form onSubmit={submit} className="space-y-4 w-80">
        <h2 className="text-lg font-semibold">Vehicle Condition</h2>
        {error && <p className="text-red-500">{error}</p>}
        {!none && (
          <>
            <div>
              <label className="block mb-1">Description of Defect</label>
              <textarea
                className="input w-full"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block mb-1">Photo URL</label>
              <input
                type="url"
                className="input w-full"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                required
              />
            </div>
          </>
        )}
        <label className="block">
          <input
            type="checkbox"
            checked={none}
            onChange={(e) => setNone(e.target.checked)}
          />{' '}
          No Defects
        </label>
        <div className="text-right">
          <button type="submit" className="button px-4">
            Submit
          </button>
        </div>
      </form>
    </Modal>
  );
}
