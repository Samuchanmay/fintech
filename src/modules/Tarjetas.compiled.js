function TarjetaForm({ tarjeta, onSave, onClose }) {
  const [form, setForm] = useState(
    tarjeta || {
      alias: "",
      banco: "",
      color: "#3DDC97",
      limite: "",
      saldo: "",
      tasaAnual: "",
      diaCorte: "",
      diaPago: "",
      pagoMinimo: ""
    }
  );
  function actualizar(campo, valor) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }
  function guardar() {
    if (!form.alias.trim()) {
      alert("Ponle un alias a la tarjeta.");
      return;
    }
    const limite = parseFloat(form.limite) || 0;
    const saldo = parseFloat(form.saldo) || 0;
    const tasaAnual = (parseFloat(form.tasaAnual) || 0) / 100;
    const diaCorte = parseInt(form.diaCorte) || 1;
    const diaPago = parseInt(form.diaPago) || 1;
    const pagoMinimo = parseFloat(form.pagoMinimo) || 0;
    onSave({
      ...form,
      limite,
      saldo,
      tasaAnual,
      diaCorte,
      diaPago,
      pagoMinimo
    });
  }
  return /* @__PURE__ */ React.createElement(Modal, { title: tarjeta ? "Editar tarjeta" : "Nueva tarjeta", onClose }, /* @__PURE__ */ React.createElement("div", { className: "form-group" }, /* @__PURE__ */ React.createElement("label", null, "Alias"), /* @__PURE__ */ React.createElement("input", { value: form.alias, onChange: (e) => actualizar("alias", e.target.value), placeholder: "Ej. BBVA Azul" })), /* @__PURE__ */ React.createElement("div", { className: "form-row" }, /* @__PURE__ */ React.createElement("div", { className: "form-group" }, /* @__PURE__ */ React.createElement("label", null, "Banco"), /* @__PURE__ */ React.createElement("input", { value: form.banco, onChange: (e) => actualizar("banco", e.target.value), placeholder: "Ej. BBVA" })), /* @__PURE__ */ React.createElement("div", { className: "form-group" }, /* @__PURE__ */ React.createElement("label", null, "Color"), /* @__PURE__ */ React.createElement("input", { type: "color", value: form.color, onChange: (e) => actualizar("color", e.target.value), style: { height: "38px" } }))), /* @__PURE__ */ React.createElement("div", { className: "form-row" }, /* @__PURE__ */ React.createElement("div", { className: "form-group" }, /* @__PURE__ */ React.createElement("label", null, "L\xEDmite de cr\xE9dito"), /* @__PURE__ */ React.createElement("input", { type: "number", value: form.limite, onChange: (e) => actualizar("limite", e.target.value), placeholder: "20000" })), /* @__PURE__ */ React.createElement("div", { className: "form-group" }, /* @__PURE__ */ React.createElement("label", null, "Saldo actual"), /* @__PURE__ */ React.createElement("input", { type: "number", value: form.saldo, onChange: (e) => actualizar("saldo", e.target.value), placeholder: "15000" }))), /* @__PURE__ */ React.createElement("div", { className: "form-row" }, /* @__PURE__ */ React.createElement("div", { className: "form-group" }, /* @__PURE__ */ React.createElement("label", null, "Tasa anual (%)"), /* @__PURE__ */ React.createElement("input", { type: "number", value: form.tasaAnual, onChange: (e) => actualizar("tasaAnual", e.target.value), placeholder: "58.3" })), /* @__PURE__ */ React.createElement("div", { className: "form-group" }, /* @__PURE__ */ React.createElement("label", null, "Pago m\xEDnimo"), /* @__PURE__ */ React.createElement("input", { type: "number", value: form.pagoMinimo, onChange: (e) => actualizar("pagoMinimo", e.target.value), placeholder: "750" }))), /* @__PURE__ */ React.createElement("div", { className: "form-row" }, /* @__PURE__ */ React.createElement("div", { className: "form-group" }, /* @__PURE__ */ React.createElement("label", null, "D\xEDa de corte (1-31)"), /* @__PURE__ */ React.createElement("input", { type: "number", min: "1", max: "31", value: form.diaCorte, onChange: (e) => actualizar("diaCorte", e.target.value), placeholder: "10" })), /* @__PURE__ */ React.createElement("div", { className: "form-group" }, /* @__PURE__ */ React.createElement("label", null, "D\xEDa l\xEDmite de pago (1-31)"), /* @__PURE__ */ React.createElement("input", { type: "number", min: "1", max: "31", value: form.diaPago, onChange: (e) => actualizar("diaPago", e.target.value), placeholder: "30" }))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: "8px", marginTop: "20px" } }, /* @__PURE__ */ React.createElement("button", { className: "btn btn-primary", onClick: guardar, style: { flex: 1 } }, "Guardar"), /* @__PURE__ */ React.createElement("button", { className: "btn btn-secondary", onClick: onClose }, "Cancelar")));
}
function TarjetasModule({ tarjetas, config, onAdd, onUpdate, onDelete }) {
  const [editando, setEditando] = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  function abrirNuevo() {
    setEditando(null);
    setMostrarForm(true);
  }
  function abrirEditar(t) {
    setEditando(t);
    setMostrarForm(true);
  }
  function guardar(datos) {
    if (editando) onUpdate({ ...editando, ...datos });
    else onAdd(datos);
    setMostrarForm(false);
  }
  function eliminar(t) {
    if (confirm(`\xBFEliminar la tarjeta "${t.alias}"? Esto no borra sus gastos asociados.`)) {
      onDelete(t.id);
    }
  }
  return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "page-header", style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start" } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h1", { className: "page-title" }, "Tarjetas"), /* @__PURE__ */ React.createElement("p", { className: "page-subtitle" }, "Tus tarjetas de cr\xE9dito, con utilizaci\xF3n e inter\xE9s proyectado calculados autom\xE1ticamente.")), /* @__PURE__ */ React.createElement("button", { className: "btn btn-primary", onClick: abrirNuevo }, "+ Agregar tarjeta")), tarjetas.length === 0 ? /* @__PURE__ */ React.createElement(
    EmptyState,
    {
      title: "A\xFAn no tienes tarjetas",
      subtitle: "Agrega tu primera tarjeta para empezar a ver tu panorama financiero.",
      actionLabel: "+ Agregar tarjeta",
      onAction: abrirNuevo
    }
  ) : /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" } }, tarjetas.map((t) => {
    const util = FinanceUtils.porcentajeUtilizacion(t);
    const estatus = FinanceUtils.estatusUtilizacion(t, config);
    const interes = FinanceUtils.interesMensualProyectado(t);
    const colorBarra = estatus === "riesgo" ? "var(--danger)" : estatus === "atencion" ? "var(--warn)" : "var(--signal)";
    return /* @__PURE__ */ React.createElement("div", { className: "card", key: t.id }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: "8px", marginBottom: "2px" } }, /* @__PURE__ */ React.createElement("span", { style: { width: "10px", height: "10px", borderRadius: "50%", background: t.color } }), /* @__PURE__ */ React.createElement("strong", null, t.alias)), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "12px", color: "var(--text-dim)" } }, t.banco)), /* @__PURE__ */ React.createElement(StatusPill, { estatus })), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: "22px", marginBottom: "6px" } }, FinanceUtils.formatoMoneda(t.saldo)), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "12px", color: "var(--text-dim)", marginBottom: "10px" } }, "de ", FinanceUtils.formatoMoneda(t.limite), " (", FinanceUtils.formatoPorcentaje(util), " usado)"), /* @__PURE__ */ React.createElement(ProgressBar, { percent: util, color: colorBarra }), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: "14px", fontSize: "12px" } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { color: "var(--text-dim)" } }, "Corte"), /* @__PURE__ */ React.createElement("div", null, "D\xEDa ", t.diaCorte)), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { color: "var(--text-dim)" } }, "Pago l\xEDmite"), /* @__PURE__ */ React.createElement("div", null, "D\xEDa ", t.diaPago)), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { color: "var(--text-dim)" } }, "Pago m\xEDnimo"), /* @__PURE__ */ React.createElement("div", null, FinanceUtils.formatoMoneda(t.pagoMinimo))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { color: "var(--text-dim)" } }, "Inter\xE9s/mes"), /* @__PURE__ */ React.createElement("div", { style: { color: "var(--danger)" } }, FinanceUtils.formatoMoneda(interes)))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: "8px", marginTop: "16px" } }, /* @__PURE__ */ React.createElement("button", { className: "btn btn-secondary", style: { flex: 1, fontSize: "12px", padding: "6px 10px" }, onClick: () => abrirEditar(t) }, "Editar"), /* @__PURE__ */ React.createElement("button", { className: "btn btn-danger", style: { fontSize: "12px", padding: "6px 10px" }, onClick: () => eliminar(t) }, "Eliminar")));
  })), mostrarForm && /* @__PURE__ */ React.createElement(TarjetaForm, { tarjeta: editando, onSave: guardar, onClose: () => setMostrarForm(false) }));
}
