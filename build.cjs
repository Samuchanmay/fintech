const esbuild = require('/home/claude/.npm-global/lib/node_modules/tsx/node_modules/esbuild');
const fs = require('fs');
const path = require('path');

const base = '/home/claude/tdc-app';

const archivos = [
  'src/components/UI.jsx',
  'src/components/Login.jsx',
  'src/modules/Dashboard.jsx',
  'src/modules/Tarjetas.jsx',
  'src/modules/Gastos.jsx',
  'src/modules/MSI.jsx',
  'src/modules/PlanDeudas.jsx',
  'src/modules/Simulador.jsx',
  'src/App.jsx',
];

for (const archivo of archivos) {
  const rutaEntrada = path.join(base, archivo);
  const rutaSalida = path.join(base, archivo.replace(/\.jsx$/, '.compiled.js'));
  const fuente = fs.readFileSync(rutaEntrada, 'utf-8');

  const resultado = esbuild.transformSync(fuente, {
    loader: 'jsx',
    jsx: 'transform', // React.createElement clásico, sin runtime automático (compatible con React 18 UMD)
    target: 'es2018',
  });

  fs.writeFileSync(rutaSalida, resultado.code);
  console.log('Compilado:', archivo, '->', path.basename(rutaSalida));
}

console.log('\nListo. Archivos .compiled.js generados junto a cada .jsx original.');
