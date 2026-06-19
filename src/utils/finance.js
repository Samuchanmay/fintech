// finance.js — Toda la lógica de cálculo financiero, sin dependencias externas.
// Replica la misma lógica ya validada en la versión de hoja de cálculo de TDC Control.

function creditoDisponible(tarjeta) {
  return tarjeta.limite - tarjeta.saldo;
}

function porcentajeUtilizacion(tarjeta) {
  if (!tarjeta.limite) return 0;
  return tarjeta.saldo / tarjeta.limite;
}

function interesMensualProyectado(tarjeta) {
  return tarjeta.saldo * (tarjeta.tasaAnual / 12);
}

function estatusUtilizacion(tarjeta, config) {
  const u = porcentajeUtilizacion(tarjeta);
  if (u >= config.umbralRiesgo) return "riesgo";
  if (u >= config.umbralSano) return "atencion";
  return "sano";
}

function totalesGenerales(tarjetas) {
  const deudaTotal = tarjetas.reduce((s, t) => s + t.saldo, 0);
  const lineasTotal = tarjetas.reduce((s, t) => s + t.limite, 0);
  const disponibleTotal = tarjetas.reduce((s, t) => s + creditoDisponible(t), 0);
  const pagoMinimoTotal = tarjetas.reduce((s, t) => s + (t.pagoMinimo || 0), 0);
  const interesMensualTotal = tarjetas.reduce((s, t) => s + interesMensualProyectado(t), 0);
  const utilizacionTotal = lineasTotal > 0 ? deudaTotal / lineasTotal : 0;
  return { deudaTotal, lineasTotal, disponibleTotal, pagoMinimoTotal, interesMensualTotal, utilizacionTotal };
}

function scoreEstabilidad(tarjetas, config) {
  const { utilizacionTotal } = totalesGenerales(tarjetas);
  const tarjetasEnRiesgo = tarjetas.filter(t => porcentajeUtilizacion(t) >= config.umbralRiesgo).length;
  const score = Math.round(100 - utilizacionTotal * 70 - tarjetasEnRiesgo * 5);
  return Math.max(0, Math.min(100, score));
}

/**
 * Plan de pago: ordena tarjetas según método y calcula meses estimados por tarjeta,
 * asumiendo pago fijo mensual con interés compuesto mensual sobre saldo decreciente.
 * Devuelve "insuficiente" si el pago no alcanza a cubrir el interés generado.
 */
function calcularPlanDeudas(tarjetas, metodo, pagoExtra) {
  const ordenadas = [...tarjetas].sort((a, b) => {
    if (metodo === "nieve") return a.saldo - b.saldo;
    return b.tasaAnual - a.tasaAnual;
  });

  return ordenadas.map((t, idx) => {
    const esPrioridad = idx === 0;
    const pagoMensual = esPrioridad ? (t.pagoMinimo || 0) + pagoExtra : (t.pagoMinimo || 0);
    const tasaMensual = t.tasaAnual / 12;
    const interesMensual = t.saldo * tasaMensual;

    let mesesEstimados;
    if (t.saldo <= 0) {
      mesesEstimados = 0;
    } else if (pagoMensual <= interesMensual) {
      mesesEstimados = null; // pago insuficiente
    } else {
      mesesEstimados = Math.ceil(
        -Math.log(1 - (t.saldo * tasaMensual) / pagoMensual) / Math.log(1 + tasaMensual)
      );
    }

    return { ...t, prioridad: idx + 1, pagoMensual, mesesEstimados };
  });
}

/**
 * Simulador de escenarios: dado un pago mensual fijo sobre la deuda total agregada,
 * calcula meses para liquidar e interés total pagado.
 */
function simularEscenario(deudaTotal, tasaAnualPromedio, pagoMensual) {
  const tasaMensual = tasaAnualPromedio / 12;
  const interesMensualInicial = deudaTotal * tasaMensual;

  if (deudaTotal <= 0) return { meses: 0, interesTotal: 0, insuficiente: false };
  if (pagoMensual <= interesMensualInicial) return { meses: null, interesTotal: null, insuficiente: true };

  const mesesExactos = -Math.log(1 - (deudaTotal * tasaMensual) / pagoMensual) / Math.log(1 + tasaMensual);
  const meses = Math.ceil(mesesExactos);

  // Para el interés total, simulamos mes a mes con el saldo real decreciente,
  // en vez de usar (pagoMensual * meses - deudaTotal). Esa fórmula simple
  // sobreestima el interés cuando "meses" se redondea hacia arriba, porque
  // asume que el último mes también se paga completo, cuando en realidad
  // el último pago suele ser parcial (solo lo que falta del saldo).
  let saldoRestante = deudaTotal;
  let interesAcumulado = 0;
  for (let i = 0; i < meses; i++) {
    const interesDelMes = saldoRestante * tasaMensual;
    interesAcumulado += interesDelMes;
    const pagoEsteMes = Math.min(pagoMensual, saldoRestante + interesDelMes);
    saldoRestante = saldoRestante + interesDelMes - pagoEsteMes;
  }
  const interesTotal = Math.max(0, interesAcumulado);
  return { meses, interesTotal, insuficiente: false };
}

function tasaPromedioPonderada(tarjetas) {
  const deudaTotal = tarjetas.reduce((s, t) => s + t.saldo, 0);
  if (deudaTotal === 0) return 0;
  const sumaPonderada = tarjetas.reduce((s, t) => s + t.saldo * t.tasaAnual, 0);
  return sumaPonderada / deudaTotal;
}

/**
 * MSI: calcula mensualidad, meses transcurridos, restantes, saldo pendiente y % de avance.
 */
function calcularMSI(compra) {
  const mensualidad = compra.montoTotal / compra.mesesContratados;
  const hoy = new Date();
  const fechaCompra = new Date(compra.fechaCompra);

  let mesesTranscurridos =
    (hoy.getFullYear() - fechaCompra.getFullYear()) * 12 + (hoy.getMonth() - fechaCompra.getMonth());
  mesesTranscurridos = Math.max(0, Math.min(compra.mesesContratados, mesesTranscurridos));

  const mesesRestantes = compra.mesesContratados - mesesTranscurridos;
  const saldoPendiente = mensualidad * mesesRestantes;
  const porcentajeAvance = mesesTranscurridos / compra.mesesContratados;

  const fechaTermino = new Date(fechaCompra);
  fechaTermino.setMonth(fechaTermino.getMonth() + compra.mesesContratados);

  let estatus;
  if (mesesRestantes <= 0) estatus = "liquidado";
  else if (mesesRestantes === 1) estatus = "ultimo_mes";
  else estatus = "activo";

  return { mensualidad, mesesTranscurridos, mesesRestantes, saldoPendiente, porcentajeAvance, fechaTermino, estatus };
}

function diaSiguienteOcurrencia(diaDelMes) {
  const hoy = new Date();
  const diaHoy = hoy.getDate();
  if (diaDelMes >= diaHoy) return diaDelMes - diaHoy;
  const diasEnMesActual = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).getDate();
  return diasEnMesActual - diaHoy + diaDelMes;
}

function formatoMoneda(valor) {
  if (typeof valor !== "number" || isNaN(valor)) return "$0";
  return valor.toLocaleString("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 });
}

function formatoPorcentaje(valor) {
  if (typeof valor !== "number" || isNaN(valor)) return "0%";
  return (valor * 100).toFixed(1) + "%";
}

const FinanceUtilsExport = {
  creditoDisponible,
  porcentajeUtilizacion,
  interesMensualProyectado,
  estatusUtilizacion,
  totalesGenerales,
  scoreEstabilidad,
  calcularPlanDeudas,
  simularEscenario,
  tasaPromedioPonderada,
  calcularMSI,
  diaSiguienteOcurrencia,
  formatoMoneda,
  formatoPorcentaje,
};

// En el navegador: variable global que App.jsx y los módulos consumen directamente.
if (typeof window !== "undefined") {
  window.FinanceUtils = FinanceUtilsExport;
}
// En Node (solo para pruebas locales con `node test.js`, no se usa en el navegador):
if (typeof module !== "undefined" && module.exports) {
  module.exports = FinanceUtilsExport;
}
