// app/(public)/calendar/page.tsx
// Redirect to root — the calendar is on the root page
import { redirect } from 'next/navigation'

export default function CalendarPage() {
  redirect('/')
}
