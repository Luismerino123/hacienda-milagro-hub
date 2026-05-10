# Hacienda El Milagrito — Guía de Setup

Esta guía te lleva paso a paso para correr el proyecto localmente con tu propia base de datos en Supabase, fuera de Lovable.

---

## 1. Requisitos previos

Necesitás tener instalado en tu Mac:

- **Node.js 20 o más reciente** — verificá con `node -v` en la terminal. Si no, descargalo de [nodejs.org](https://nodejs.org/) (LTS).
- **Bun** o **npm** (npm viene con Node). Vamos a usar npm para mantenerlo simple.
- **Git** — verificá con `git --version`. En Mac normalmente ya viene.

---

## 2. Crear tu propio proyecto en Supabase

El proyecto Supabase actual (`uqlpvpbguvjhgpdpnipe`) está manejado por Lovable Cloud y no lo controlás vos. Vamos a crear uno nuevo en TU cuenta.

1. Andá a [supabase.com](https://supabase.com/dashboard) y entrá con tu cuenta.
2. Si tenés varias organizaciones, escogé **JavierCaceres5's Org**.
3. Hacé clic en **"+ New project"** (botón verde).
4. Llená:
   - **Name**: `hacienda-el-milagrito`
   - **Database Password**: generá una segura con el botón. **GUARDALA** en un lugar seguro.
   - **Region**: la más cercana (US East o US West).
5. Hacé clic en **"Create new project"** y esperá ~2 minutos a que se aprovisione.

---

## 3. Aplicar las migraciones

Una vez listo el proyecto:

1. En el dashboard de Supabase, andá a **SQL Editor** (en el sidebar izquierdo).
2. Hacé clic en **"+ New query"**.
3. Vas a correr **5 archivos** en orden, uno por uno. Cada uno: copiá todo el contenido, pegalo, hacé clic en **Run**, esperá el "Success".

Los archivos están en `supabase/migrations/`:

1. `20260509215736_907b382e-671b-4e8d-a2b4-497b44c2bd90.sql` — tabla `animals`
2. `20260509215802_c3423609-96da-4de6-ab5a-3130b78215af.sql` — ajustes
3. `20260509220437_a7adc154-7b82-4cb2-814d-5a8460aafd87.sql` — tabla `milk_production`
4. `20260509230000_seed_animales_y_leche.sql` — 12 animales + leche
5. `20260509231500_modulo_salud.sql` — tabla `health_events` + seed
6. `20260509232000_modulo_reproduccion.sql` — tabla `reproduction_events` + seed
7. `20260509232500_modulo_finanzas.sql` — clientes/ventas/egresos + seed

> **Tip**: si una migración falla con "already exists", es porque ya corriste alguna parte. Saltala y seguí con la siguiente.

---

## 4. Crear el usuario admin

1. En Supabase, andá a **Authentication → Users**.
2. Hacé clic en **"Add user → Create new user"**.
3. Email: `admin@elmilagrito.com`
4. Password: `Milagrito2026!` (o la que vos quieras)
5. Marcá "Auto Confirm User" si aparece.
6. Hacé clic en **Create user**.

---

## 5. Obtener las credenciales para el .env

1. En Supabase, andá a **Project Settings → API** (ícono de engranaje en el sidebar).
2. Copiá:
   - **Project URL** (algo como `https://xxxxx.supabase.co`)
   - **anon / public key** (un JWT largo que empieza con `eyJ...`)

---

## 6. Actualizar el `.env`

En la carpeta del proyecto, abrí el archivo `.env` y reemplazá los valores:

```env
SUPABASE_URL="<tu-project-url>"
SUPABASE_PUBLISHABLE_KEY="<tu-anon-key>"
VITE_SUPABASE_PROJECT_ID="<id-del-proyecto>"
VITE_SUPABASE_PUBLISHABLE_KEY="<tu-anon-key>"
VITE_SUPABASE_URL="<tu-project-url>"
```

El `id-del-proyecto` es la parte después de `https://` y antes de `.supabase.co` en tu URL.

---

## 7. Instalar dependencias y arrancar

En la terminal, en la carpeta del proyecto:

```bash
cd ~/Desktop/hacienda-milagro-hub
npm install
npm run dev
```

Vas a ver algo como:

```
  VITE v7.x.x  ready in xxx ms
  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

Abrí `http://localhost:5173` en tu navegador.

---

## 8. Probar la app

1. **Sitio público**: `http://localhost:5173/` — landing, catálogo, contacto.
2. **Login**: `http://localhost:5173/login` — usá `admin@elmilagrito.com` y la contraseña que pusiste.
3. **Panel admin**: una vez logueado, te lleva a `/admin/`.

Podés probar:
- `/admin/ganado` — lista de las 12 vacas semilla
- `/admin/leche` — registro de ordeño con gráfico
- `/admin/salud` — vacunas, tratamientos, alertas
- `/admin/reproduccion` — preñeces y partos
- `/admin/finanzas` — ventas, egresos, gráfico mensual
- `/admin/alertas` — centro unificado de notificaciones

---

## 9. Hacer cambios y desplegar (opcional)

Para que tu papá pueda usar la app desde cualquier dispositivo, podés desplegarla gratis:

### Opción A: Vercel (recomendado, 5 minutos)

1. Andá a [vercel.com](https://vercel.com) y creá cuenta con GitHub.
2. **New Project → Import Git Repository**.
3. Seleccioná `hacienda-milagro-hub`.
4. En **Environment Variables**, copiá las mismas que tenés en `.env`.
5. **Deploy**.

Te da una URL pública tipo `hacienda-milagrito.vercel.app`.

### Opción B: Netlify

Similar a Vercel, también gratuita.

---

## 10. Estructura del proyecto (referencia)

```
hacienda-milagro-hub/
├── src/
│   ├── routes/                    # Páginas (TanStack Router)
│   │   ├── index.tsx              # Landing pública
│   │   ├── catalogo.tsx           # Catálogo público
│   │   ├── login.tsx              # Login
│   │   ├── admin.tsx              # Layout admin
│   │   ├── admin.index.tsx        # Dashboard
│   │   ├── admin.ganado.tsx       # Lista de animales
│   │   ├── admin.ganado.$id.tsx   # Detalle de animal
│   │   ├── admin.leche.tsx        # Producción de leche
│   │   ├── admin.salud.tsx        # Salud y veterinaria
│   │   ├── admin.reproduccion.tsx # Reproducción
│   │   ├── admin.finanzas.tsx     # Ventas y egresos
│   │   └── admin.alertas.tsx      # Centro de alertas
│   ├── lib/                       # Capa de datos (Supabase)
│   │   ├── animals.ts
│   │   ├── milk.ts
│   │   ├── health.ts
│   │   ├── reproduction.ts
│   │   └── finance.ts
│   ├── components/
│   │   ├── ui/                    # shadcn components
│   │   ├── admin/                 # Sidebar, formulario animal
│   │   └── site/                  # Header/Footer/Logo público
│   └── integrations/supabase/     # Cliente Supabase
├── supabase/migrations/           # Esquema SQL
└── package.json
```

---

## Problemas comunes

**"Cannot read properties of undefined" en alguna ruta admin**: probablemente no corriste todas las migraciones. Verificá que las 7 estén aplicadas en Supabase.

**Login dice "Invalid login credentials"**: el usuario admin no existe en Supabase. Volvé al paso 4.

**Las vacas no aparecen**: las migraciones de seed no corrieron. Re-corré los archivos `..._seed_...` y `..._modulo_...`.

**Error de tipos de TypeScript al editar**: corré `npm run dev` que valida en tiempo real, o `npx tsc --noEmit` para ver todos los errores.

---

## Próximos pasos sugeridos

Cuando estés listo:

1. **Quitar credenciales hardcodeadas del login** (`src/routes/login.tsx` líneas 19-20).
2. **Conectar tu dominio propio** (ej. `elmilagrito.com`) a Vercel.
3. **Habilitar email de confirmación** en Supabase Auth para usuarios nuevos.
4. **Agregar generación de QR real** por animal (placeholder hoy).
5. **Implementar exportación de reportes a PDF/Excel**.

¡Que viva la hacienda!
