import React, { useEffect, useState } from 'react'
import { getTodayHours, formatTime, type DayHours } from '../services/openingHours'

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export const OpeningHoursBanner: React.FC = () => {
  const [hours, setHours] = useState<DayHours | null>(null)

  useEffect(() => {
    getTodayHours().then(setHours).catch(() => setHours(null))
  }, [])

  if (!hours) return <div className="border-b border-cambridge/20 py-2" />

  const day = DAY_NAMES[new Date().getDay()]
  const isOpen = !hours.is_closed && hours.open_time && hours.close_time

  return (
    <div className="bg-cambridge/15 border-b border-cambridge/20 px-4 py-2 text-center">
      <p className="label-caps text-cambridge-light/80 tracking-wider text-xs">
        Opening Hours · {day} · {isOpen
          ? `${formatTime(hours.open_time!)} – ${formatTime(hours.close_time!)}`
          : 'Closed'}
        {hours.note && ` · ${hours.note}`}
      </p>
    </div>
  )
}
