function DashboardModule({ tarjetas, config }) {
  const totales = FinanceUtils.totalesGenerales(tarjetas);
  const score = FinanceUtils.scoreEstabilidad(tarjetas, config);
  const tasaProm = FinanceUtils.tasaPromedioPonderada(tarjetas);
  const simulacionActual = FinanceUtils.simularEscenario(totales.deudaTotal, tasaProm, totales.pagoMinimoTotal + config.pagoExtraMensual);

  const scoreColor = score >= 75 ? "var(--signal)" : score >= 50 ? "var(--warn)" : "var(--danger)";

  let estatusGeneral = "sano";
  if (totales.utilizacionTotal >= config.umbralRiesgo) estatusGeneral = "riesgo";
  else if (totales.utilizacionTotal >= config.umbralSano) estatusGeneral = "atencion";

  const tarjetasEnRiesgo = tarjetas.filter(t => FinanceUtils.porcentajeUtilizacion(t) >= config.umbralRiesgo);

  const proximosPagos = tarjetas
    .map(t => ({ ...t, diasRestantes: FinanceUtils.diaSiguienteOcurrencia(t.diaPago) }))
    .sort((a, b) => a.diasRestantes - b.diasRestantes)
    .slice(0, 5);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Tu panorama financiero</h1>
        <p className="page-subtitle">Actualizado al {new Date().toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" })}</p>
      </div>

      {tarjetas.length === 0 ? (
        <EmptyState
          title="Todavía no hay nada que mostrar"
          subtitle="Agrega tu primera tarjeta en la sección Tarjetas para empezar a ver tu panorama."
        />
      ) : (
        <>
          <div className="freedom-counter">
            <div>
              <div className="freedom-counter-label">Si pagas {FinanceUtils.formatoMoneda(totales.pagoMinimoTotal + config.pagoExtraMensual)}/mes, quedas libre de deuda en</div>
              {simulacionActual.insuficiente ? (
                <div style={{ color: "var(--danger)", fontFamily: "var(--font-display)", fontSize: "28px", fontWeight: 600 }}>
                  Nunca — tu pago no cubre ni el interés
                </div>
              ) : (
                <div>
                  <span className="freedom-counter-value">{simulacionActual.meses}</span>
                  <span className="freedom-counter-unit">meses</span>
                </div>
              )}
            </div>
            <div className="freedom-counter-date">
              {!simulacionActual.insuficiente && (
                <React.Fragment>
                  Fecha estimada:<br />
                  <strong style={{ color: "var(--text)" }}>
                    {new Date(Date.now() + simulacionActual.meses * 30 * 24 * 60 * 60 * 1000)
                      .toLocaleDateString("es-MX", { month: "long", year: "numeric" })}
                  </strong>
                </React.Fragment>
              )}
            </div>
          </div>

          <div className="kpi-grid">
            <div className="kpi-card">
              <div className="kpi-label">Deuda total</div>
              <div className="kpi-value">{FinanceUtils.formatoMoneda(totales.deudaTotal)}</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-label">Crédito disponible</div>
              <div className="kpi-value">{FinanceUtils.formatoMoneda(totales.disponibleTotal)}</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-label">Utilización total</div>
              <div className="kpi-value" style={{ color: estatusGeneral === "riesgo" ? "var(--danger)" : estatusGeneral === "atencion" ? "var(--warn)" : "var(--signal)" }}>
                {FinanceUtils.formatoPorcentaje(totales.utilizacionTotal)}
              </div>
            </div>
            <div className="kpi-card">
              <div className="kpi-label">Score de estabilidad</div>
              <div className="kpi-value" style={{ color: scoreColor }}>{score}/100</div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div className="card">
              <h3 style={{ marginTop: 0, fontSize: "15px" }}>🚦 Semáforo financiero</h3>
              <div style={{ marginBottom: "12px" }}>
                <StatusPill estatus={estatusGeneral} />
              </div>
              {tarjetasEnRiesgo.length > 0 ? (
                <p style={{ fontSize: "13px", color: "var(--text-dim)" }}>
                  {tarjetasEnRiesgo.length} tarjeta(s) con utilización alta: {tarjetasEnRiesgo.map(t => t.alias).join(", ")}.
                </p>
              ) : (
                <p style={{ fontSize: "13px", color: "var(--text-dim)" }}>Ninguna tarjeta está en nivel de riesgo. Buen trabajo.</p>
              )}
            </div>

            <div className="card">
              <h3 style={{ marginTop: 0, fontSize: "15px" }}>📅 Próximos pagos</h3>
              {proximosPagos.map(t => (
                <div key={t.id} style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", padding: "6px 0", borderBottom: "1px solid var(--border)" }}>
                  <span>{t.alias}</span>
                  <span style={{ color: t.diasRestantes <= 5 ? "var(--warn)" : "var(--text-dim)" }}>
                    en {t.diasRestantes} día{t.diasRestantes !== 1 ? "s" : ""}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
