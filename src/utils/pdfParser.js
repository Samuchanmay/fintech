// pdfParser.js — Lee un PDF en el navegador (vía PDF.js) y extrae los datos
// de un estado de cuenta de tarjeta de crédito.
//
// LIMITACIÓN HONESTA: el parser de regex está calibrado específicamente
// contra el formato de Banamex/Citibanamex. Con otros bancos puede detectar
// poco o nada — en ese caso, igual deja capturar todo a mano en la revisión.

async function extraerTextoDePDF(arrayBuffer) {
  const pdfjsLib = window["pdfjs-dist/build/pdf"];
  pdfjsLib.GlobalWorkerOptions.workerSrc = "./src/vendor/pdf.worker.min.mjs";

  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let textoCompleto = "";
  const TOLERANCIA_Y = 3; // puntos PDF; absorbe diferencias de sub-píxel entre
                          // textos que visualmente pertenecen a la misma línea
                          // pero el PDF los dibujó con un baseline ligeramente distinto.

  for (let numPagina = 1; numPagina <= pdf.numPages; numPagina++) {
    const pagina = await pdf.getPage(numPagina);
    const contenido = await pagina.getTextContent();

    // Agrupar por proximidad de Y (no por igualdad exacta): se ordenan todos
    // los items por Y descendente, y cualquier item cuya Y esté dentro de
    // TOLERANCIA_Y del último grupo abierto se considera parte de esa misma línea.
    const itemsOrdenados = [...contenido.items].sort((a, b) => b.transform[5] - a.transform[5]);
    const grupos = [];
    itemsOrdenados.forEach((item) => {
      const y = item.transform[5];
      const grupoExistente = grupos.find((g) => Math.abs(g.y - y) <= TOLERANCIA_Y);
      if (grupoExistente) {
        grupoExistente.items.push(item);
      } else {
        grupos.push({ y, items: [item] });
      }
    });

    grupos.forEach((grupo) => {
      const items = grupo.items.sort((a, b) => a.transform[4] - b.transform[4]);
      const lineaTexto = items.map((it) => it.str).join(" ");
      textoCompleto += lineaTexto + "\n";
    });
  }

  return textoCompleto;
}

const MESES_MAP_PDF = { ene: "01", feb: "02", mar: "03", abr: "04", may: "05", jun: "06",
                         jul: "07", ago: "08", sep: "09", oct: "10", nov: "11", dic: "12" };

function normalizaFechaPDF(d, mes, y) {
  const mm = MESES_MAP_PDF[mes.toLowerCase().substring(0, 3)];
  if (!mm) return null;
  return `${y}-${mm}-${d.padStart(2, "0")}`;
}

function extraerResumenPDF(text) {
  const resumen = {};

  let m = text.match(/Fecha de corte:?\s*(\d{1,2})-([a-záé]{3})-(\d{4})/i);
  if (m) resumen.fechaCorte = normalizaFechaPDF(m[1], m[2], m[3]);

  m = text.match(/Fecha límite de pago:?\s*\d*\s*[a-záé]+,?\s*(\d{1,2})-([a-záé]{3})-(\d{4})/i);
  if (m) resumen.fechaLimitePago = normalizaFechaPDF(m[1], m[2], m[3]);

  m = text.match(/Pago para no generar intereses:?\s*\d*\s*\$?\s*([\d,]+\.\d{2})/i);
  if (m) resumen.pagoNoInteres = parseFloat(m[1].replace(/,/g, ""));

  m = text.match(/Pago mínimo:?\s*\d*\s*\$?\s*([\d,]+\.\d{2})/i);
  if (m) resumen.pagoMinimo = parseFloat(m[1].replace(/,/g, ""));

  m = text.match(/L[ií]mite de cr[eé]dito:?\s*\$?\s*([\d,]+\.\d{2})/i);
  if (m) resumen.limiteCredito = parseFloat(m[1].replace(/,/g, ""));

  m = text.match(/Saldo deudor total:?\s*\d*\s*\$?\s*([\d,]+\.\d{2})/i);
  if (m) {
    resumen.saldoTotal = parseFloat(m[1].replace(/,/g, ""));
  } else {
    // El layout de algunos PDFs separa la etiqueta de su valor por el cruce
    // de columnas (el valor puede aparecer ANTES de la etiqueta). Buscamos
    // el monto más cercano alrededor de la etiqueta, en cualquier dirección.
    const idx = text.search(/Saldo deudor total/i);
    if (idx !== -1) {
      const ventana = text.substring(Math.max(0, idx - 80), idx + 80);
      const montos = ventana.match(/\$\s*([\d,]+\.\d{2})/g);
      if (montos && montos.length > 0) {
        const ultimo = montos[montos.length - 1].replace(/[$\s]/g, "");
        resumen.saldoTotal = parseFloat(ultimo.replace(/,/g, ""));
      }
    }
  }

  m = text.match(/Cr[eé]dito disponible:?\s*\$?\s*([\d,]+\.\d{2})/i);
  if (m) resumen.creditoDisponible = parseFloat(m[1].replace(/,/g, ""));

  m = text.match(/(\d{1,2}\.\d{1,2})%\s*Sin IVA\s+(\d{1,3}\.\d{1,2})%/i);
  if (m) {
    resumen.cat = parseFloat(m[1]) / 100;
    resumen.tasaInteresAnual = parseFloat(m[2]) / 100;
  } else {
    m = text.match(/tasa de inter[eé]s anual[\s\S]{0,60}?(\d{1,3}\.\d{1,2})\s*%/i);
    if (m) resumen.tasaInteresAnual = parseFloat(m[1]) / 100;
  }

  return resumen;
}

function extraerMSIPDF(text) {
  const patron = /(\d{1,2}-[a-záé]{3}-\d{4})\s+(.+?)\s+\$([\d,]+\.\d{2})\s+\$([\d,]+\.\d{2})\s+\$([\d,]+\.\d{2})\s+(\d{1,2})\s+de\s+(\d{1,2})\s+NA/gi;
  const resultados = [];
  let m;
  while ((m = patron.exec(text)) !== null) {
    const [, fechaRaw, desc, monto, saldo, pago, numPago, totalPagos] = m;
    const [d, mo, y] = fechaRaw.split("-");
    const fecha = normalizaFechaPDF(d, mo, y);
    if (!fecha) continue;
    resultados.push({
      fecha,
      descripcion: desc.replace(/\s{2,}/g, " ").trim(),
      montoOriginal: parseFloat(monto.replace(/,/g, "")),
      saldoPendiente: parseFloat(saldo.replace(/,/g, "")),
      pagoRequerido: parseFloat(pago.replace(/,/g, "")),
      numPagoActual: parseInt(numPago, 10),
      numPagoTotal: parseInt(totalPagos, 10),
    });
  }
  return resultados;
}

function extraerRegularesPDF(text) {
  const lineas = text.split("\n");
  const gastos = [];
  const pagos = [];

  const patronLineaSimple = /^\s*(\d{1,2}-[a-záé]{3}-\d{4})\s+(\d{1,2}-[a-záé]{3}-\d{4})\s+(.+?)\s+([+\-])\s+\$([\d,]+\.\d{2})\s*$/i;
  const patronAbrePago = /^\s*(\d{1,2}-[a-záé]{3}-\d{4})\s+(\d{1,2}-[a-záé]{3}-\d{4})\s+(PAGO INTERBANCARIO|PAGO RECIBIDO|TRANSFERENCIA)/i;
  const patronTC = /^\s*TC1\*/i;
  const patronMontoSuelto = /([+\-])\s+\$([\d,]+\.\d{2})\s*$/;
  const patronEsMensualidadMSI = /\d{1,3}\s+de\s+\d{1,3}\s*$/i;

  let i = 0;
  while (i < lineas.length) {
    const linea = lineas[i];
    if (patronTC.test(linea)) { i++; continue; }

    const mSimple = linea.match(patronLineaSimple);
    if (mSimple) {
      const [, fOp, , desc, signo, monto] = mSimple;
      const descLimpia = desc.replace(/\s{2,}/g, " ").trim();
      if (patronEsMensualidadMSI.test(descLimpia)) { i++; continue; }
      const [d, mo, y] = fOp.split("-");
      const fecha = normalizaFechaPDF(d, mo, y);
      if (fecha) {
        gastos.push({
          fecha,
          descripcion: descLimpia,
          monto: parseFloat(monto.replace(/,/g, "")),
          signo,
        });
      }
      i++;
      continue;
    }

    const mAbre = linea.match(patronAbrePago);
    if (mAbre) {
      const [, fOp, , tipo] = mAbre;
      let montoEncontrado = null;
      let signoEncontrado = null;
      let j = i + 1;
      const limite = Math.min(i + 8, lineas.length);
      while (j < limite) {
        const mMonto = lineas[j].match(patronMontoSuelto);
        if (mMonto) { signoEncontrado = mMonto[1]; montoEncontrado = mMonto[2]; break; }
        j++;
      }
      const [d, mo, y] = fOp.split("-");
      const fecha = normalizaFechaPDF(d, mo, y);
      if (fecha) {
        pagos.push({
          fecha,
          descripcion: tipo,
          monto: montoEncontrado ? parseFloat(montoEncontrado.replace(/,/g, "")) : null,
          signo: signoEncontrado,
        });
      }
      i = montoEncontrado ? j + 1 : i + 1;
      continue;
    }
    i++;
  }
  return { gastos, pagos };
}

const CATEGORIAS_KEYWORDS_PDF = {
  "Comida": ["KFC", "MCDONALD", "BURGER", "DOMINOS", "PIZZA", "STARBUCKS", "RESTAURANT",
             "TACO", "SUSHI", "CAFE", "SAMS VENTA", "WALMART", "SORIANA", "CHEDRAUI",
             "OXXO", "SEVEN", "COSTCO"],
  "Transporte": ["GASOL", "GASOLINERA", "UBER", "DIDI", "ESTACIONAMIENTO", "PEAJE", "AEROMEXICO",
                 "VOLARIS", "VIVA AEROBUS", "AEROPUERTO"],
  "Hogar": ["STEREN", "HOME DEPOT", "FERRETERIA", "MUEBLES", "LIVERPOOL", "SEARS"],
  "Servicios": ["TELCEL", "ATT", "TELMEX", "IZZI", "TOTALPLAY", "CFE", "AGUA", "MERPAGO*TELCEL"],
  "Salud": ["FARMACIA", "FAR GUAD", "FARM", "HOSPITAL", "CLINICA", "DOCTOR", "DENTAL"],
  "Educación": ["UNIVERSIDAD", "ESCUELA", "COLEGIO", "CURSO", "UDEMY", "COURSERA"],
  "Entretenimiento": ["CINEPOLIS", "CINEMEX", "NETFLIX", "SPOTIFY", "DISNEY", "HBO"],
  "Negocio": ["ANTHROPIC", "CLAUDE", "OPENAI", "GOOGLE WORKSPACE", "MICROSOFT", "ADOBE", "AWS"],
};

function categorizarPDF(descripcion) {
  const descUpper = descripcion.toUpperCase();
  for (const categoria in CATEGORIAS_KEYWORDS_PDF) {
    const keywords = CATEGORIAS_KEYWORDS_PDF[categoria];
    for (let k = 0; k < keywords.length; k++) {
      if (descUpper.indexOf(keywords[k]) !== -1) return categoria;
    }
  }
  return "Otros";
}

async function procesarPDFEstadoCuenta(file) {
  const arrayBuffer = await file.arrayBuffer();
  const texto = await extraerTextoDePDF(arrayBuffer);

  if (!texto || texto.trim().length < 50) {
    throw new Error("No se pudo leer texto de este PDF. Puede ser un PDF escaneado (imagen), no un PDF de texto real.");
  }

  const resumen = extraerResumenPDF(texto);
  const msi = extraerMSIPDF(texto);
  const { gastos, pagos } = extraerRegularesPDF(texto);

  gastos.forEach((g) => { g.categoriaSugerida = categorizarPDF(g.descripcion); g.incluir = true; });
  msi.forEach((m) => { m.incluir = true; });

  const huboDatos =
    Object.keys(resumen).length > 0 || msi.length > 0 || gastos.length > 0 || pagos.length > 0;

  return { resumen, msi, gastos, pagos, huboDatos, textoCrudo: texto };
}

window.PDFParser = { procesarPDFEstadoCuenta };
