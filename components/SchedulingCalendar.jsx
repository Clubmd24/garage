// components/SchedulingCalendar.jsx

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Calendar as BigCalendar, Views, dateFnsLocalizer } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';

import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import { parse, format, startOfWeek, getDay } from 'date-fns';
import enUS from 'date-fns/locale/en-US';
import { fetchJobsInRange, assignJob } from '../lib/jobs';
import { fetchEngineers } from '../lib/engineers';
import { fetchJobStatuses } from '../lib/jobStatuses';

// Note: Global CSS imports for react-big-calendar belong in pages/_app.js
const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

// Custom display formats for the calendar
const formats = {
  dayHeaderFormat: 'EEEE MMM d',
  dayFormat: 'EEEE MMM d',
  weekdayFormat: 'EEEE',
  timeGutterFormat: 'HH:mm',
};
const DnDCalendar = withDragAndDrop(BigCalendar);

const COLORS = ['#2563eb', '#d97706', '#047857', '#b91c1c', '#6d28d9', '#be185d'];
const MIN_TIME = new Date(1970, 0, 1, 7, 0, 0);
const MAX_TIME = new Date(1970, 0, 1, 20, 0, 0);

export default function SchedulingCalendar() {
  const [events, setEvents] = useState([]);
  const [unassigned, setUnassigned] = useState([]);
  const [dragJob, setDragJob] = useState(null);
  const [engineers, setEngineers] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [pending, setPending] = useState(null);
  const [form, setForm] = useState({ engineer_id: '', status: '' });

  // Load jobs from API
  const load = () => {
    const start = new Date();
    start.setDate(start.getDate() - 7);
    const end = new Date();
    end.setDate(end.getDate() + 30);

    fetchJobsInRange(
      start.toISOString().slice(0, 10),
      end.toISOString().slice(0, 10)
    ).then(jobs => {
      setUnassigned(
        jobs.filter(j =>
          ['unassigned', 'awaiting parts', 'awaiting supplier information'].includes(
            j.status
          )
        )
      )
      setEvents(
        jobs
          .filter(j => j.scheduled_start && j.scheduled_end)
          .map(j => ({
            id: j.id,
            title: `Job #${j.id}`,
            start: new Date(j.scheduled_start),
            end: new Date(j.scheduled_end),
            engineer_id: j.assignments?.[0]?.user_id,
          }))
      )
    })
      .catch(() => {
        setUnassigned([]);
        setEvents([]);
      });
  }

  useEffect(load, []);
  useEffect(() => {
    fetchEngineers()
      .then(setEngineers)
      .catch(() => setEngineers([]));
    fetchJobStatuses()
      .then(setStatuses)
      .catch(() => setStatuses([]));
  }, []);

  // Style events by engineer
  const eventPropGetter = event => {
    const idx = event.engineer_id ? event.engineer_id % COLORS.length : 0;
    return { style: { backgroundColor: COLORS[idx] } };
  };

  // Handle drop from side panel
  const onDropFromOutside = ({ start, end }) => {
    if (!dragJob) return;
    setPending({ start, end, job: dragJob });
    setDragJob(null);
  };

  useEffect(() => {
    window.__scheduleDrop = onDropFromOutside;
  });

  const change = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const confirm = () => {
    if (!pending) return;
    assignJob(pending.job.id, {
      engineer_id: Number(form.engineer_id),
      status: form.status,
      scheduled_start: pending.start.toISOString(),
      scheduled_end: pending.end.toISOString(),
    })
      .finally(load)
      .finally(() => setPending(null));
  };

  const cancel = () => setPending(null);

  const dragFromOutsideItem = dragJob ? { title: `Job #${dragJob.id}` } : null;

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-blue-600 to-blue-800">
      {pending && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
          data-testid="assign-modal"
        >
          <div className="bg-white p-4 rounded space-y-2">
            <div>
              <label className="block mb-1">Engineer</label>
              <select
                name="engineer_id"
                value={form.engineer_id}
                onChange={change}
                className="input w-full"
                aria-label="Engineer"
              >
                <option value="">Select…</option>
                {engineers.map(e => (
                  <option key={e.id} value={e.id}>{e.username}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-1">Status</label>
              <select
                name="status"
                value={form.status}
                onChange={change}
                className="input w-full"
                aria-label="Status"
              >
                <option value="">Select…</option>
                {statuses.map(s => (
                  <option key={s.id ?? s.name} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>
            <div className="flex space-x-2 pt-2">
              <button onClick={confirm} className="button">Assign</button>
              <button onClick={cancel} className="button">Cancel</button>
            </div>
          </div>
        </div>
      )}
      <h1 className="text-2xl font-semibold text-white mb-4">Scheduling</h1>
      <div className="flex space-x-4">
        {/* Side Panel */}
        <div
          className="w-64 bg-white rounded-2xl shadow-lg p-4 space-y-2 text-black"
          data-testid="side-panel"
        >
          <h3 className="font-semibold">Unscheduled Jobs</h3>
          {unassigned.map(j => (
            <Link key={j.id} href={`/office/jobs/${j.id}`}> 
              <div
                draggable
                onDragStart={() => {
                  setDragJob(j)
                  window.__dragJob = j
                }}
                className="p-2 bg-gray-200 rounded cursor-move"
                data-testid="unassigned-job"
              >
                {`Job #${j.id} – ${j.licence_plate}`}
              </div>
            </Link>
          ))}
        </div>

        {/* Calendar */}
        <div className="flex-1 bg-white rounded-2xl shadow-lg p-4 text-black" data-testid="calendar">
          <DndProvider backend={HTML5Backend}>
            <DnDCalendar
              localizer={localizer}
              events={events}
              defaultView={Views.WORK_WEEK}
              views={[Views.WORK_WEEK, Views.DAY]}
              formats={formats}
              style={{ height: 650 }}
              min={MIN_TIME}
              max={MAX_TIME}
              scrollToTime={MIN_TIME}
              eventPropGetter={eventPropGetter}
              onDropFromOutside={onDropFromOutside}
              dragFromOutsideItem={() => dragFromOutsideItem}
              selectable
            />
          </DndProvider>
        </div>
      </div>
    </div>
  )
}
