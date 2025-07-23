import { useState } from 'react';
import { Modal } from './ui/Modal.jsx';

export default function BugReportModal({ onSubmit, onClose }) {
  const [section, setSection] = useState('');
  const [description, setDescription] = useState('');

  const submit = e => {
    e.preventDefault();
    onSubmit?.({ section, description });
  };

  return (
    <Modal onClose={onClose}>
      <form onSubmit={submit} className="space-y-4 w-80">
        <h2 className="text-lg font-semibold">Report a Bug</h2>
        <div>
          <label className="block mb-1">Section</label>
          <select
            value={section}
            onChange={e => setSection(e.target.value)}
            className="input w-full"
            required
          >
            <option value="">Select section</option>
            <option value="dashboard">Dashboard</option>
            <option value="office">Office</option>
            <option value="engineer">Engineer</option>
          </select>
        </div>
        <div>
          <label className="block mb-1">Description</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="input w-full h-32"
            required
          />
        </div>
        <div className="text-right">
          <button type="submit" className="button px-4">Submit</button>
        </div>
      </form>
    </Modal>
  );
}
