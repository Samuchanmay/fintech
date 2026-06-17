
function MSIForm({ tarjetas, onSave, onClose }) {
  const [form, setForm] = useState({
    producto: "",
    tarjetaId: tarjetas[0]?.id || "",
    montoTotal: "",
    fechaCompra: new Date().toISOString().slice(0, 10),
    mesesContratados: "12",
  });

  function actualizar(campo, valor) { setForm((p) => ({ ...p, [campo]: valor })); }

  function guardar() {
    if (!form.producto.trim()) { alert("Describe el producto comprado."); return; }
    if (!form.montoTotal || parseFloat(form.montoTotal) <= 0) { alert("Ingresa un monto válido."); return; }
    onSave({
      ...form,
      montoTotal: parseFloat(form.montoTotal),
      mesesContratados: parseInt(form.mesesContratados),
    });
  }

  return (
    <Modal title="Nueva compra a MSI" onClose={onClose}>
      <div className="form-group">
        <label>Producto</label>
        <input value={form.producto} onChange={(e) => actualizar("producto", e.target.value)} placeholder="Ej. Laptop" />
      </div>
      <div className="form-group">
        <label>Tarjeta</label>
        <select value={form.tarjetaId} onChange={(e) => actualizar("tarjetaId", e.target.value)}>
          {tarjetas.map((t) => <option key={t.id} value={t.id}>{t.alias}</option>)}
        </select>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Monto total</label>
          <input type="number" value={form.montoTotal} onChange={(e) => actualizar("montoTotal", e.target.value)} placeholder="18000" />
        </div>
        <div className="form-group">
          <label>Meses contratados</label>
          <select value={form.mesesContratados} onChange={(e) => actualizar("mesesContratados", e.target.value)}>
            {[3, 6, 9, 12, 18, 24].map((m) => <option key={m} value={m}>{m} meses</option>)}
          </select>
        </div>
      </div>
      <div className="form-group">
        <label>Fecha de compra</label>
        <input type="date" value={form.fechaCompra} onChange={(e) => actualizar("fechaCompra", e.target.value)} />
      </div>
      <div style={{ display: "flex", gap: "8px", marginTop: "20px" }}>
        <button className="btn btn-primary" onClick={guardar} style={{ flex: 1 }}>Guardar</button>
        <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
      </div>
    </Modal>
  );
}

function MSIModule({ msi, tarjetas, onAdd, onDelete }) {
  const [mostrarForm, setMostrarForm] = useState(false);
  const tarjetaPorId = Object.fromEntries(tarjetas.map((t) => [t.id, t]));

  function guardar(datos) { onAdd(datos); setMostrarForm(false); }

  return (
    <div>
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 className="page-title">Meses sin intereses</h1>
          <p className="page-subtitle">Tus compras diferidas, con avance y fecha de término calculados solos.</p>
        </div>
        <button className="btn btn-primary" disabled={tarjetas.length === 0} onClick={() => setMostrarForm(true)}>
          + Agregar compra a MSI
        </button>
      </div>

      {tarjetas.length === 0 ? (
        <EmptyState title="Agrega una tarjeta primero" subtitle="Necesitas al menos una tarjeta para registrar compras a MSI." />
      ) : msi.length === 0 ? (
        <EmptyState title="Sin compras a MSI" subtitle="Agrega una compra diferida para darle seguimiento." actionLabel="+ Agregar compra a MSI" onAction={() => setMostrarForm(true)} />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
          {msi.map((compra) => {
            const calc = FinanceUtils.calcularMSI(compra);
            const estatusLabel = { liquidado: "Liquidado ✅", ultimo_mes: "Último mes 🟡", activo: "Activo" }[calc.estatus];
            const colorBarra = calc.estatus === "liquidado" ? "var(--signal)" : calc.estatus === "ultimo_mes" ? "var(--warn)" : "var(--signal-dim)";

            return (
              <div className="card" key={compra.id}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                  <strong>{compra.producto}</strong>
                  <button className="btn btn-danger" style={{ padding: "2px 8px", fontSize: "11px" }} onClick={() => onDelete(compra.id)}>✕</button>
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-dim)", marginBottom: "12px" }}>
                  {tarjetaPorId[compra.tarjetaId]?.alias || "—"} · {estatusLabel}
                </div>

                <div style={{ fontFamily: "var(--font-mono)", fontSize: "20px", marginBottom: "4px" }}>
                  {FinanceUtils.formatoMoneda(calc.saldoPendiente)}
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-dim)", marginBottom: "10px" }}>
                  pendiente · mensualidad {FinanceUtils.formatoMoneda(calc.mensualidad)}
                </div>
                <ProgressBar percent={calc.porcentajeAvance} color={colorBarra} />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--text-dim)", marginTop: "8px" }}>
                  <span>{calc.mesesTranscurridos}/{compra.mesesContratados} meses</span>
                  <span>termina {calc.fechaTermino.toLocaleDateString("es-MX", { month: "short", year: "numeric" })}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {mostrarForm && <MSIForm tarjetas={tarjetas} onSave={guardar} onClose={() => setMostrarForm(false)} />}
    </div>
  );
}
