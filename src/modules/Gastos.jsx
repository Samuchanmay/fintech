
const CATEGORIAS = ["Comida", "Transporte", "Hogar", "Servicios", "Salud", "Educación", "Entretenimiento", "Negocio", "Ropa", "Otros"];

function GastoForm({ tarjetas, onSave, onClose }) {
  const [form, setForm] = useState({
    fecha: new Date().toISOString().slice(0, 10),
    tarjetaId: tarjetas[0]?.id || "",
    categoria: "Otros",
    descripcion: "",
    monto: "",
  });

  function actualizar(campo, valor) { setForm((p) => ({ ...p, [campo]: valor })); }

  function guardar() {
    if (!form.tarjetaId) { alert("Selecciona una tarjeta."); return; }
    if (!form.monto || parseFloat(form.monto) <= 0) { alert("Ingresa un monto válido."); return; }
    onSave({ ...form, monto: parseFloat(form.monto) });
  }

  return (
    <Modal title="Nuevo gasto" onClose={onClose}>
      <div className="form-group">
        <label>Fecha</label>
        <input type="date" value={form.fecha} onChange={(e) => actualizar("fecha", e.target.value)} />
      </div>
      <div className="form-group">
        <label>Tarjeta</label>
        <select value={form.tarjetaId} onChange={(e) => actualizar("tarjetaId", e.target.value)}>
          {tarjetas.map((t) => <option key={t.id} value={t.id}>{t.alias}</option>)}
        </select>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Categoría</label>
          <select value={form.categoria} onChange={(e) => actualizar("categoria", e.target.value)}>
            {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Monto</label>
          <input type="number" value={form.monto} onChange={(e) => actualizar("monto", e.target.value)} placeholder="350" />
        </div>
      </div>
      <div className="form-group">
        <label>Descripción</label>
        <input value={form.descripcion} onChange={(e) => actualizar("descripcion", e.target.value)} placeholder="Ej. Supermercado" />
      </div>
      <div style={{ display: "flex", gap: "8px", marginTop: "20px" }}>
        <button className="btn btn-primary" onClick={guardar} style={{ flex: 1 }}>Guardar</button>
        <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
      </div>
    </Modal>
  );
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

  return (
    <div>
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 className="page-title">Gastos</h1>
          <p className="page-subtitle">Registra tus movimientos y mira en qué se está yendo tu dinero.</p>
        </div>
        <button className="btn btn-primary" disabled={tarjetas.length === 0} onClick={() => setMostrarForm(true)}>
          + Agregar gasto
        </button>
      </div>

      {tarjetas.length === 0 ? (
        <EmptyState title="Agrega una tarjeta primero" subtitle="Necesitas al menos una tarjeta para poder registrar gastos." />
      ) : gastos.length === 0 ? (
        <EmptyState title="Sin gastos registrados" subtitle="Agrega tu primer gasto para empezar a ver patrones." actionLabel="+ Agregar gasto" onAction={() => setMostrarForm(true)} />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: "20px" }}>
          <div className="card">
            <h3 style={{ marginTop: 0, fontSize: "15px" }}>Movimientos</h3>
            <table className="data-table">
              <thead>
                <tr><th>Fecha</th><th>Tarjeta</th><th>Categoría</th><th>Descripción</th><th>Monto</th><th></th></tr>
              </thead>
              <tbody>
                {gastosOrdenados.map((g) => (
                  <tr key={g.id}>
                    <td>{new Date(g.fecha).toLocaleDateString("es-MX", { day: "2-digit", month: "short" })}</td>
                    <td>{tarjetaPorId[g.tarjetaId]?.alias || "—"}</td>
                    <td>{g.categoria}</td>
                    <td>{g.descripcion || "—"}</td>
                    <td style={{ fontFamily: "var(--font-mono)" }}>{FinanceUtils.formatoMoneda(g.monto)}</td>
                    <td>
                      <button className="btn btn-danger" style={{ padding: "4px 8px", fontSize: "11px" }} onClick={() => onDelete(g.id)}>✕</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card">
            <h3 style={{ marginTop: 0, fontSize: "15px" }}>Por categoría</h3>
            {Object.entries(totalesPorCategoria)
              .sort((a, b) => b[1] - a[1])
              .map(([cat, total]) => (
                <div key={cat} style={{ marginBottom: "10px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "4px" }}>
                    <span>{cat}</span>
                    <span style={{ fontFamily: "var(--font-mono)" }}>{FinanceUtils.formatoMoneda(total)}</span>
                  </div>
                  <ProgressBar percent={total / maxCategoria} color="var(--signal)" />
                </div>
              ))}
          </div>
        </div>
      )}

      {mostrarForm && <GastoForm tarjetas={tarjetas} onSave={guardar} onClose={() => setMostrarForm(false)} />}
    </div>
  );
}
