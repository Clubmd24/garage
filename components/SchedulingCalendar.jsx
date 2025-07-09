import { useEffect, useState } from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop/index.js';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { parse, format, startOfWeek, getDay } from 'date-fns';
import enUS from 'date-fns/locale/en-US';
import { fetchJobsInRange, assignJob } from '../lib/jobs.js';

const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });
const DnDCalendar = withDragAndDrop(Calendar);
const COLORS = ['#2563eb', '#d97706', '#047857', '#b91c1c', '#6d28d9', '#be185d'];

export default function SchedulingCalendar() {
  const [events, setEvents] = useState([]);
  const [unassigned, setUnassigned] = useState([]);
  const [dragJob, setDragJob] = useState(null);

  const load = () => {
    const s = new Date();
    s.setDate(s.getDate() - 7);
    const e = new Date();
    e.setDate(e.getDate() + 30);
    fetchJobsInRange(s.toISOString().slice(0, 10), e.toISOString().slice(0, 10))
      .then(jobs => {
        setUnassigned(
          jobs.filter(j =>
            ['unassigned', 'awaiting parts', 'awaiting supplier information'].includes(j.status)
          )
        );
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
        );
      })
      .catch(() => {
        setUnassigned([]);
        setEvents([]);
      });
  };

  useEffect(load, []);

  const eventPropGetter = event => {
    const idx = event.engineer_id ? event.engineer_id % COLORS.length : 0;
    return { style: { backgroundColor: COLORS[idx] } };
  };

  const onDropFromOutside = ({ start, end }) => {
    if (!dragJob) return;
    assignJob(dragJob.id, {
      engineer_id: dragJob.engineer_id || 1,
      scheduled_start: start.toISOString(),
      scheduled_end: end.toISOString(),
    }).finally(load);
    setDragJob(null);
  };

  useEffect(() => {
    window.__scheduleDrop = onDropFromOutside;
  }, [dragJob]);

  const dragFromOutsideItem = dragJob ? { title: `Job #${dragJob.id}` } : null;

  return (
    <div className="flex space-x-4">
      <div className="w-64 bg-white text-black p-2 rounded shadow space-y-2" data-testid="side-panel">
        <h3 className="font-semibold">Unscheduled Jobs</h3>
        {unassigned.map(j => (
          <div
            key={j.id}
            draggable
            onDragStart={() => {
              setDragJob(j);
              window.__dragJob = j;
            }}
            className="p-1 bg-gray-200 rounded cursor-move"
            data-testid="unassigned-job"
          >
            Job #{j.id}
          </div>
        ))}
      </div>
      <div className="flex-1" data-testid="calendar">
        <DndProvider backend={HTML5Backend}>
          <DnDCalendar
            localizer={localizer}
            events={events}
            defaultView={Views.WEEK}
            views={[Views.DAY, Views.WEEK, Views.MONTH]}
            style={{ height: 600 }}
            eventPropGetter={eventPropGetter}
            onDropFromOutside={onDropFromOutside}
            dragFromOutsideItem={() => dragFromOutsideItem}
            selectable
          />
        </DndProvider>
      </div>
    </div>
  );
}
