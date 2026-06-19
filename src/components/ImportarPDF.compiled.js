const CATEGORIAS_IMPORT = ["Comida", "Transporte", "Hogar", "Servicios", "Salud", "Educaci\xF3n", "Entretenimiento", "Negocio", "Ropa", "Otros"];
function ImportarPDFModal({ tarjetas, onConfirmar, onClose }) {
  var _a;
  const [paso, setPaso] = useState("subir");
  const [tarjetaId, setTarjetaId] = useState(((_a = tarjetas[0]) == null ? void 0 : _a.id) || "");
  const [archivo, setArchivo] = useState(null);
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState(null);
  const [guardando, setGuardando] = useState(false);
  async function manejarArchivo(e) {
    const file = e.target.files[0];
    if (!file) return;
    setArchivo(file);
  }
  async function procesar() {
    if (!archivo) {
      alert("Selecciona un archivo PDF primero.");
      return;
    }
    if (!tarjetaId) {
      alert("Selecciona a qu\xE9 tarjeta pertenece este estado de cuenta.");
      return;
    }
    setPaso("procesando");
    setError(null);
    try {
      const r = await window.PDFParser.procesarPDFEstadoCuenta(archivo);
      if (!r.huboDatos) {
        setError("No se detect\xF3 informaci\xF3n reconocible en este PDF. Puede ser un formato distinto al de Banamex, o un PDF escaneado. Puedes seguir usando la app y capturar los datos a mano.");
        setPaso("error");
        return;
      }
      setResultado(r);
      setPaso("revision");
    } catch (err) {
      setError(err.message);
      setPaso("error");
    }
  }
  function actualizarCategoriaGasto(idx, categoria) {
    setResultado((r) => {
      const gastos = [...r.gastos];
      gastos[idx] = { ...gastos[idx], categoriaSugerida: categoria };
      return { ...r, gastos };
    });
  }
  function toggleIncluirGasto(idx) {
    setResultado((r) => {
      const gastos = [...r.gastos];
      gastos[idx] = { ...gastos[idx], incluir: !gastos[idx].incluir };
      return { ...r, gastos };
    });
  }
  function toggleIncluirMSI(idx) {
    setResultado((r) => {
      const msi = [...r.msi];
      msi[idx] = { ...msi[idx], incluir: !msi[idx].incluir };
      return { ...r, msi };
    });
  }
  async function confirmar() {
    setGuardando(true);
    try {
      await onConfirmar(tarjetaId, resultado);
      onClose();
    } catch (err) {
      alert("Error guardando: " + err.message);
    } finally {
      setGuardando(false);
    }
  }
  return /* @__PURE__ */ React.createElement(Modal, { title: "\u{1F4C4} Importar estado de cuenta", onClose }, paso === "subir" && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "form-group" }, /* @__PURE__ */ React.createElement("label", null, "\xBFA cu\xE1l tarjeta pertenece?"), /* @__PURE__ */ React.createElement("select", { value: tarjetaId, onChange: (e) => setTarjetaId(e.target.value) }, tarjetas.map((t) => /* @__PURE__ */ React.createElement("option", { key: t.id, value: t.id }, t.alias)))), /* @__PURE__ */ React.createElement("div", { className: "form-group" }, /* @__PURE__ */ React.createElement("label", null, "Archivo PDF"), /* @__PURE__ */ React.createElement("input", { type: "file", accept: "application/pdf", onChange: manejarArchivo })), /* @__PURE__ */ React.createElement("p", { style: { fontSize: "12px", color: "var(--text-dim)" } }, "Funciona mejor con estados de cuenta de Banamex/Citibanamex en PDF de texto (no escaneado). Con otros bancos puede detectar poco o nada \u2014 siempre vas a poder revisar y corregir antes de guardar."), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: "8px", marginTop: "20px" } }, /* @__PURE__ */ React.createElement("button", { className: "btn btn-primary", onClick: procesar, style: { flex: 1 } }, "Analizar PDF"), /* @__PURE__ */ React.createElement("button", { className: "btn btn-secondary", onClick: onClose }, "Cancelar"))), paso === "procesando" && /* @__PURE__ */ React.createElement("div", { style: { textAlign: "center", padding: "30px 0" } }, /* @__PURE__ */ React.createElement("p", { style: { color: "var(--text-dim)" } }, "Leyendo tu estado de cuenta\u2026")), paso === "error" && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { style: { color: "var(--danger)", fontSize: "13px" } }, error), /* @__PURE__ */ React.createElement("button", { className: "btn btn-secondary", onClick: () => setPaso("subir"), style: { marginTop: "12px" } }, "Volver a intentar")), paso === "revision" && resultado && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { background: "var(--surface-raised)", borderRadius: "8px", padding: "10px", marginBottom: "14px", fontSize: "12px" } }, resultado.resumen.saldoTotal != null && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("b", null, "Saldo total:"), " ", FinanceUtils.formatoMoneda(resultado.resumen.saldoTotal)), resultado.resumen.limiteCredito != null && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("b", null, "L\xEDmite de cr\xE9dito:"), " ", FinanceUtils.formatoMoneda(resultado.resumen.limiteCredito)), resultado.resumen.creditoDisponible != null && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("b", null, "Cr\xE9dito disponible:"), " ", FinanceUtils.formatoMoneda(resultado.resumen.creditoDisponible)), resultado.resumen.pagoMinimo != null && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("b", null, "Pago m\xEDnimo:"), " ", FinanceUtils.formatoMoneda(resultado.resumen.pagoMinimo)), resultado.resumen.pagoNoInteres != null && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("b", null, "Pago para no generar inter\xE9s:"), " ", FinanceUtils.formatoMoneda(resultado.resumen.pagoNoInteres)), resultado.resumen.tasaInteresAnual != null && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("b", null, "Tasa anual:"), " ", (resultado.resumen.tasaInteresAnual * 100).toFixed(2), "%"), resultado.resumen.fechaCorte && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("b", null, "Fecha de corte:"), " ", resultado.resumen.fechaCorte), resultado.resumen.fechaLimitePago && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("b", null, "Fecha l\xEDmite de pago:"), " ", resultado.resumen.fechaLimitePago)), resultado.msi.length > 0 && /* @__PURE__ */ React.createElement("div", { style: { marginBottom: "14px" } }, /* @__PURE__ */ React.createElement("label", null, "Compras a MSI detectadas (", resultado.msi.length, ")"), /* @__PURE__ */ React.createElement("div", { style: { maxHeight: "150px", overflowY: "auto", border: "1px solid var(--border)", borderRadius: "6px" } }, /* @__PURE__ */ React.createElement("table", { className: "data-table", style: { fontSize: "11px" } }, /* @__PURE__ */ React.createElement("tbody", null, resultado.msi.map((m, idx) => /* @__PURE__ */ React.createElement("tr", { key: idx }, /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("input", { type: "checkbox", checked: m.incluir, onChange: () => toggleIncluirMSI(idx) })), /* @__PURE__ */ React.createElement("td", null, m.descripcion), /* @__PURE__ */ React.createElement("td", null, FinanceUtils.formatoMoneda(m.saldoPendiente)), /* @__PURE__ */ React.createElement("td", null, m.numPagoActual, "/", m.numPagoTotal))))))), resultado.gastos.length > 0 && /* @__PURE__ */ React.createElement("div", { style: { marginBottom: "14px" } }, /* @__PURE__ */ React.createElement("label", null, "Gastos detectados (", resultado.gastos.length, ")"), /* @__PURE__ */ React.createElement("div", { style: { maxHeight: "200px", overflowY: "auto", border: "1px solid var(--border)", borderRadius: "6px" } }, /* @__PURE__ */ React.createElement("table", { className: "data-table", style: { fontSize: "11px" } }, /* @__PURE__ */ React.createElement("tbody", null, resultado.gastos.map((g, idx) => /* @__PURE__ */ React.createElement("tr", { key: idx }, /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("input", { type: "checkbox", checked: g.incluir, onChange: () => toggleIncluirGasto(idx) })), /* @__PURE__ */ React.createElement("td", null, g.descripcion), /* @__PURE__ */ React.createElement("td", null, FinanceUtils.formatoMoneda(g.monto)), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("select", { value: g.categoriaSugerida, onChange: (e) => actualizarCategoriaGasto(idx, e.target.value), style: { fontSize: "11px", padding: "2px" } }, CATEGORIAS_IMPORT.map((c) => /* @__PURE__ */ React.createElement("option", { key: c, value: c }, c)))))))))), resultado.pagos.length > 0 && /* @__PURE__ */ React.createElement("p", { style: { fontSize: "11px", color: "var(--text-dim)" } }, "Se detectaron ", resultado.pagos.length, " pago(s)/abono(s) \u2014 no se guardan como gasto."), /* @__PURE__ */ React.createElement("p", { style: { fontSize: "11px", color: "var(--text-dim)", marginTop: "10px" } }, "Esto va a actualizar el saldo, fechas y tasa de la tarjeta seleccionada, y agregar los gastos y MSI marcados arriba."), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: "8px", marginTop: "16px" } }, /* @__PURE__ */ React.createElement("button", { className: "btn btn-primary", onClick: confirmar, disabled: guardando, style: { flex: 1 } }, guardando ? "Guardando\u2026" : "Confirmar y guardar"), /* @__PURE__ */ React.createElement("button", { className: "btn btn-secondary", onClick: onClose }, "Cancelar"))));
}
