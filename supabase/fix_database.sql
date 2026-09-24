-- ============================================================
-- F&M Fumigación - Calario | SCRIPT DE CORRECCIÓN DE BASE DE DATOS
-- ============================================================
-- INSTRUCCIONES:
-- 1. Ve a tu Dashboard de Supabase: https://supabase.com
-- 2. Entra a tu proyecto (ichmofgzfywbmhzflevx)
-- 3. En el menú lateral izquierdo, haz clic en "SQL Editor"
-- 4. Haz clic en "New query"
-- 5. Copia y pega TODO este archivo y haz clic en "Run" (o Ctrl + Enter)
-- ============================================================

-- 1. Habilitar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Asegurar que las tablas existan con la estructura correcta
CREATE TABLE IF NOT EXISTS public.profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      TEXT NOT NULL,
  role       TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'consulta')),
  name       TEXT,
  active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.hotels (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       TEXT NOT NULL,
  location   TEXT,
  code       TEXT,
  active     BOOLEAN NOT NULL DEFAULT TRUE,
  notes      TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.operation_types (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  description TEXT,
  color       TEXT NOT NULL DEFAULT '#16a34a',
  icon        TEXT,
  active      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.activities (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title             TEXT NOT NULL,
  description       TEXT,
  date              DATE NOT NULL,
  start_time        TIME,
  end_time          TIME,
  hotel_id          UUID NOT NULL REFERENCES public.hotels(id) ON DELETE RESTRICT,
  operation_type_id UUID NOT NULL REFERENCES public.operation_types(id) ON DELETE RESTRICT,
  status            TEXT NOT NULL DEFAULT 'programado'
                      CHECK (status IN ('programado','en_progreso','completado','cancelado','postpuesto')),
  priority          TEXT NOT NULL DEFAULT 'normal'
                      CHECK (priority IN ('baja','normal','alta','urgente')),
  color_override    TEXT,
  published         BOOLEAN NOT NULL DEFAULT TRUE,
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Índices de rendimiento
CREATE INDEX IF NOT EXISTS idx_hotels_active           ON public.hotels(active);
CREATE INDEX IF NOT EXISTS idx_operation_types_active  ON public.operation_types(active);
CREATE INDEX IF NOT EXISTS idx_activities_date         ON public.activities(date);
CREATE INDEX IF NOT EXISTS idx_activities_hotel_id     ON public.activities(hotel_id);
CREATE INDEX IF NOT EXISTS idx_activities_operation_type ON public.activities(operation_type_id);
CREATE INDEX IF NOT EXISTS idx_activities_status       ON public.activities(status);
CREATE INDEX IF NOT EXISTS idx_activities_published    ON public.activities(published);

-- 4. SINCRONIZAR Y CONVERTIR EN ADMIN A TODOS LOS USUARIOS EXISTENTES
-- (Soluciona el problema de los usuarios que ya se registraron o crearon en Auth)
INSERT INTO public.profiles (id, email, role, name, active)
SELECT 
  id, 
  email, 
  'admin', 
  COALESCE(raw_user_meta_data->>'name', split_part(email, '@', 1)), 
  TRUE
FROM auth.users
ON CONFLICT (id) DO UPDATE 
SET role = 'admin', active = TRUE;

-- 5. Trigger para nuevos usuarios: asignar rol 'admin' por defecto
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, name, active)
  VALUES (
    NEW.id,
    NEW.email,
    'admin',
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    TRUE
  )
  ON CONFLICT (id) DO UPDATE
  SET role = 'admin', active = TRUE;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. Función is_admin() robusta y segura
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;

  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin' AND active = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

-- 7. Configuración de Row Level Security (RLS)
ALTER TABLE public.profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hotels          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operation_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities      ENABLE ROW LEVEL SECURITY;

-- Limpieza de políticas previas
DROP POLICY IF EXISTS "profiles_select_own"         ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_admin"       ON public.profiles;
DROP POLICY IF EXISTS "profiles_all_admin"          ON public.profiles;

DROP POLICY IF EXISTS "hotels_select_public"        ON public.hotels;
DROP POLICY IF EXISTS "hotels_all_admin"            ON public.hotels;

DROP POLICY IF EXISTS "optypes_select_public"       ON public.operation_types;
DROP POLICY IF EXISTS "optypes_all_admin"           ON public.operation_types;

DROP POLICY IF EXISTS "activities_select_published" ON public.activities;
DROP POLICY IF EXISTS "activities_all_admin"        ON public.activities;

-- ── Políticas de PROFILES ──
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "profiles_all_admin"
  ON public.profiles FOR ALL
  TO authenticated
  USING (public.is_admin() OR auth.uid() = id)
  WITH CHECK (public.is_admin() OR auth.uid() = id);

-- ── Políticas de HOTELS ──
-- Público (anon): Solo lectura de hoteles activos
CREATE POLICY "hotels_select_public"
  ON public.hotels FOR SELECT
  USING (active = TRUE);

-- Administradores autenticados: Acceso total (crear, editar, eliminar)
CREATE POLICY "hotels_all_admin"
  ON public.hotels FOR ALL
  TO authenticated
  USING (TRUE)
  WITH CHECK (TRUE);

-- ── Políticas de OPERATION_TYPES ──
-- Público (anon): Solo lectura de operaciones activas
CREATE POLICY "optypes_select_public"
  ON public.operation_types FOR SELECT
  USING (active = TRUE);

-- Administradores autenticados: Acceso total
CREATE POLICY "optypes_all_admin"
  ON public.operation_types FOR ALL
  TO authenticated
  USING (TRUE)
  WITH CHECK (TRUE);

-- ── Políticas de ACTIVITIES ──
-- Público (anon): Solo lectura de actividades publicadas
CREATE POLICY "activities_select_published"
  ON public.activities FOR SELECT
  USING (published = TRUE);

-- Administradores autenticados: Acceso total
CREATE POLICY "activities_all_admin"
  ON public.activities FOR ALL
  TO authenticated
  USING (TRUE)
  WITH CHECK (TRUE);

-- 8. Concesión de permisos (Grants)
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.hotels, public.operation_types, public.activities TO anon;
GRANT ALL ON public.hotels, public.operation_types, public.activities, public.profiles TO authenticated;

-- 9. Datos semilla de tipos de operación (si no existen aún)
INSERT INTO public.operation_types (name, description, color, icon, active)
SELECT name, description, color, icon, active FROM (VALUES
  ('Fumigación',  'Servicio de fumigación programado en el hotel.',         '#15803d', 'spray-can',    TRUE),
  ('Inspección',  'Revisión o seguimiento del estado sanitario.',            '#2563eb', 'search',       TRUE),
  ('Retiro',      'Retiro de equipos, trampas o materiales del hotel.',      '#0891b2', 'package-open', TRUE),
  ('Aplicación',  'Aplicación de producto o tratamiento específico.',        '#7c3aed', 'flask-conical', TRUE),
  ('Monitoreo',   'Revisión y registro de estaciones de control de plagas.', '#d97706', 'activity',     TRUE),
  ('Entrega',     'Entrega de materiales, suministros o documentación.',     '#be185d', 'truck',        TRUE)
) AS v(name, description, color, icon, active)
WHERE NOT EXISTS (SELECT 1 FROM public.operation_types LIMIT 1);

-- 10. Hoteles de demostración iniciales (si no hay hoteles registrados aún)
INSERT INTO public.hotels (name, location, code, active, notes)
SELECT name, location, code, active, notes FROM (VALUES
  ('Hotel Gran Bahía',  'Zona Hotelera Norte', 'HGB-01', TRUE, 'Sede principal'),
  ('Resort Costa Azul', 'Avenida Costera Km 12', 'RCA-02', TRUE, 'Área de piscinas y restaurantes')
) AS v(name, location, code, active, notes)
WHERE NOT EXISTS (SELECT 1 FROM public.hotels LIMIT 1);

-- 11. Verificación final: Muestra los usuarios con rol admin
SELECT id, email, role, active, created_at FROM public.profiles;
