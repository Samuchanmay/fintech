# TDC Control

Una app para controlar tarjetas de crédito, gastos, compras a meses sin intereses, y un plan para salir de deudas. Construida en React, sin paso de build (no requiere `npm install`): el navegador carga React y Babel desde un CDN y transpila el código directamente.

## Cómo correrla en tu computadora

Necesitas un servidor local simple porque los navegadores bloquean `fetch` de archivos cuando abres el `index.html` directamente con doble clic (protocolo `file://`).

Con Python instalado (casi cualquier Mac/Linux lo trae):

```bash
cd tdc-control
python3 -m http.server 8000
```

Luego abre `http://localhost:8000` en tu navegador.

Si tienes Node.js, otra opción:

```bash
npx serve .
```

## Cómo subirla a GitHub Pages

1. Crea un repositorio nuevo en GitHub (puede ser público o privado, pero Pages gratis requiere público en cuentas personales).
2. Sube todos los archivos de esta carpeta tal cual están (respetando la estructura de carpetas `src/`).
3. Ve a **Settings → Pages** en tu repositorio.
4. En "Source", selecciona la rama `main` (o `master`) y la carpeta `/ (root)`.
5. Guarda. Después de uno o dos minutos, GitHub te dará una URL tipo `https://tu-usuario.github.io/tu-repo/`.

## Dónde viven tus datos

Todo se guarda en `localStorage` de tu navegador — es decir, **solo en el dispositivo y navegador donde lo abras**. Si abres la app en tu teléfono y en tu computadora, son dos conjuntos de datos completamente separados, no se sincronizan.

Usa los botones **"Exportar backup"** e **"Importar backup"** en la barra lateral para mover tus datos entre dispositivos manualmente (descarga un archivo `.json` que puedes guardar donde quieras y volver a cargar después).

## Estructura del proyecto

```
index.html              ← punto de entrada, carga todo en orden
src/
  styles/main.css       ← sistema de diseño (colores, tipografía, layout)
  utils/
    finance.js           ← toda la lógica de cálculo financiero
    store.js              ← guardar/leer datos de localStorage
  components/
    UI.jsx                ← componentes reutilizables (Modal, StatusPill, etc.)
  modules/
    Dashboard.jsx
    Tarjetas.jsx
    Gastos.jsx
    MSI.jsx
    PlanDeudas.jsx
    Simulador.jsx
  App.jsx                  ← arma la navegación y conecta todo
```

## Por qué no hay un paso de build

Para mantener esto simple de desplegar (subir archivos a GitHub y listo, sin instalar nada ni configurar CI/CD), los archivos `.jsx` se transforman en el navegador mismo usando Babel Standalone, cargado desde un CDN. Esto es perfectamente válido para aprender y para un proyecto personal, pero tiene dos costos reales que vale la pena conocer:

- **Más lento que una app con build real**: cada vez que alguien abre la página, su navegador tiene que transpilar todo el JSX antes de poder mostrar nada. Para una app de este tamaño no se nota, pero no escalaría bien a algo mucho más grande.
- **Requiere internet siempre**: si no hay conexión, no carga (React, Babel y las tipografías vienen de CDNs externos).

Si en algún momento quieres "graduar" este proyecto a algo más robusto, el siguiente paso natural sería migrarlo a Vite (`npm create vite@latest`), lo cual te daría un build real, recarga en caliente durante desarrollo, y archivos ya optimizados para producción.
