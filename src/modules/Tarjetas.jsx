const DRAFT_KEY = "tdc_tarjeta_draft";

function TarjetasModule() {
  const [tarjetas, setTarjetas] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [showModal, setShowModal] = React.useState(false);
  const [editing, setEditing] = React.useState(null);
  const [user, setUser] = React.useState(null);
  const [hasDraft, setHasDraft] = React.useState(false);
  const [toast, setToast] = React.useState(null);

  const formDefaults = {
    nombre: "", banco: "", limite: "", saldoDisponible: "",
    fechaCorte: "", fechaPago: "", tasaInteres: "", notas: "",
  };

  const [form, setForm] = React.useState({ ...formDefaults });
  const [formErrors, setFormErrors] = React.useState({});
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    const checkDraft = () => {
      const draft = localStorage.getItem(DRAFT_KEY);
      if (draft) {
        try {
          const parsed = JSON.parse(draft);
          setHasDraft(true);
        } catch { setHasDraft(false); }
      }
    };
    checkDraft();
  }, []);

  React.useEffect(() => {
    async function load() {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      if (currentUser) {
        try {
          const data = await getTarjetas(currentUser.id);
          setTarjetas(data);
        } catch (e) {
          setToast({ type: "error", message: "Error al cargar tarjetas" });
        }
      }
      setLoading(false);
    }
    load();
  }, []);

  function openAdd() {
    const draft = localStorage.getItem(DRAFT_KEY);
    if (draft) {
      try {
        setForm({ ...formDefaults, ...JSON.parse(draft) });
        setHasDraft(false);
        localStorage.removeItem(DRAFT_KEY);
      } catch { setForm({ ...formDefaults }); }
    } else {
      setForm({ ...formDefaults });
    }
    setEditing(null);
    setFormErrors({});
    setShowModal(true);
  }

  function openEdit(tarjeta) {
    setForm({
      nombre: tarjeta.nombre || "",
      banco: tarjeta.banco || "",
      limite: tarjeta.limite?.toString() || "",
      saldoDisponible: tarjeta.saldo_disponible?.toString() || "",
      fechaCorte: tarjeta.fecha_corte?.toString() || "",
      fechaPago: tarjeta.fecha_pago?.toString() || "",
      tasaInteres: tarjeta.tasa_interes?.toString() || "",
      notas: tarjeta.notas || "",
    });
    setEditing(tarjeta);
    setFormErrors({});
    setShowModal(true);
  }

  function handleFormChange(field, value) {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(next));
      return next;
    });
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: null }));
    }
  }

  function closeModal() {
    setShowModal(false);
    setEditing(null);
    setForm({ ...formDefaults });
    setFormErrors({});
    localStorage.removeItem(DRAFT_KEY);
    setHasDraft(false);
  }

  function restoreDraft() {
    const draft = localStorage.getItem(DRAFT_KEY);
    if (draft) {
      try {
        setForm({ ...formDefaults, ...JSON.parse(draft) });
        setHasDraft(false);
        setEditing(null);
        setFormErrors({});
        setShowModal(true);
      } catch { localStorage.removeItem(DRAFT_KEY); setHasDraft(false); }
    }
  }

  function discardDraft() {
    localStorage.removeItem(DRAFT_KEY);
    setHasDraft(false);
  }

  function validate() {
    const errors = {};
    if (!form.nombre.trim()) errors.nombre = "El nombre es obligatorio";
    if (!form.banco) errors.banco = "Selecciona un banco";
    if (!form.limite || parseFloat(form.limite) <= 0) errors.limite = "Ingresa un límite válido";
    if (form.saldoDisponible === "" || parseFloat(form.saldoDisponible) < 0) errors.saldoDisponible = "Ingresa un saldo disponible válido";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSave() {
    if (!validate() || !user) return;
    setSaving(true);
    try {
      const limite = parseFloat(form.limite);
      const saldoDisponible = parseFloat(form.saldoDisponible);
      const payload = {
        nombre: form.nombre.trim(),
        banco: form.banco,
        limite,
        saldo_disponible: saldoDisponible,
        fecha_corte: form.fechaCorte ? parseInt(form.fechaCorte) : null,
        fecha_pago: form.fechaPago ? parseInt(form.fechaPago) : null,
        tasa_interes: form.tasaInteres ? parseFloat(form.tasaInteres) : null,
        notas: form.notas.trim() || null,
        user_id: user.id,
      };

      if (editing) {
        const updated = await actualizarTarjeta(editing.id, payload);
        setTarjetas((prev) => prev.map((t) => t.id === editing.id ? updated : t));
        setToast({ type: "success", message: "Tarjeta actualizada" });
      } else {
        const created = await crearTarjeta(payload);
        setTarjetas((prev) => [created, ...prev]);
        setToast({ type: "success", message: "Tarjeta agregada" });
      }
      closeModal();
    } catch (e) {
      setToast({ type: "error", message: "Error al guardar" });
    }
    setSaving(false);
  }

  async function handleDelete(tarjeta) {
    if (!confirm(`¿Eliminar ${tarjeta.nombre}?`)) return;
    try {
      await eliminarTarjeta(tarjeta.id);
      setTarjetas((prev) => prev.filter((t) => t.id !== tarjeta.id));
      setToast({ type: "success", message: "Tarjeta eliminada" });
    } catch {
      setToast({ type: "error", message: "Error al eliminar" });
    }
  }

  function getBarClass(pct) {
    if (pct <= 30) return "low";
    if (pct <= 70) return "mid";
    return "high";
  }

  React.useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  if (loading) {
    return React.createElement("div", { className: "app-container" },
      React.createElement("div", { className: "skeleton", style: { height: 120, marginBottom: 16 } }),
      React.createElement("div", { className: "skeleton", style: { height: 120, marginBottom: 16 } }),
      React.createElement("div", { className: "skeleton", style: { height: 120 } })
    );
  }

  const totalLimite = tarjetas.reduce((s, t) => s + parseFloat(t.limite || 0), 0);
  const totalSaldo = tarjetas.reduce((s, t) => s + parseFloat(t.saldo || 0), 0);
  const pctGlobal = totalLimite > 0 ? (totalSaldo / totalLimite) * 100 : 0;

  return React.createElement("div", { className: "app-container" },
    hasDraft && React.createElement("div", { className: "draft-banner" },
      React.createElement("span", { className: "draft-banner__text" }, "Tienes un borrador guardado"),
      React.createElement("div", { className: "draft-banner__actions" },
        React.createElement("button", { className: "btn btn--sm btn--primary", onClick: restoreDraft }, "Restaurar"),
        React.createElement("button", { className: "btn btn--sm btn--ghost", onClick: discardDraft }, "Descartar")
      )
    ),

    React.createElement("div", { className: "resumen-grid", style: { animationDelay: "0.05s" } },
      React.createElement("div", { className: "resumen-card" },
        React.createElement("div", { className: "resumen-card__label" }, "Límite total"),
        React.createElement("div", { className: "resumen-card__value resumen-card__value--primary" },
          darFormatoMoneda(totalLimite)
        )
      ),
      React.createElement("div", { className: "resumen-card" },
        React.createElement("div", { className: "resumen-card__label" }, "Saldo total"),
        React.createElement("div", { className: "resumen-card__value resumen-card__value--danger" },
          darFormatoMoneda(totalSaldo)
        )
      ),
      React.createElement("div", { className: "resumen-card" },
        React.createElement("div", { className: "resumen-card__label" }, "Uso total"),
        React.createElement("div", { className: "resumen-card__value", style: { color: pctGlobal > 70 ? "var(--color-danger)" : pctGlobal > 30 ? "var(--color-warning)" : "var(--color-success)" } },
          pctGlobal.toFixed(1) + "%"
        ),
        React.createElement("div", { className: "tarjeta-card__bar", style: { marginTop: 8 } },
          React.createElement("div", {
            className: "tarjeta-card__bar-fill tarjeta-card__bar-fill--" + getBarClass(pctGlobal),
            style: { width: Math.min(pctGlobal, 100) + "%" }
          })
        )
      )
    ),

    React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 } },
      React.createElement("h2", { style: { fontSize: "1.25rem", fontWeight: 700 } }, "Tus Tarjetas"),
      React.createElement("button", { className: "btn btn--primary", onClick: openAdd }, "+ Agregar")
    ),

    tarjetas.length === 0
      ? React.createElement("div", { className: "empty-state" },
          React.createElement("div", { className: "empty-state__icon" }, "💳"),
          React.createElement("div", { className: "empty-state__title" }, "No tienes tarjetas registradas"),
          React.createElement("div", { className: "empty-state__desc" }, "Agrega tu primera tarjeta para empezar a controlar tus finanzas"),
          React.createElement("button", { className: "btn btn--primary", onClick: openAdd }, "Agregar tarjeta")
        )
      : React.createElement("div", { className: "tarjeta-grid" },
          tarjetas.map((t, i) => {
            const saldo = parseFloat(t.saldo || 0);
            const limite = parseFloat(t.limite || 0);
            const pct = limite > 0 ? (saldo / limite) * 100 : 0;
            return React.createElement("div", {
              key: t.id, className: "tarjeta-card",
              style: { animationDelay: (i * 0.06) + "s" }
            },
              React.createElement("div", { className: "tarjeta-card__header" },
                React.createElement("div", null,
                  React.createElement("div", { className: "tarjeta-card__banco" }, t.banco),
                  React.createElement("div", { className: "tarjeta-card__nombre" }, t.nombre)
                ),
                React.createElement("div", { className: "tarjeta-card__saldo" },
                  React.createElement("div", { className: "tarjeta-card__saldo-valor" }, darFormatoMoneda(saldo)),
                  React.createElement("div", { className: "tarjeta-card__saldo-label" }, "de " + darFormatoMoneda(limite))
                )
              ),
              React.createElement("div", { className: "tarjeta-card__bar" },
                React.createElement("div", {
                  className: "tarjeta-card__bar-fill tarjeta-card__bar-fill--" + getBarClass(pct),
                  style: { width: Math.min(pct, 100) + "%" }
                })
              ),
              React.createElement("div", { className: "tarjeta-card__meta" },
                t.fecha_corte && React.createElement("span", null, "Corte: " + t.fecha_corte),
                t.fecha_pago && React.createElement("span", null, "Pago: " + t.fecha_pago)
              ),
              React.createElement("div", { className: "tarjeta-card__actions" },
                React.createElement("button", { className: "btn btn--sm btn--secondary", onClick: () => openEdit(t) }, "Editar"),
                React.createElement("button", { className: "btn btn--sm btn--ghost", onClick: () => handleDelete(t) }, "Eliminar")
              )
            );
          })
        ),

    showModal && React.createElement("div", {
      className: "modal-overlay",
      onClick: (e) => e.target.className === "modal-overlay" && closeModal()
    },
      React.createElement("div", { className: "modal", onClick: (e) => e.stopPropagation() },
        React.createElement("div", { className: "modal__header" },
          React.createElement("div", { className: "modal__title" }, editing ? "Editar tarjeta" : "Nueva tarjeta"),
          React.createElement("button", { className: "modal__close", onClick: closeModal }, "×")
        ),
        React.createElement("div", { className: "modal__body" },
          React.createElement("div", { className: "form-group" },
            React.createElement("label", { className: "form-label form-label--required" }, "Nombre"),
            React.createElement("input", {
              className: "form-input" + (formErrors.nombre ? " form-input--error" : ""),
              placeholder: "Ej: Oro, Platinum, Clásica",
              value: form.nombre,
              onChange: (e) => handleFormChange("nombre", e.target.value)
            }),
            formErrors.nombre && React.createElement("div", { className: "form-error" }, formErrors.nombre)
          ),
          React.createElement("div", { className: "form-group" },
            React.createElement("label", { className: "form-label form-label--required" }, "Banco"),
            React.createElement("select", {
              className: "form-input" + (formErrors.banco ? " form-input--error" : ""),
              value: form.banco,
              onChange: (e) => {
                const val = e.target.value;
                handleFormChange("banco", val);
                if (val === "automatico") {
                  handleFormChange("banco", "Automático");
                }
              }
            },
              React.createElement("option", { value: "" }, "Selecciona un banco…"),
              BANCOS_MEXICO.map((b) =>
                React.createElement("option", { key: b.id, value: b.nombre }, b.nombre)
              )
            ),
            formErrors.banco && React.createElement("div", { className: "form-error" }, formErrors.banco)
          ),
          React.createElement("div", { className: "form-row" },
            React.createElement("div", { className: "form-group" },
              React.createElement("label", { className: "form-label form-label--required" }, "Límite de crédito"),
              React.createElement("input", {
                className: "form-input" + (formErrors.limite ? " form-input--error" : ""),
                type: "number", step: "0.01", min: "0",
                placeholder: "0.00",
                value: form.limite,
                onChange: (e) => handleFormChange("limite", e.target.value)
              }),
              formErrors.limite && React.createElement("div", { className: "form-error" }, formErrors.limite)
            ),
            React.createElement("div", { className: "form-group" },
              React.createElement("label", { className: "form-label form-label--required" }, "Saldo disponible"),
              React.createElement("input", {
                className: "form-input" + (formErrors.saldoDisponible ? " form-input--error" : ""),
                type: "number", step: "0.01", min: "0",
                placeholder: "0.00",
                value: form.saldoDisponible,
                onChange: (e) => handleFormChange("saldoDisponible", e.target.value)
              }),
              formErrors.saldoDisponible && React.createElement("div", { className: "form-error" }, formErrors.saldoDisponible)
            )
          ),
          form.limite && form.saldoDisponible !== "" && React.createElement("div", {
            style: { fontSize: "0.8125rem", color: "var(--color-text-muted)", marginBottom: 16, padding: "8px 12px", background: "var(--color-primary-light)", borderRadius: "var(--radius-sm)" }
          },
            "Saldo calculado: " + darFormatoMoneda(calcularSaldo(form.limite, form.saldoDisponible))
          ),
          React.createElement("div", { className: "form-row" },
            React.createElement("div", { className: "form-group" },
              React.createElement("label", { className: "form-label" }, "Día de corte"),
              React.createElement("input", {
                className: "form-input",
                type: "number", min: "1", max: "31",
                placeholder: "Ej: 15",
                value: form.fechaCorte,
                onChange: (e) => handleFormChange("fechaCorte", e.target.value)
              })
            ),
            React.createElement("div", { className: "form-group" },
              React.createElement("label", { className: "form-label" }, "Día de pago"),
              React.createElement("input", {
                className: "form-input",
                type: "number", min: "1", max: "31",
                placeholder: "Ej: 5",
                value: form.fechaPago,
                onChange: (e) => handleFormChange("fechaPago", e.target.value)
              })
            )
          ),
          React.createElement("div", { className: "form-group" },
            React.createElement("label", { className: "form-label" }, "Tasa de interés (%)"),
            React.createElement("input", {
              className: "form-input",
              type: "number", step: "0.01", min: "0",
              placeholder: "Ej: 42.5",
              value: form.tasaInteres,
              onChange: (e) => handleFormChange("tasaInteres", e.target.value)
            })
          ),
          React.createElement("div", { className: "form-group" },
            React.createElement("label", { className: "form-label" }, "Notas"),
            React.createElement("textarea", {
              className: "form-input",
              rows: "3",
              placeholder: "Notas adicionales…",
              value: form.notas,
              onChange: (e) => handleFormChange("notas", e.target.value)
            })
          )
        ),
        React.createElement("div", { className: "modal__footer" },
          React.createElement("button", { className: "btn btn--secondary", onClick: closeModal }, "Cancelar"),
          React.createElement("button", {
            className: "btn btn--primary",
            onClick: handleSave,
            disabled: saving
          }, saving ? "Guardando…" : (editing ? "Actualizar" : "Guardar"))
        )
      )
    ),

    toast && React.createElement("div", { className: "toast toast--" + toast.type }, toast.message)
  );
}

window.TarjetasModule = TarjetasModule;
