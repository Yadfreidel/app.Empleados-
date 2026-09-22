-- ============================================================
-- Asignar rol de Administrador a un usuario en Calario
-- ============================================================
-- 1. Asegúrate de haber creado el usuario en:
--    Supabase Dashboard > Authentication > Users > Add user
--
-- 2. Reemplaza 'tu_correo@ejemplo.com' por el correo con el que te registraste.
-- 3. Ejecuta esta consulta en SQL Editor.
-- ============================================================

UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'tu_correo@ejemplo.com';

-- Para verificar que quedó con rol admin:
SELECT id, email, role, active, created_at 
FROM public.profiles 
WHERE email = 'tu_correo@ejemplo.com';
