const CATEGORIAS_IMPORT = ["Comida", "Transporte", "Hogar", "Servicios", "Salud", "Educación", "Entretenimiento", "Negocio", "Ropa", "Otros"];

function ImportarPDFModal({ tarjetas, onConfirmar, onClose }) {
  const [paso, setPaso] = useState("subir");
  const [tarjetaId, setTarjetaId] = useState(tarjetas[0]?.id || "");
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
    if (!archivo) { alert("Selecciona un archivo PDF primero."); return; }
    if (!tarjetaId) { alert("Selecciona a qué tarjeta pertenece este estado de cuenta."); return; }

    setPaso("procesando");
    setError(null);
    try {
      const r = await window.PDFParser.procesarPDFEstadoCuenta(archivo);
      if (!r.huboDatos) {
        setError("No se detectó información reconocible en este PDF. Puede ser un formato distinto al de Banamex, o un PDF escaneado. Puedes seguir usando la app y capturar los datos a mano.");
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

  return (
    <Modal title="📄 Importar estado de cuenta" onClose={onClose}>
      {paso === "subir" && (
        <div>
          <div className="form-group">
            <label>¿A cuál tarjeta pertenece?</label>
            <select value={tarjetaId} onChange={(e) => setTarjetaId(e.target.value)}>
              {tarjetas.map((t) => <option key={t.id} value={t.id}>{t.alias}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Archivo PDF</label>
            <input type="file" accept="application/pdf" onChange={manejarArchivo} />
          </div>
          <p style={{ fontSize: "12px", color: "var(--text-dim)" }}>
            Funciona mejor con estados de cuenta de Banamex/Citibanamex en PDF de texto (no escaneado).
            Con otros bancos puede detectar poco o nada — siempre vas a poder revisar y corregir antes de guardar.
          </p>
          <div style={{ display: "flex", gap: "8px", marginTop: "20px" }}>
            <button className="btn btn-primary" onClick={procesar} style={{ flex: 1 }}>Analizar PDF</button>
            <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          </div>
        </div>
      )}

      {paso === "procesando" && (
        <div style={{ textAlign: "center", padding: "30px 0" }}>
          <p style={{ color: "var(--text-dim)" }}>Leyendo tu estado de cuenta…</p>
        </div>
      )}

      {paso === "error" && (
        <div>
          <p style={{ color: "var(--danger)", fontSize: "13px" }}>{error}</p>
          <button className="btn btn-secondary" onClick={() => setPaso("subir")} style={{ marginTop: "12px" }}>Volver a intentar</button>
        </div>
      )}

      {paso === "revision" && resultado && (
        <div>
          <div style={{ background: "var(--surface-raised)", borderRadius: "8px", padding: "10px", marginBottom: "14px", fontSize: "12px" }}>
            {resultado.resumen.saldoTotal != null && <div><b>Saldo total:</b> {FinanceUtils.formatoMoneda(resultado.resumen.saldoTotal)}</div>}
            {resultado.resumen.limiteCredito != null && <div><b>Límite de crédito:</b> {FinanceUtils.formatoMoneda(resultado.resumen.limiteCredito)}</div>}
            {resultado.resumen.creditoDisponible != null && <div><b>Crédito disponible:</b> {FinanceUtils.formatoMoneda(resultado.resumen.creditoDisponible)}</div>}
            {resultado.resumen.pagoMinimo != null && <div><b>Pago mínimo:</b> {FinanceUtils.formatoMoneda(resultado.resumen.pagoMinimo)}</div>}
            {resultado.resumen.pagoNoInteres != null && <div><b>Pago para no generar interés:</b> {FinanceUtils.formatoMoneda(resultado.resumen.pagoNoInteres)}</div>}
            {resultado.resumen.tasaInteresAnual != null && <div><b>Tasa anual:</b> {(resultado.resumen.tasaInteresAnual * 100).toFixed(2)}%</div>}
            {resultado.resumen.fechaCorte && <div><b>Fecha de corte:</b> {resultado.resumen.fechaCorte}</div>}
            {resultado.resumen.fechaLimitePago && <div><b>Fecha límite de pago:</b> {resultado.resumen.fechaLimitePago}</div>}
          </div>

          {resultado.msi.length > 0 && (
            <div style={{ marginBottom: "14px" }}>
              <label>Compras a MSI detectadas ({resultado.msi.length})</label>
              <div style={{ maxHeight: "150px", overflowY: "auto", border: "1px solid var(--border)", borderRadius: "6px" }}>
                <table className="data-table" style={{ fontSize: "11px" }}>
                  <tbody>
                    {resultado.msi.map((m, idx) => (
                      <tr key={idx}>
                        <td><input type="checkbox" checked={m.incluir} onChange={() => toggleIncluirMSI(idx)} /></td>
                        <td>{m.descripcion}</td>
                        <td>{FinanceUtils.formatoMoneda(m.saldoPendiente)}</td>
                        <td>{m.numPagoActual}/{m.numPagoTotal}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {resultado.gastos.length > 0 && (
            <div style={{ marginBottom: "14px" }}>
              <label>Gastos detectados ({resultado.gastos.length})</label>
              <div style={{ maxHeight: "200px", overflowY: "auto", border: "1px solid var(--border)", borderRadius: "6px" }}>
                <table className="data-table" style={{ fontSize: "11px" }}>
                  <tbody>
                    {resultado.gastos.map((g, idx) => (
                      <tr key={idx}>
                        <td><input type="checkbox" checked={g.incluir} onChange={() => toggleIncluirGasto(idx)} /></td>
                        <td>{g.descripcion}</td>
                        <td>{FinanceUtils.formatoMoneda(g.monto)}</td>
                        <td>
                          <select value={g.categoriaSugerida} onChange={(e) => actualizarCategoriaGasto(idx, e.target.value)} style={{ fontSize: "11px", padding: "2px" }}>
                            {CATEGORIAS_IMPORT.map((c) => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {resultado.pagos.length > 0 && (
            <p style={{ fontSize: "11px", color: "var(--text-dim)" }}>
              Se detectaron {resultado.pagos.length} pago(s)/abono(s) — no se guardan como gasto.
            </p>
          )}

          <p style={{ fontSize: "11px", color: "var(--text-dim)", marginTop: "10px" }}>
            Esto va a actualizar el saldo, fechas y tasa de la tarjeta seleccionada, y agregar los gastos y MSI marcados arriba.
          </p>

          <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
            <button className="btn btn-primary" onClick={confirmar} disabled={guardando} style={{ flex: 1 }}>
              {guardando ? "Guardando…" : "Confirmar y guardar"}
            </button>
            <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          </div>
        </div>
      )}
    </Modal>
  );
}
