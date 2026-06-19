
function PlanDeudasModule({ tarjetas, config, onUpdateConfig }) {
  const [metodo, setMetodo] = useState(config.metodoPlan);
  const [pagoExtra, setPagoExtra] = useState(config.pagoExtraMensual);

  function aplicarCambios() {
    onUpdateConfig({ metodoPlan: metodo, pagoExtraMensual: parseFloat(pagoExtra) || 0 });
  }

  if (tarjetas.length === 0) {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">Plan para salir de deudas</h1>
          <p className="page-subtitle">Elige tu método y mira el orden recomendado para liquidar tus tarjetas.</p>
        </div>
        <EmptyState title="Agrega tarjetas primero" subtitle="Necesitas al menos una tarjeta con saldo para generar un plan." />
      </div>
    );
  }

  const plan = FinanceUtils.calcularPlanDeudas(tarjetas, metodo, parseFloat(pagoExtra) || 0);
  const deudaTotal = plan.reduce((s, t) => s + t.saldo, 0);
  const pagoMensualTotal = plan.reduce((s, t) => s + t.pagoMensual, 0);
  const prioridad = plan.find((t) => t.prioridad === 1);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Plan para salir de deudas</h1>
        <p className="page-subtitle">Elige tu método y mira el orden recomendado para liquidar tus tarjetas.</p>
      </div>

      <div className="card" style={{ marginBottom: "20px" }}>
        <div className="form-row" style={{ alignItems: "flex-end" }}>
          <div className="form-group">
            <label>Método</label>
            <select value={metodo} onChange={(e) => setMetodo(e.target.value)}>
              <option value="nieve">Bola de nieve (saldo más chico primero)</option>
              <option value="avalancha">Avalancha (tasa más alta primero)</option>
            </select>
          </div>
          <div className="form-group">
            <label>Pago extra mensual disponible</label>
            <input type="number" value={pagoExtra} onChange={(e) => setPagoExtra(e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={aplicarCambios}>Aplicar</button>
        </div>
      </div>

      <div className="kpi-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
        <div className="kpi-card">
          <div className="kpi-label">Deuda total</div>
          <div className="kpi-value">{FinanceUtils.formatoMoneda(deudaTotal)}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Pago mensual comprometido</div>
          <div className="kpi-value">{FinanceUtils.formatoMoneda(pagoMensualTotal)}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Meses para liquidar tu prioridad</div>
          <div className="kpi-value" style={{ color: "var(--signal)" }}>
            {prioridad?.mesesEstimados != null ? prioridad.mesesEstimados : "—"}
          </div>
        </div>
      </div>

      <div className="card">
        <table className="data-table">
          <thead>
            <tr><th>Prioridad</th><th>Tarjeta</th><th>Saldo</th><th>Tasa</th><th>Pago recomendado</th><th>Meses estimados</th></tr>
          </thead>
          <tbody>
            {plan.map((t) => (
              <tr key={t.id}>
                <td>
                  {t.prioridad === 1 ? (
                    <span className="status-pill sano">★ Primero</span>
                  ) : (
                    `#${t.prioridad}`
                  )}
                </td>
                <td>{t.alias}</td>
                <td style={{ fontFamily: "var(--font-mono)" }}>{FinanceUtils.formatoMoneda(t.saldo)}</td>
                <td>{FinanceUtils.formatoPorcentaje(t.tasaAnual)}</td>
                <td style={{ fontFamily: "var(--font-mono)" }}>{FinanceUtils.formatoMoneda(t.pagoMensual)}</td>
                <td>
                  {t.mesesEstimados == null ? (
                    <span style={{ color: "var(--danger)" }}>Pago insuficiente</span>
                  ) : (
                    `${t.mesesEstimados} mes(es)`
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p style={{ fontSize: "12px", color: "var(--text-dim)", marginTop: "16px" }}>
        El cálculo es una aproximación con interés compuesto mensual sobre el saldo actual, asumiendo pagos fijos y sin nuevas compras.
      </p>
    </div>
  );
}
