# TDC Control

Una app para controlar tarjetas de crédito, gastos, compras a meses sin intereses, y un plan para salir de deudas. Construida en React, con Supabase como base de datos: tus datos se guardan en la nube, protegidos por autenticación real, y se pueden ver desde cualquier dispositivo iniciando sesión con tu correo.

## Configuración inicial (una sola vez)

Esta app ya viene conectada a un proyecto específico de Supabase (las credenciales están en `src/utils/supabaseStore.js`). Antes de usarla por primera vez:

1. Entra a [supabase.com](https://supabase.com) y abre tu proyecto.
2. Ve a **SQL Editor** → **New query**.
3. Pega todo el contenido del archivo `supabase_schema.sql` (está en esta misma carpeta) y dale **Run**.
4. Deberías ver "Success. No rows returned" — esto crea las tablas `tarjetas`, `gastos` y `msi`, y activa la seguridad para que solo tú veas tus propios datos.
5. Ve a **Authentication → Providers** y confirma que "Email" esté activado (viene activado por defecto).
6. Opcional pero recomendado: en **Authentication → Settings**, puedes desactivar "Confirm email" si no quieres tener que confirmar tu correo cada vez que crees una cuenta nueva durante pruebas.

Listo. Ya puedes abrir la app, crear una cuenta con tu correo, y empezar a usarla.

## Cómo correrla en tu computadora

```bash
cd tdc-control
python3 -m http.server 8000
```

Abre `http://localhost:8000`.

## Cómo subirla a GitHub Pages

1. Sube todos los archivos de esta carpeta a un repositorio de GitHub (estructura completa, incluyendo `src/`).
2. **Settings → Pages** → Source: rama `main`, carpeta `/ (root)`.
3. Espera 1-2 minutos y tendrás tu URL pública.

## Dónde viven tus datos ahora

A diferencia de la primera versión (que usaba `localStorage`), tus tarjetas, gastos y compras a MSI viven en una base de datos real de Supabase (PostgreSQL), protegidas por tu cuenta. Puedes:

- Verlas desde cualquier dispositivo, iniciando sesión con el mismo correo.
- Cada usuario solo ve sus propios datos (esto lo garantiza "Row Level Security", configurado en `supabase_schema.sql`).

Lo que **sigue** viviendo solo en este navegador (en `localStorage`, no en Supabase): tu preferencia de método de plan (bola de nieve/avalancha) y el pago extra mensual configurado en el Simulador. Son preferencias de visualización, no datos financieros sensibles, así que no necesitan sincronizarse.

## Estructura del proyecto

```
index.html                  ← punto de entrada, carga todo en orden
supabase_schema.sql          ← ejecutar UNA VEZ en el SQL Editor de Supabase
build.cjs                    ← regenera los .compiled.js a partir de los .jsx
src/
  styles/main.css            ← sistema de diseño
  utils/
    finance.js                ← lógica de cálculo financiero
    supabaseStore.js           ← conexión a Supabase, autenticación, CRUD
  components/
    UI.jsx / Login.jsx         ← componentes reutilizables y pantalla de login
  modules/
    Dashboard.jsx, Tarjetas.jsx, Gastos.jsx, MSI.jsx, PlanDeudas.jsx, Simulador.jsx
  App.jsx                      ← navegación + manejo de sesión
```

## Sobre los archivos .jsx y .compiled.js

Cada módulo existe en dos versiones:

- `src/modules/Dashboard.jsx` — el código fuente legible, con JSX (`<div>...</div>` directamente en JavaScript). **Edita este archivo** si quieres cambiar algo.
- `src/modules/Dashboard.compiled.js` — el mismo código, ya convertido a JavaScript plano (`React.createElement(...)`) que cualquier navegador entiende sin ayuda. **Este es el que `index.html` realmente carga.**

Si editas un `.jsx`, necesitas volver a generar su `.compiled.js` correspondiente para que el cambio se refleje en la app. Si tienes Node.js instalado, puedes correr:

```bash
npm install esbuild --no-save
node build.cjs
```

Esto regenera todos los `.compiled.js` a partir de los `.jsx`. Si no quieres instalar nada, también puedes pegar el contenido de un `.jsx` en algún transpilador en línea de JSX (buscando "JSX to JavaScript online") y reemplazar el `.compiled.js` a mano.

La razón de este enfoque (en vez de usar Babel en el navegador como en una primera versión de este proyecto): algunas extensiones de Chrome interceptan y rompen los scripts con `type="text/babel"`, y depender de transpilar en cada carga es más lento e introduce un punto de falla extra. Pre-compilar una sola vez evita ambos problemas.
