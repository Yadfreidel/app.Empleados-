// app/(public)/actividad/page.tsx
// Redirect to root — activity details shown in day panel on calendar
import { redirect } from 'next/navigation'

export default function ActividadPage() {
  redirect('/')
}
