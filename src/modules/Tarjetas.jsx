function TarjetaForm({ tarjeta, onSave, onClose }) {
  const [form, setForm] = useState(() => {
    if (tarjeta) {
      // Al editar: convertimos saldo (lo que se guarda) a disponible (lo que se captura)
      const disponible = tarjeta.limite > 0 ? tarjeta.limite - tarjeta.saldo : 0;
      return {
        ...tarjeta,
        disponible: String(disponible),
        limite: String(tarjeta.limite),
        tasaAnual: String((tarjeta.tasaAnual * 100).toFixed(2)),
        diaCorte: String(tarjeta.diaCorte),
        diaPago: String(tarjeta.diaPago),
        pagoMinimo: String(tarjeta.pagoMinimo),
      };
    }
    return {
      alias: "",
      banco: BANCOS_MEXICO[0],
      bancoOtro: "",
      color: "#3DDC97",
      limite: "",
      disponible: "",
      tasaAnual: "",
      diaCorte: "",
      diaPago: "",
      pagoMinimo: "",
    };
  });

  function actualizar(campo, valor) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  function guardar() {
    if (!form.alias.trim()) { alert("Ponle un alias a la tarjeta."); return; }
    const limite = parseFloat(form.limite) || 0;
    const disponible = parseFloat(form.disponible) || 0;
    const saldo = Math.max(0, limite - disponible);
    const tasaAnual = (parseFloat(form.tasaAnual) || 0) / 100;
    const diaCorte = parseInt(form.diaCorte) || 1;
    const diaPago = parseInt(form.diaPago) || 1;
    const pagoMinimo = parseFloat(form.pagoMinimo) || 0;
    const banco = form.banco === "Otro" ? (form.bancoOtro || "Otro") : form.banco;

    onSave({
      ...form,
      banco,
      limite,
      saldo,
      tasaAnual,
      diaCorte,
      diaPago,
      pagoMinimo,
    });
  }

  const saldoCalculado = Math.max(0, (parseFloat(form.limite) || 0) - (parseFloat(form.disponible) || 0));

  return (
    <Modal title={tarjeta ? "Editar tarjeta" : "Nueva tarjeta"} onClose={onClose}>
      <div className="form-group">
        <label>Alias</label>
        <input value={form.alias} onChange={(e) => actualizar("alias", e.target.value)} placeholder="Ej. BBVA Azul" />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Banco</label>
          <select value={form.banco} onChange={(e) => actualizar("banco", e.target.value)}>
            {BANCOS_MEXICO.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Color</label>
          <input type="color" value={form.color} onChange={(e) => actualizar("color", e.target.value)} style={{ height: "38px" }} />
        </div>
      </div>
      {form.banco === "Otro" && (
        <div className="form-group">
          <label>¿Cuál banco?</label>
          <input value={form.bancoOtro} onChange={(e) => actualizar("bancoOtro", e.target.value)} placeholder="Nombre del banco" />
        </div>
      )}
      <div className="form-row">
        <div className="form-group">
          <label>Límite de crédito</label>
          <input type="number" value={form.limite} onChange={(e) => actualizar("limite", e.target.value)} placeholder="20000" />
        </div>
        <div className="form-group">
          <label>Crédito disponible</label>
          <input type="number" value={form.disponible} onChange={(e) => actualizar("disponible", e.target.value)} placeholder="5000" />
        </div>
      </div>
      {form.limite && form.disponible !== "" && (
        <p style={{ fontSize: "12px", color: "var(--text-dim)", marginTop: "-8px", marginBottom: "14px" }}>
          Eso significa que tienes usado: <strong style={{ color: "var(--text)" }}>{FinanceUtils.formatoMoneda(saldoCalculado)}</strong>
        </p>
      )}
      <div className="form-row">
        <div className="form-group">
          <label>Tasa anual (%)</label>
          <input type="number" value={form.tasaAnual} onChange={(e) => actualizar("tasaAnual", e.target.value)} placeholder="58.3" />
        </div>
        <div className="form-group">
          <label>Pago mínimo</label>
          <input type="number" value={form.pagoMinimo} onChange={(e) => actualizar("pagoMinimo", e.target.value)} placeholder="750" />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Día de corte (1-31)</label>
          <input type="number" min="1" max="31" value={form.diaCorte} onChange={(e) => actualizar("diaCorte", e.target.value)} placeholder="10" />
        </div>
        <div className="form-group">
          <label>Día límite de pago (1-31)</label>
          <input type="number" min="1" max="31" value={form.diaPago} onChange={(e) => actualizar("diaPago", e.target.value)} placeholder="30" />
        </div>
      </div>
      <div style={{ display: "flex", gap: "8px", marginTop: "20px" }}>
        <button className="btn btn-primary" onClick={guardar} style={{ flex: 1 }}>Guardar</button>
        <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
      </div>
    </Modal>
  );
}

function TarjetasModule({ tarjetas, config, onAdd, onUpdate, onDelete, formAbierto, onAbrirForm, onCerrarForm }) {
  function abrirNuevo() { onAbrirForm(null); }
  function abrirEditar(t) { onAbrirForm(t); }

  function guardar(datos) {
    if (formAbierto.tarjeta) onUpdate({ ...formAbierto.tarjeta, ...datos });
    else onAdd(datos);
    onCerrarForm();
  }

  function eliminar(t) {
    if (confirm(`¿Eliminar la tarjeta "${t.alias}"? Esto no borra sus gastos asociados.`)) {
      onDelete(t.id);
    }
  }

  return (
    <div>
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 className="page-title">Tarjetas</h1>
          <p className="page-subtitle">Tus tarjetas de crédito, con utilización e interés proyectado calculados automáticamente.</p>
        </div>
        <button className="btn btn-primary" onClick={abrirNuevo}>+ Agregar tarjeta</button>
      </div>

      {tarjetas.length === 0 ? (
        <EmptyState
          title="Aún no tienes tarjetas"
          subtitle="Agrega tu primera tarjeta para empezar a ver tu panorama financiero."
          actionLabel="+ Agregar tarjeta"
          onAction={abrirNuevo}
        />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
          {tarjetas.map((t) => {
            const util = FinanceUtils.porcentajeUtilizacion(t);
            const estatus = FinanceUtils.estatusUtilizacion(t, config);
            const interes = FinanceUtils.interesMensualProyectado(t);
            const colorBarra = estatus === "riesgo" ? "var(--danger)" : estatus === "atencion" ? "var(--warn)" : "var(--signal)";
            const disponible = FinanceUtils.creditoDisponible(t);

            return (
              <div className="card" key={t.id}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "2px" }}>
                      <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: t.color }}></span>
                      <strong>{t.alias}</strong>
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--text-dim)" }}>{t.banco}</div>
                  </div>
                  <StatusPill estatus={estatus} />
                </div>

                <div style={{ fontFamily: "var(--font-mono)", fontSize: "22px", marginBottom: "6px" }}>
                  {FinanceUtils.formatoMoneda(t.saldo)}
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-dim)", marginBottom: "10px" }}>
                  usado de {FinanceUtils.formatoMoneda(t.limite)} · disponible {FinanceUtils.formatoMoneda(disponible)} ({FinanceUtils.formatoPorcentaje(util)})
                </div>
                <ProgressBar percent={util} color={colorBarra} />

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: "14px", fontSize: "12px" }}>
                  <div>
                    <div style={{ color: "var(--text-dim)" }}>Corte</div>
                    <div>Día {t.diaCorte}</div>
                  </div>
                  <div>
                    <div style={{ color: "var(--text-dim)" }}>Pago límite</div>
                    <div>Día {t.diaPago}</div>
                  </div>
                  <div>
                    <div style={{ color: "var(--text-dim)" }}>Pago mínimo</div>
                    <div>{FinanceUtils.formatoMoneda(t.pagoMinimo)}</div>
                  </div>
                  <div>
                    <div style={{ color: "var(--text-dim)" }}>Interés/mes</div>
                    <div style={{ color: "var(--danger)" }}>{FinanceUtils.formatoMoneda(interes)}</div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
                  <button className="btn btn-secondary" style={{ flex: 1, fontSize: "12px", padding: "6px 10px" }} onClick={() => abrirEditar(t)}>Editar</button>
                  <button className="btn btn-danger" style={{ fontSize: "12px", padding: "6px 10px" }} onClick={() => eliminar(t)}>Eliminar</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {formAbierto && (
        <TarjetaForm tarjeta={formAbierto.tarjeta} onSave={guardar} onClose={onCerrarForm} />
      )}
    </div>
  );
}
