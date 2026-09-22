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
└── .env.local.example    # Plantilla de variables de entorno
```

## Fases de construcción

| Fase | Estado | Descripción |
|------|--------|-------------|
| 1 — Base | ✅ Completada | Next.js + estructura + diseño F&M |
| 2 — Supabase | ⏳ Pendiente | Migrations, tablas, RLS |
| 3 — Calendario | ⏳ Pendiente | Consulta real de actividades |
| 4 — Admin | ⏳ Pendiente | CRUD completo |
| 5 — UX | ⏳ Pendiente | Polish y animaciones |
| 6 — Seguridad | ⏳ Pendiente | Revisión RLS y audit |
| 7 — Pruebas | ⏳ Pendiente | Tests móvil/PC |
| 8 — Deploy | ⏳ Pendiente | Vercel |

## Decisiones técnicas

- **App Router**: Aprovecha Server Components para mejor rendimiento
- **RLS en Supabase**: La seguridad está en la base de datos, no solo en el frontend
- **Diseño**: Paleta verde/azul inspirada en logo F&M, sin hardcodear colores de tipo de operación
- **`active=false`**: Para desactivar hoteles/tipos sin romper registros históricos
- **date-fns + locale `es`**: Fechas en español para el mercado latinoamericano
- **Zod**: Validación idéntica en frontend y preparada para server actions

## Seguridad

- ✅ Solo `NEXT_PUBLIC_*` keys en el browser (anon key)
- ✅ `service_role` key NUNCA en el cliente
- ✅ RLS aplicado a todas las tablas (Fase 2)
- ✅ Validación Zod en todos los formularios
- ✅ Confirmación de eliminaciones (Fase 4)
- ✅ Audit logs de acciones administrativas (Fase 2)
