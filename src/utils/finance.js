const BANCOS_MEXICO = [
  { id: "bbva", nombre: "BBVA" },
  { id: "hsbc", nombre: "HSBC" },
  { id: "santander", nombre: "Santander" },
  { id: "banamex", nombre: "Citibanamex" },
  { id: "banorte", nombre: "Banorte" },
  { id: "scotiabank", nombre: "Scotiabank" },
  { id: "inbursa", nombre: "Inbursa" },
  { id: "banregio", nombre: "Banregio" },
  { id: "afirme", nombre: "Afirme" },
  { id: "azteca", nombre: "Banco Azteca" },
  { id: "bajio", nombre: "Banco del Bajío" },
  { id: "interacciones", nombre: "Banco Interacciones" },
  { id: "invex", nombre: "Invex" },
  { id: "multiva", nombre: "Multiva" },
  { id: "mifel", nombre: "Mifel" },
  { id: "monbus", nombre: "Monbus" },
  { id: "pagatodo", nombre: "PagaTodo" },
  { id: "bancoppel", nombre: "BanCoppel" },
  { id: "famsa", nombre: "Banco Famsa" },
  { id: "azimon", nombre: "Azimon" },
  { id: "autofin", nombre: "Autofin" },
  { id: "kubo", nombre: "Kubo Financiero" },
  { id: "nu", nombre: "Nu México" },
  { id: "klar", nombre: "Klar" },
  { id: "stori", nombre: "Stori" },
  { id: "hey", nombre: "Hey Banco" },
  { id: "bineo", nombre: "Bineo" },
  { id: "mercadopago", nombre: "Mercado Pago" },
  { id: "dinn", nombre: "Dinn" },
  { id: "automatico", nombre: "Automático" },
  { id: "otro", nombre: "Otro…" },
];

function darFormatoMoneda(valor) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
  }).format(valor);
}

function calcularSaldo(limite, saldoDisponible) {
  return Math.max(0, (parseFloat(limite) || 0) - (parseFloat(saldoDisponible) || 0));
}

function calcularPorcentajeUso(limite, saldoDisponible) {
  const l = parseFloat(limite) || 0;
  const sd = parseFloat(saldoDisponible) || 0;
  if (l === 0) return 0;
  return Math.min(100, ((l - sd) / l) * 100);
}

function darFechaCorte(fechaISO, tarjetaId) {
  if (!fechaISO) return "";
  return new Date(fechaISO).toLocaleDateString("es-MX", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

window.BANCOS_MEXICO = BANCOS_MEXICO;
window.darFormatoMoneda = darFormatoMoneda;
window.calcularSaldo = calcularSaldo;
window.calcularPorcentajeUso = calcularPorcentajeUso;
window.darFechaCorte = darFechaCorte;
