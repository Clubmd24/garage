```jsx
// components/SchedulingCalendar.jsx

import React, { useEffect, useState } from 'react'
import { Calendar as BigCalendar, Views, dateFnsLocalizer } from 'react-big-calendar'
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop'

import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

import { parse, format, startOfWeek, getDay } from 'date-fns'
import enUS from 'date-fns/locale/en-US'
import { fetchJobsInRange, assignJob } from '../lib/jobs'

// Note: Global CSS imports for react-big-calendar belong in pages/_app.js
const locales = { 'en-US': enUS }
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales })
const DnDCalendar = withDragAndDrop(BigCalendar)

const COLORS = ['#2563eb', '#d97706', '#047857', '#b91c1c', '#6d28d9', '#be185d']
const MIN_TIME = new Date(1970, 0, 1, 7, 0, 0)
const MAX_TIME = new Date(1970, 0, 1, 20, 0, 0)

export default function SchedulingCalendar() {
  const [events, setEvents] = useState([])
  const [unassigned, setUnassigned] = useState([])
  const [dragJob, setDragJob] = useState(null)

  // Load jobs from API
  const load = () => {
    const start = new Date()
    start.setDate(start.getDate() - 7)
    const end = new Date()
    end.setDate(end.getDate() + 30)

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
    }).catch(() => {
      setUnassigned([])
      setEvents([])
    })
  }

  useEffect(load, [])

  // Style events by engineer
  const eventPropGetter = event => {
    const idx = event.engineer_id ? event.engineer_id % COLORS.length : 0
    return { style: { backgroundColor: COLORS[idx] } }
  }

  // Handle drop from side panel
  const onDropFromOutside = ({ start, end }) => {
    if (!dragJob) return
    assignJob(dragJob.id, {
      engineer_id: dragJob.engineer_id || 1,
      scheduled_start: start.toISOString(),
      scheduled_end: end.toISOString(),
    }).finally(load)
    setDragJob(null)
  }

  const dragFromOutsideItem = dragJob ? { title: `Job #${dragJob.id}` } : null

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-blue-600 to-blue-800">
      <h1 className="text-2xl font-semibold text-white mb-4">Scheduling</h1>
      <div className="flex space-x-4">
        {/* Side Panel */}
        <div
          className="w-64 bg-white rounded-2xl shadow-lg p-4 space-y-2"
          data-testid="side-panel"
        >
          <h3 className="font-semibold">Unscheduled Jobs</h3>
          {unassigned.map(j => (
            <div
              key={j.id}
              draggable
              onDragStart={() => {
                setDragJob(j)
                window.__dragJob = j
              }}
              className="p-2 bg-gray-200 rounded cursor-move"
              data-testid="unassigned-job"
            >
              Job #{j.id}
            </div>
          ))}
        </div>

        {/* Calendar */}
        <div className="flex-1 bg-white rounded-2xl shadow-lg p-4" data-testid="calendar">
          <DndProvider backend={HTML5Backend}>
            <DnDCalendar
              localizer={localizer}
              events={events}
              defaultView={Views.WORK_WEEK}
              views={[Views.WORK_WEEK, Views.DAY]}
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
```
