-- ============================================================
-- Asignar rol de Administrador a un usuario en Calario
-- ============================================================
-- OPCIÓN A (Recomendada): Asignar rol de Administrador a TODOS los usuarios existentes:
INSERT INTO public.profiles (id, email, role, active)
SELECT id, email, 'admin', TRUE
FROM auth.users
ON CONFLICT (id) DO UPDATE
SET role = 'admin', active = TRUE;

-- OPCIÓN B: Asignar rol de Administrador a un correo específico:
-- (Reemplaza 'tu_correo@ejemplo.com' por tu correo real)
/*
INSERT INTO public.profiles (id, email, role, active)
SELECT id, email, 'admin', TRUE
FROM auth.users
WHERE email = 'tu_correo@ejemplo.com'
ON CONFLICT (id) DO UPDATE
SET role = 'admin', active = TRUE;
*/

-- Para verificar los usuarios y su rol:
SELECT id, email, role, active, created_at 
FROM public.profiles;
