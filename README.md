# F&M Fumigación — Sistema de Gestión Operativa

Calendario operativo digital para F&M Fumigación. Permite al administrador registrar actividades y al personal consultar trabajos programados en cada hotel.

## Stack

| Tecnología | Versión | Uso |
|---|---|---|
| Next.js | 14+ | Framework (App Router) |
| TypeScript | 5+ | Tipado estático |
| Tailwind CSS | 4 | Estilos |
| Supabase | latest | DB + Auth + RLS |
| date-fns | latest | Manejo de fechas |
| Zod | latest | Validación de datos |
| lucide-react | latest | Íconos |

## Comandos

```bash
# Instalar dependencias
npm install

# Desarrollo local
npm run dev

# Verificar tipos TypeScript
npm run typecheck  # o: npx tsc --noEmit

# Linting
npm run lint

# Build de producción
npm run build
```

## Configuración

1. Copia `.env.local.example` como `.env.local`
2. Completa `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Ejecuta `npm run dev`

## Estructura de carpetas

```
app.empleados/
├── app/
│   ├── (public)/         # Rutas públicas
│   ├── (admin)/          # Panel administrador (protegido)
│   ├── (auth)/           # Login
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Página principal (calendario)
├── components/
│   ├── ui/               # Button, Badge, Modal, Skeleton, EmptyState
│   ├── calendar/         # CalendarGrid, ActivityCard, DayPanel, Filters, Legend
│   └── layout/           # Header, Logo
├── lib/
│   ├── supabase/         # client.ts, server.ts, middleware.ts
│   ├── validations/      # Schemas Zod
│   └── utils/            # Helpers, tokens de color/status
├── types/                # Tipos TypeScript globales
├── middleware.ts          # Protección de rutas /admin
├── supabase/
│   └── schema.sql        # Esquema completo DDL + RLS + Triggers + Datos semilla
└── .env.local.example    # Plantilla de variables de entorno
```

## Configuración y Puesta en Marcha con Supabase

1. Crea tu proyecto en [Supabase](https://supabase.com).
2. Ve a **SQL Editor** en tu panel de Supabase y ejecuta el contenido de [`supabase/schema.sql`](supabase/schema.sql).
3. Copia el archivo `.env.local.example` a `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```
4. Completa `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` en `.env.local`.
5. En **Authentication > Users** de Supabase, crea tu usuario administrador y asígnale el rol `'admin'` en `profiles` (o vía user metadata `{"role": "admin"}`).

## Estado del Proyecto

| Módulo / Fase | Estado | Descripción |
|---|---|---|
| Auditoría & Core | ✅ Completado | Tipos TypeScript, Zod validations, Next.js 16 (Turbopack) |
| Base de Datos Supabase | ✅ Completado | Schema DDL, RLS policies, trigger auth, índices y seeds |
| Calendario Público | ✅ Completado | Conexión Supabase, filtros, panel diario, fallback demo |
| Panel de Administración | ✅ Completado | Dashboard con métricas, CRUD de Actividades, Hoteles y Operaciones |
| Autenticación & Seguridad | ✅ Completado | Login con Supabase Auth, middleware de protección de rutas `/admin` |
| Build de Producción | ✅ Verificado | `npm run build` compila al 100% sin errores de tipos |
