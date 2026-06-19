function MSIForm({ tarjetas, onSave, onClose }) {
  var _a;
  const [form, setForm] = useState({
    producto: "",
    tarjetaId: ((_a = tarjetas[0]) == null ? void 0 : _a.id) || "",
    montoTotal: "",
    fechaCompra: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
    mesesContratados: "12"
  });
  function actualizar(campo, valor) {
    setForm((p) => ({ ...p, [campo]: valor }));
  }
  function guardar() {
    if (!form.producto.trim()) {
      alert("Describe el producto comprado.");
      return;
    }
    if (!form.montoTotal || parseFloat(form.montoTotal) <= 0) {
      alert("Ingresa un monto v\xE1lido.");
      return;
    }
    onSave({
      ...form,
      montoTotal: parseFloat(form.montoTotal),
      mesesContratados: parseInt(form.mesesContratados)
    });
  }
  return /* @__PURE__ */ React.createElement(Modal, { title: "Nueva compra a MSI", onClose }, /* @__PURE__ */ React.createElement("div", { className: "form-group" }, /* @__PURE__ */ React.createElement("label", null, "Producto"), /* @__PURE__ */ React.createElement("input", { value: form.producto, onChange: (e) => actualizar("producto", e.target.value), placeholder: "Ej. Laptop" })), /* @__PURE__ */ React.createElement("div", { className: "form-group" }, /* @__PURE__ */ React.createElement("label", null, "Tarjeta"), /* @__PURE__ */ React.createElement("select", { value: form.tarjetaId, onChange: (e) => actualizar("tarjetaId", e.target.value) }, tarjetas.map((t) => /* @__PURE__ */ React.createElement("option", { key: t.id, value: t.id }, t.alias)))), /* @__PURE__ */ React.createElement("div", { className: "form-row" }, /* @__PURE__ */ React.createElement("div", { className: "form-group" }, /* @__PURE__ */ React.createElement("label", null, "Monto total"), /* @__PURE__ */ React.createElement("input", { type: "number", value: form.montoTotal, onChange: (e) => actualizar("montoTotal", e.target.value), placeholder: "18000" })), /* @__PURE__ */ React.createElement("div", { className: "form-group" }, /* @__PURE__ */ React.createElement("label", null, "Meses contratados"), /* @__PURE__ */ React.createElement("select", { value: form.mesesContratados, onChange: (e) => actualizar("mesesContratados", e.target.value) }, [3, 6, 9, 12, 18, 24].map((m) => /* @__PURE__ */ React.createElement("option", { key: m, value: m }, m, " meses"))))), /* @__PURE__ */ React.createElement("div", { className: "form-group" }, /* @__PURE__ */ React.createElement("label", null, "Fecha de compra"), /* @__PURE__ */ React.createElement("input", { type: "date", value: form.fechaCompra, onChange: (e) => actualizar("fechaCompra", e.target.value) })), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: "8px", marginTop: "20px" } }, /* @__PURE__ */ React.createElement("button", { className: "btn btn-primary", onClick: guardar, style: { flex: 1 } }, "Guardar"), /* @__PURE__ */ React.createElement("button", { className: "btn btn-secondary", onClick: onClose }, "Cancelar")));
}
function MSIModule({ msi, tarjetas, onAdd, onDelete }) {
  const [mostrarForm, setMostrarForm] = useState(false);
  const tarjetaPorId = Object.fromEntries(tarjetas.map((t) => [t.id, t]));
  function guardar(datos) {
    onAdd(datos);
    setMostrarForm(false);
  }
  return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "page-header", style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start" } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h1", { className: "page-title" }, "Meses sin intereses"), /* @__PURE__ */ React.createElement("p", { className: "page-subtitle" }, "Tus compras diferidas, con avance y fecha de t\xE9rmino calculados solos.")), /* @__PURE__ */ React.createElement("button", { className: "btn btn-primary", disabled: tarjetas.length === 0, onClick: () => setMostrarForm(true) }, "+ Agregar compra a MSI")), tarjetas.length === 0 ? /* @__PURE__ */ React.createElement(EmptyState, { title: "Agrega una tarjeta primero", subtitle: "Necesitas al menos una tarjeta para registrar compras a MSI." }) : msi.length === 0 ? /* @__PURE__ */ React.createElement(EmptyState, { title: "Sin compras a MSI", subtitle: "Agrega una compra diferida para darle seguimiento.", actionLabel: "+ Agregar compra a MSI", onAction: () => setMostrarForm(true) }) : /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" } }, msi.map((compra) => {
    var _a;
    const calc = FinanceUtils.calcularMSI(compra);
    const estatusLabel = { liquidado: "Liquidado \u2705", ultimo_mes: "\xDAltimo mes \u{1F7E1}", activo: "Activo" }[calc.estatus];
    const colorBarra = calc.estatus === "liquidado" ? "var(--signal)" : calc.estatus === "ultimo_mes" ? "var(--warn)" : "var(--signal-dim)";
    return /* @__PURE__ */ React.createElement("div", { className: "card", key: compra.id }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", marginBottom: "8px" } }, /* @__PURE__ */ React.createElement("strong", null, compra.producto), /* @__PURE__ */ React.createElement("button", { className: "btn btn-danger", style: { padding: "2px 8px", fontSize: "11px" }, onClick: () => onDelete(compra.id) }, "\u2715")), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "12px", color: "var(--text-dim)", marginBottom: "12px" } }, ((_a = tarjetaPorId[compra.tarjetaId]) == null ? void 0 : _a.alias) || "\u2014", " \xB7 ", estatusLabel), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: "20px", marginBottom: "4px" } }, FinanceUtils.formatoMoneda(calc.saldoPendiente)), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "12px", color: "var(--text-dim)", marginBottom: "10px" } }, "pendiente \xB7 mensualidad ", FinanceUtils.formatoMoneda(calc.mensualidad)), /* @__PURE__ */ React.createElement(ProgressBar, { percent: calc.porcentajeAvance, color: colorBarra }), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--text-dim)", marginTop: "8px" } }, /* @__PURE__ */ React.createElement("span", null, calc.mesesTranscurridos, "/", compra.mesesContratados, " meses"), /* @__PURE__ */ React.createElement("span", null, "termina ", calc.fechaTermino.toLocaleDateString("es-MX", { month: "short", year: "numeric" }))));
  })), mostrarForm && /* @__PURE__ */ React.createElement(MSIForm, { tarjetas, onSave: guardar, onClose: () => setMostrarForm(false) }));
}
