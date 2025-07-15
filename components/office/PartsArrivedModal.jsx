import React from 'react';
import { Modal } from '../ui/Modal.jsx';

export default function PartsArrivedModal({ onScheduleNow, onScheduleLater }) {
  return (
    <Modal>
      <p className="mb-4">Parts have arrived for this job.</p>
      <div className="flex justify-end gap-2">
        <button onClick={onScheduleNow} className="button px-4">Schedule now</button>
        <button onClick={onScheduleLater} className="button-secondary px-4">Schedule later</button>
      </div>
    </Modal>
  );
}
