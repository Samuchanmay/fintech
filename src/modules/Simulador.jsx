
function SimuladorModule({ tarjetas }) {
  const totales = FinanceUtils.totalesGenerales(tarjetas);
  const tasaProm = FinanceUtils.tasaPromedioPonderada(tarjetas);

  const [pagos, setPagos] = useState({ a: 5000, b: 8000, c: 10000 });

  function actualizar(escenario, valor) {
    setPagos((p) => ({ ...p, [escenario]: parseFloat(valor) || 0 }));
  }

  if (tarjetas.length === 0) {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">Simulador de escenarios</h1>
          <p className="page-subtitle">Compara distintos niveles de pago mensual y su impacto.</p>
        </div>
        <EmptyState title="Agrega tarjetas primero" subtitle="Necesitas al menos una tarjeta con saldo para simular escenarios." />
      </div>
    );
  }

  const escenarios = [
    { key: "a", label: "Conservador" },
    { key: "b", label: "Moderado" },
    { key: "c", label: "Agresivo" },
  ].map((e) => ({
    ...e,
    pago: pagos[e.key],
    resultado: FinanceUtils.simularEscenario(totales.deudaTotal, tasaProm, pagos[e.key]),
  }));

  const baseInteres = escenarios[0].resultado.interesTotal;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Simulador de escenarios</h1>
        <p className="page-subtitle">
          Deuda total: <strong>{FinanceUtils.formatoMoneda(totales.deudaTotal)}</strong> · Tasa promedio ponderada: <strong>{FinanceUtils.formatoPorcentaje(tasaProm)}</strong>
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
        {escenarios.map((e) => (
          <div className="card" key={e.key}>
            <div className="kpi-label">Escenario {e.label}</div>
            <div className="form-group" style={{ marginTop: "10px" }}>
              <label>Pago mensual</label>
              <input type="number" value={e.pago} onChange={(ev) => actualizar(e.key, ev.target.value)} />
            </div>

            {e.resultado.insuficiente ? (
              <p style={{ color: "var(--danger)", fontSize: "13px" }}>Este pago no cubre ni el interés generado.</p>
            ) : (
              <React.Fragment>
                <div style={{ marginTop: "14px" }}>
                  <div className="kpi-label">Tiempo para liquidar</div>
                  <div className="kpi-value" style={{ fontSize: "22px" }}>{e.resultado.meses} meses</div>
                </div>
                <div style={{ marginTop: "10px" }}>
                  <div className="kpi-label">Interés total a pagar</div>
                  <div className="kpi-value" style={{ fontSize: "18px", color: "var(--warn)" }}>
                    {FinanceUtils.formatoMoneda(e.resultado.interesTotal)}
                  </div>
                </div>
                {e.key !== "a" && baseInteres != null && (
                  <div style={{ marginTop: "10px", fontSize: "12px", color: "var(--signal)" }}>
                    Ahorras {FinanceUtils.formatoMoneda(baseInteres - e.resultado.interesTotal)} vs. Conservador
                  </div>
                )}
              </React.Fragment>
            )}
          </div>
        ))}
      </div>

      <p style={{ fontSize: "12px", color: "var(--text-dim)", marginTop: "20px" }}>
        El modelo asume pagos mensuales fijos, sin nuevas compras, con interés compuesto mensual sobre el saldo restante.
        Es una aproximación útil para comparar escenarios entre sí, no un cálculo exacto del banco.
      </p>
    </div>
  );
}
