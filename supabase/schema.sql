-- ============================================================
-- F&M Fumigacion - Calario -- Schema Supabase
-- Ejecutar en: Supabase Dashboard > SQL Editor > New query
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLA: profiles
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      TEXT NOT NULL,
  role       TEXT NOT NULL DEFAULT 'consulta' CHECK (role IN ('admin', 'consulta')),
  name       TEXT,
  active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'consulta'),
    NEW.raw_user_meta_data->>'name'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- TABLA: hotels
-- ============================================================
CREATE TABLE IF NOT EXISTS public.hotels (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       TEXT NOT NULL,
  location   TEXT,
  code       TEXT,
  active     BOOLEAN NOT NULL DEFAULT TRUE,
  notes      TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hotels_active ON public.hotels(active);

-- ============================================================
-- TABLA: operation_types
-- ============================================================
CREATE TABLE IF NOT EXISTS public.operation_types (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  description TEXT,
  color       TEXT NOT NULL DEFAULT '#16a34a',
  icon        TEXT,
  active      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_operation_types_active ON public.operation_types(active);

-- ============================================================
-- TABLA: activities
-- ============================================================
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

CREATE INDEX IF NOT EXISTS idx_activities_date           ON public.activities(date);
CREATE INDEX IF NOT EXISTS idx_activities_hotel_id       ON public.activities(hotel_id);
CREATE INDEX IF NOT EXISTS idx_activities_operation_type ON public.activities(operation_type_id);
CREATE INDEX IF NOT EXISTS idx_activities_status         ON public.activities(status);
CREATE INDEX IF NOT EXISTS idx_activities_published      ON public.activities(published);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_activities_updated_at ON public.activities;
CREATE TRIGGER trg_activities_updated_at
  BEFORE UPDATE ON public.activities
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- TABLA: audit_logs
-- ============================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action     TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id  UUID,
  metadata   JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id    ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON public.audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hotels          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operation_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs      ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin' AND active = TRUE
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- profiles
DROP POLICY IF EXISTS "profiles_select_own"   ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_all_admin"    ON public.profiles;

CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "profiles_select_admin"
  ON public.profiles FOR SELECT USING (public.is_admin());
CREATE POLICY "profiles_all_admin"
  ON public.profiles FOR ALL USING (public.is_admin());

-- hotels
DROP POLICY IF EXISTS "hotels_select_public" ON public.hotels;
DROP POLICY IF EXISTS "hotels_all_admin"     ON public.hotels;

CREATE POLICY "hotels_select_public"
  ON public.hotels FOR SELECT USING (active = TRUE);
CREATE POLICY "hotels_all_admin"
  ON public.hotels FOR ALL USING (public.is_admin());

-- operation_types
DROP POLICY IF EXISTS "optypes_select_public" ON public.operation_types;
DROP POLICY IF EXISTS "optypes_all_admin"     ON public.operation_types;

CREATE POLICY "optypes_select_public"
  ON public.operation_types FOR SELECT USING (active = TRUE);
CREATE POLICY "optypes_all_admin"
  ON public.operation_types FOR ALL USING (public.is_admin());

-- activities
DROP POLICY IF EXISTS "activities_select_published" ON public.activities;
DROP POLICY IF EXISTS "activities_all_admin"        ON public.activities;

CREATE POLICY "activities_select_published"
  ON public.activities FOR SELECT USING (published = TRUE);
CREATE POLICY "activities_all_admin"
  ON public.activities FOR ALL USING (public.is_admin());

-- audit_logs
DROP POLICY IF EXISTS "audit_select_admin" ON public.audit_logs;
DROP POLICY IF EXISTS "audit_insert_admin" ON public.audit_logs;

CREATE POLICY "audit_select_admin"
  ON public.audit_logs FOR SELECT USING (public.is_admin());
CREATE POLICY "audit_insert_admin"
  ON public.audit_logs FOR INSERT WITH CHECK (public.is_admin());

-- ============================================================
-- DATOS SEMILLA
-- ============================================================
INSERT INTO public.operation_types (name, description, color, icon, active)
SELECT name, description, color, icon, active FROM (VALUES
  ('Fumigacion',  'Servicio de fumigacion programado en el hotel.',         '#15803d', 'spray-can',    TRUE),
  ('Inspeccion',  'Revision o seguimiento del estado sanitario.',            '#2563eb', 'search',       TRUE),
  ('Retiro',      'Retiro de equipos, trampas o materiales del hotel.',      '#0891b2', 'package-open', TRUE),
  ('Aplicacion',  'Aplicacion de producto o tratamiento especifico.',        '#7c3aed', 'flask-conical', TRUE),
  ('Monitoreo',   'Revision y registro de estaciones de control de plagas.', '#d97706', 'activity',     TRUE),
  ('Entrega',     'Entrega de materiales, suministros o documentacion.',     '#be185d', 'truck',        TRUE)
) AS v(name, description, color, icon, active)
WHERE NOT EXISTS (SELECT 1 FROM public.operation_types LIMIT 1);

-- ============================================================
-- GRANTS
-- ============================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.hotels, public.operation_types, public.activities TO anon;
GRANT ALL ON public.hotels, public.operation_types, public.activities,
            public.profiles, public.audit_logs TO authenticated;
