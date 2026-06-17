// store.js — Capa de persistencia. Todo vive en localStorage del navegador.
// Estructura de datos:
//   tarjetas: [{ id, alias, banco, color, limite, saldo, tasaAnual, diaCorte, diaPago, pagoMinimo }]
//   gastos:   [{ id, fecha, tarjetaId, categoria, descripcion, monto }]
//   msi:      [{ id, producto, tarjetaId, montoTotal, fechaCompra, mesesContratados }]
//   config:   { metodoPlan: 'nieve' | 'avalancha', pagoExtraMensual, umbralRiesgo }

const STORAGE_KEY = "tdc_control_data_v1";

const DEFAULT_DATA = {
  tarjetas: [],
  gastos: [],
  msi: [],
  config: {
    metodoPlan: "nieve",
    pagoExtraMensual: 3000,
    umbralRiesgo: 0.7,
    umbralSano: 0.3,
  },
};

function cargarDatos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(DEFAULT_DATA);
    const parsed = JSON.parse(raw);
    // Merge defensivo: si faltan llaves (versión vieja), se completan con defaults
    return {
      tarjetas: parsed.tarjetas || [],
      gastos: parsed.gastos || [],
      msi: parsed.msi || [],
      config: { ...DEFAULT_DATA.config, ...(parsed.config || {}) },
    };
  } catch (err) {
    console.error("Error leyendo datos guardados, se reinicia:", err);
    return structuredClone(DEFAULT_DATA);
  }
}

function guardarDatos(datos) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(datos));
    return true;
  } catch (err) {
    console.error("Error guardando datos:", err);
    return false;
  }
}

function generarId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function exportarDatos() {
  const datos = cargarDatos();
  const blob = new Blob([JSON.stringify(datos, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `tdc_control_backup_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function importarDatos(jsonText) {
  const parsed = JSON.parse(jsonText);
  guardarDatos(parsed);
}

function borrarTodo() {
  localStorage.removeItem(STORAGE_KEY);
}

const StoreUtilsExport = { cargarDatos, guardarDatos, generarId, exportarDatos, importarDatos, borrarTodo, DEFAULT_DATA };

if (typeof window !== "undefined") {
  window.StoreUtils = StoreUtilsExport;
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = StoreUtilsExport;
}
