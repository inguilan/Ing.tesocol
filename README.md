# TESOCOL Solar Flow

Aplicación web para gestionar proyectos solares, solicitudes de materiales, entregas, devoluciones y reportes de obra.

## Requisitos

- Node.js 20 o superior
- npm
- Un proyecto de Supabase

## Instalación

```powershell
npm install
```

Crea `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_publishable_key
SUPABASE_SERVICE_ROLE_KEY=tu_secret_key
```

`NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` se usan en el navegador. `SUPABASE_SERVICE_ROLE_KEY` es únicamente para procesos de servidor y actualmente no se importa desde componentes cliente.

No subas `.env.local` a Git. Ya está incluido en `.gitignore`.

## Configurar Supabase

1. Abre el proyecto en Supabase.
2. Entra en **SQL Editor**.
3. Ejecuta las migraciones en este orden:
   - `supabase/migrations/20260826131956_init_schema.sql`
   - `supabase/migrations/20260826140000_profiles.sql`
   - `supabase/migrations/20260826141000_app_state.sql`
   - `supabase/migrations/20260826142000_operational_sync.sql`
4. En **Authentication > Users**, crea un usuario con email y contraseña.
5. Convierte ese usuario en administrador ejecutando:

```sql
update public.profiles
set role = 'superadmin', active = true
where email = 'admin@tesocol.local';
```

Para el administrador usado en las pruebas actuales, utiliza `admin@tesocol.com`:

```sql
update public.profiles
set role = 'superadmin', active = true
where lower(email) = 'admin@tesocol.com';
```

El trigger de perfiles crea automáticamente una fila en `public.profiles` cuando se registra un usuario de Auth. Los usuarios nuevos reciben el rol `engineer` por defecto.

## Credenciales de prueba

Estas son las credenciales actuales del administrador de desarrollo:

```text
Correo:     admin@tesocol.com
Contraseña: Tesocol-2026
```

Estas credenciales solo funcionan si el usuario fue creado en **Supabase Authentication** con esa contraseña. Si Supabase indica que el usuario no existe, créalo manualmente desde el panel de Supabase. La contraseña local hardcodeada no crea usuarios en Supabase.

Por seguridad, cambia esta contraseña después de las pruebas.

## Ejecutar la aplicación

Desarrollo:

```powershell
npm run dev
```

Después abre:

```text
http://localhost:3000/login
```

Producción:

```powershell
npm run build
npm start
```

## Qué se guarda en Supabase

La aplicación usa Supabase Auth para:

- Inicio y cierre de sesión
- Persistencia de la sesión
- Perfiles y roles
- Estado activo o inactivo del usuario

La tabla `public.app_state` guarda el estado operativo compartido de la aplicación:

- Proyectos
- Solicitudes de materiales
- Entregas
- Devoluciones
- Reportes de obra
- Actividad reciente

Para esta primera integración, esos módulos se almacenan como un documento JSONB en la fila `id = 'default'`. Esto permite probar todos los flujos actuales sin modificar cada pantalla. La migración posterior a tablas relacionales independientes puede hacerse cuando el modelo de negocio esté cerrado.

El panel **Usuarios y accesos** ya utiliza una ruta server-only para crear usuarios en Supabase Auth, listar `profiles`, actualizar contraseñas y activar/desactivar cuentas. La service role key nunca se envía al navegador.

La migración `20260826142000_operational_sync.sql` agrega un reflejo relacional de esos datos en `projects`, `material_requests`, `deliveries` y `returns`, y crea las tablas `site_reports` y `activity_events`. La fila `app_state` sigue siendo la fuente de compatibilidad que permite a las pantallas actuales cargar el estado completo.

## Roles

- `superadmin`: acceso al panel de usuarios y a todos los módulos.
- `engineer`: acceso a los módulos de ingeniería y operación, excepto administración de usuarios.
- `technician`: acceso limitado a proyectos y operaciones asignadas.

## Solución de problemas

### Credenciales inválidas

Comprueba que:

- El usuario existe en **Authentication > Users**.
- El email coincide exactamente.
- La contraseña fue configurada en Supabase, no solo en el código local.
- La fila correspondiente existe en `public.profiles`.
- El rol del administrador es `superadmin`.

Puedes verificar el perfil con:

```sql
select id, name, email, role, active
from public.profiles
where email = 'admin@tesocol.com';
```

### Error al cargar datos

Comprueba que ejecutaste las migraciones `profiles` y `app_state` y que las políticas RLS están creadas. El usuario debe estar autenticado para leer o escribir el estado operativo.

### El servidor no arranca

Comprueba que el puerto 3000 esté libre y que `.env.local` esté en la raíz del proyecto. Reinicia el servidor después de cambiar variables de entorno.

## Seguridad

- Nunca expongas `SUPABASE_SERVICE_ROLE_KEY` en el navegador.
- Nunca uses la service role key con el prefijo `NEXT_PUBLIC_`.
- Rota cualquier clave que haya sido compartida públicamente.
- No almacenes contraseñas en `localStorage` ni en tablas propias.
- Cambia las credenciales de prueba antes de desplegar.
