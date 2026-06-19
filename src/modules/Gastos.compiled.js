const CATEGORIAS = ["Comida", "Transporte", "Hogar", "Servicios", "Salud", "Educaci\xF3n", "Entretenimiento", "Negocio", "Ropa", "Otros"];
function GastoForm({ tarjetas, onSave, onClose }) {
  var _a;
  const [form, setForm] = useState({
    fecha: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
    tarjetaId: ((_a = tarjetas[0]) == null ? void 0 : _a.id) || "",
    categoria: "Otros",
    descripcion: "",
    monto: ""
  });
  function actualizar(campo, valor) {
    setForm((p) => ({ ...p, [campo]: valor }));
  }
  function guardar() {
    if (!form.tarjetaId) {
      alert("Selecciona una tarjeta.");
      return;
    }
    if (!form.monto || parseFloat(form.monto) <= 0) {
      alert("Ingresa un monto v\xE1lido.");
      return;
    }
    onSave({ ...form, monto: parseFloat(form.monto) });
  }
  return /* @__PURE__ */ React.createElement(Modal, { title: "Nuevo gasto", onClose }, /* @__PURE__ */ React.createElement("div", { className: "form-group" }, /* @__PURE__ */ React.createElement("label", null, "Fecha"), /* @__PURE__ */ React.createElement("input", { type: "date", value: form.fecha, onChange: (e) => actualizar("fecha", e.target.value) })), /* @__PURE__ */ React.createElement("div", { className: "form-group" }, /* @__PURE__ */ React.createElement("label", null, "Tarjeta"), /* @__PURE__ */ React.createElement("select", { value: form.tarjetaId, onChange: (e) => actualizar("tarjetaId", e.target.value) }, tarjetas.map((t) => /* @__PURE__ */ React.createElement("option", { key: t.id, value: t.id }, t.alias)))), /* @__PURE__ */ React.createElement("div", { className: "form-row" }, /* @__PURE__ */ React.createElement("div", { className: "form-group" }, /* @__PURE__ */ React.createElement("label", null, "Categor\xEDa"), /* @__PURE__ */ React.createElement("select", { value: form.categoria, onChange: (e) => actualizar("categoria", e.target.value) }, CATEGORIAS.map((c) => /* @__PURE__ */ React.createElement("option", { key: c, value: c }, c)))), /* @__PURE__ */ React.createElement("div", { className: "form-group" }, /* @__PURE__ */ React.createElement("label", null, "Monto"), /* @__PURE__ */ React.createElement("input", { type: "number", value: form.monto, onChange: (e) => actualizar("monto", e.target.value), placeholder: "350" }))), /* @__PURE__ */ React.createElement("div", { className: "form-group" }, /* @__PURE__ */ React.createElement("label", null, "Descripci\xF3n"), /* @__PURE__ */ React.createElement("input", { value: form.descripcion, onChange: (e) => actualizar("descripcion", e.target.value), placeholder: "Ej. Supermercado" })), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: "8px", marginTop: "20px" } }, /* @__PURE__ */ React.createElement("button", { className: "btn btn-primary", onClick: guardar, style: { flex: 1 } }, "Guardar"), /* @__PURE__ */ React.createElement("button", { className: "btn btn-secondary", onClick: onClose }, "Cancelar")));
}
function GastosModule({ gastos, tarjetas, onAdd, onDelete }) {
  const [mostrarForm, setMostrarForm] = useState(false);
  const tarjetaPorId = Object.fromEntries(tarjetas.map((t) => [t.id, t]));
  const gastosOrdenados = [...gastos].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  const totalesPorCategoria = {};
  gastos.forEach((g) => {
    totalesPorCategoria[g.categoria] = (totalesPorCategoria[g.categoria] || 0) + g.monto;
  });
  const maxCategoria = Math.max(1, ...Object.values(totalesPorCategoria));
  function guardar(datos) {
    onAdd(datos);
    setMostrarForm(false);
  }
  return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "page-header", style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start" } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h1", { className: "page-title" }, "Gastos"), /* @__PURE__ */ React.createElement("p", { className: "page-subtitle" }, "Registra tus movimientos y mira en qu\xE9 se est\xE1 yendo tu dinero.")), /* @__PURE__ */ React.createElement("button", { className: "btn btn-primary", disabled: tarjetas.length === 0, onClick: () => setMostrarForm(true) }, "+ Agregar gasto")), tarjetas.length === 0 ? /* @__PURE__ */ React.createElement(EmptyState, { title: "Agrega una tarjeta primero", subtitle: "Necesitas al menos una tarjeta para poder registrar gastos." }) : gastos.length === 0 ? /* @__PURE__ */ React.createElement(EmptyState, { title: "Sin gastos registrados", subtitle: "Agrega tu primer gasto para empezar a ver patrones.", actionLabel: "+ Agregar gasto", onAction: () => setMostrarForm(true) }) : /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: "20px" } }, /* @__PURE__ */ React.createElement("div", { className: "card" }, /* @__PURE__ */ React.createElement("h3", { style: { marginTop: 0, fontSize: "15px" } }, "Movimientos"), /* @__PURE__ */ React.createElement("table", { className: "data-table" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", null, "Fecha"), /* @__PURE__ */ React.createElement("th", null, "Tarjeta"), /* @__PURE__ */ React.createElement("th", null, "Categor\xEDa"), /* @__PURE__ */ React.createElement("th", null, "Descripci\xF3n"), /* @__PURE__ */ React.createElement("th", null, "Monto"), /* @__PURE__ */ React.createElement("th", null))), /* @__PURE__ */ React.createElement("tbody", null, gastosOrdenados.map((g) => {
    var _a;
    return /* @__PURE__ */ React.createElement("tr", { key: g.id }, /* @__PURE__ */ React.createElement("td", null, new Date(g.fecha).toLocaleDateString("es-MX", { day: "2-digit", month: "short" })), /* @__PURE__ */ React.createElement("td", null, ((_a = tarjetaPorId[g.tarjetaId]) == null ? void 0 : _a.alias) || "\u2014"), /* @__PURE__ */ React.createElement("td", null, g.categoria), /* @__PURE__ */ React.createElement("td", null, g.descripcion || "\u2014"), /* @__PURE__ */ React.createElement("td", { style: { fontFamily: "var(--font-mono)" } }, FinanceUtils.formatoMoneda(g.monto)), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("button", { className: "btn btn-danger", style: { padding: "4px 8px", fontSize: "11px" }, onClick: () => onDelete(g.id) }, "\u2715")));
  })))), /* @__PURE__ */ React.createElement("div", { className: "card" }, /* @__PURE__ */ React.createElement("h3", { style: { marginTop: 0, fontSize: "15px" } }, "Por categor\xEDa"), Object.entries(totalesPorCategoria).sort((a, b) => b[1] - a[1]).map(([cat, total]) => /* @__PURE__ */ React.createElement("div", { key: cat, style: { marginBottom: "10px" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "4px" } }, /* @__PURE__ */ React.createElement("span", null, cat), /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-mono)" } }, FinanceUtils.formatoMoneda(total))), /* @__PURE__ */ React.createElement(ProgressBar, { percent: total / maxCategoria, color: "var(--signal)" }))))), mostrarForm && /* @__PURE__ */ React.createElement(GastoForm, { tarjetas, onSave: guardar, onClose: () => setMostrarForm(false) }));
}
