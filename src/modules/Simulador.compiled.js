function SimuladorModule({ tarjetas }) {
  const totales = FinanceUtils.totalesGenerales(tarjetas);
  const tasaProm = FinanceUtils.tasaPromedioPonderada(tarjetas);
  const [pagos, setPagos] = useState({ a: 5e3, b: 8e3, c: 1e4 });
  function actualizar(escenario, valor) {
    setPagos((p) => ({ ...p, [escenario]: parseFloat(valor) || 0 }));
  }
  if (tarjetas.length === 0) {
    return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "page-header" }, /* @__PURE__ */ React.createElement("h1", { className: "page-title" }, "Simulador de escenarios"), /* @__PURE__ */ React.createElement("p", { className: "page-subtitle" }, "Compara distintos niveles de pago mensual y su impacto.")), /* @__PURE__ */ React.createElement(EmptyState, { title: "Agrega tarjetas primero", subtitle: "Necesitas al menos una tarjeta con saldo para simular escenarios." }));
  }
  const escenarios = [
    { key: "a", label: "Conservador" },
    { key: "b", label: "Moderado" },
    { key: "c", label: "Agresivo" }
  ].map((e) => ({
    ...e,
    pago: pagos[e.key],
    resultado: FinanceUtils.simularEscenario(totales.deudaTotal, tasaProm, pagos[e.key])
  }));
  const baseInteres = escenarios[0].resultado.interesTotal;
  return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "page-header" }, /* @__PURE__ */ React.createElement("h1", { className: "page-title" }, "Simulador de escenarios"), /* @__PURE__ */ React.createElement("p", { className: "page-subtitle" }, "Deuda total: ", /* @__PURE__ */ React.createElement("strong", null, FinanceUtils.formatoMoneda(totales.deudaTotal)), " \xB7 Tasa promedio ponderada: ", /* @__PURE__ */ React.createElement("strong", null, FinanceUtils.formatoPorcentaje(tasaProm)))), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" } }, escenarios.map((e) => /* @__PURE__ */ React.createElement("div", { className: "card", key: e.key }, /* @__PURE__ */ React.createElement("div", { className: "kpi-label" }, "Escenario ", e.label), /* @__PURE__ */ React.createElement("div", { className: "form-group", style: { marginTop: "10px" } }, /* @__PURE__ */ React.createElement("label", null, "Pago mensual"), /* @__PURE__ */ React.createElement("input", { type: "number", value: e.pago, onChange: (ev) => actualizar(e.key, ev.target.value) })), e.resultado.insuficiente ? /* @__PURE__ */ React.createElement("p", { style: { color: "var(--danger)", fontSize: "13px" } }, "Este pago no cubre ni el inter\xE9s generado.") : /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { style: { marginTop: "14px" } }, /* @__PURE__ */ React.createElement("div", { className: "kpi-label" }, "Tiempo para liquidar"), /* @__PURE__ */ React.createElement("div", { className: "kpi-value", style: { fontSize: "22px" } }, e.resultado.meses, " meses")), /* @__PURE__ */ React.createElement("div", { style: { marginTop: "10px" } }, /* @__PURE__ */ React.createElement("div", { className: "kpi-label" }, "Inter\xE9s total a pagar"), /* @__PURE__ */ React.createElement("div", { className: "kpi-value", style: { fontSize: "18px", color: "var(--warn)" } }, FinanceUtils.formatoMoneda(e.resultado.interesTotal))), e.key !== "a" && baseInteres != null && /* @__PURE__ */ React.createElement("div", { style: { marginTop: "10px", fontSize: "12px", color: "var(--signal)" } }, "Ahorras ", FinanceUtils.formatoMoneda(baseInteres - e.resultado.interesTotal), " vs. Conservador"))))), /* @__PURE__ */ React.createElement("p", { style: { fontSize: "12px", color: "var(--text-dim)", marginTop: "20px" } }, "El modelo asume pagos mensuales fijos, sin nuevas compras, con inter\xE9s compuesto mensual sobre el saldo restante. Es una aproximaci\xF3n \xFAtil para comparar escenarios entre s\xED, no un c\xE1lculo exacto del banco."));
}
