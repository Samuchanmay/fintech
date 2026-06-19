function App() {
  const [vistaActiva, setVistaActiva] = React.useState("resumen");
  const [tarjetas, setTarjetas] = React.useState([]);
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [authError, setAuthError] = React.useState("");
  const [isSignUp, setIsSignUp] = React.useState(false);

  React.useEffect(() => {
    const unsub = onAuthChange((u) => {
      setUser(u);
      if (u) loadTarjetas(u.id);
    });
    getCurrentUser().then((u) => {
      setUser(u);
      if (u) loadTarjetas(u.id);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  async function loadTarjetas(userId) {
    try {
      const data = await getTarjetas(userId);
      setTarjetas(data);
    } catch { /* silent */ }
  }

  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [vistaActiva]);

  async function handleAuth(e) {
    e.preventDefault();
    setAuthError("");
    try {
      if (isSignUp) {
        await signUp(email, password);
        setAuthError("Revisa tu correo para confirmar la cuenta");
      } else {
        await login(email, password);
      }
    } catch (err) {
      setAuthError(err.message || "Error de autenticación");
    }
  }

  async function handleLogout() {
    await logout();
    setUser(null);
    setTarjetas([]);
  }

  const navItems = [
    { id: "resumen", label: "Resumen" },
    { id: "tarjetas", label: "Tarjetas" },
    { id: "estados", label: "Estado de Cuenta" },
  ];

  if (loading) {
    return React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "center", height: "100dvh" } },
      React.createElement("div", { className: "skeleton", style: { width: 200, height: 24 } })
    );
  }

  if (!user) {
    return React.createElement("div", { className: "app-container", style: { display: "flex", alignItems: "center", justifyContent: "center", minHeight: "80dvh" } },
      React.createElement("div", { style: { width: "100%", maxWidth: 400 } },
        React.createElement("div", { style: { textAlign: "center", marginBottom: 32 } },
          React.createElement("div", { style: { fontSize: "2rem", fontWeight: 800, marginBottom: 4, letterSpacing: "-0.03em" } }, "TDC Control"),
          React.createElement("p", { style: { color: "var(--color-text-secondary)", fontSize: "0.9375rem" } }, "Controla tus tarjetas de crédito")
        ),
        React.createElement("form", { onSubmit: handleAuth, style: { background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", padding: 24 } },
          React.createElement("div", { className: "form-group" },
            React.createElement("label", { className: "form-label" }, "Correo electrónico"),
            React.createElement("input", {
              className: "form-input",
              type: "email", required: true,
              placeholder: "tu@correo.com",
              value: email,
              onChange: (e) => setEmail(e.target.value)
            })
          ),
          React.createElement("div", { className: "form-group" },
            React.createElement("label", { className: "form-label" }, "Contraseña"),
            React.createElement("input", {
              className: "form-input",
              type: "password", required: true,
              placeholder: "••••••••",
              value: password,
              onChange: (e) => setPassword(e.target.value)
            })
          ),
          authError && React.createElement("div", {
            style: { fontSize: "0.8125rem", color: authError.includes("Revisa") ? "var(--color-success)" : "var(--color-danger)", marginBottom: 16, padding: "8px 12px", background: authError.includes("Revisa") ? "var(--color-success-light)" : "var(--color-danger-light)", borderRadius: "var(--radius-sm)" }
          }, authError),
          React.createElement("button", { className: "btn btn--primary btn--block", type: "submit" },
            isSignUp ? "Crear cuenta" : "Iniciar sesión"
          ),
          React.createElement("div", { style: { textAlign: "center", marginTop: 16, fontSize: "0.875rem", color: "var(--color-text-muted)" } },
            isSignUp ? "¿Ya tienes cuenta?" : "¿No tienes cuenta?",
            " ",
            React.createElement("button", {
              type: "button",
              style: { color: "var(--color-primary)", fontWeight: 600, background: "none", border: "none", cursor: "pointer", fontSize: "0.875rem" },
              onClick: () => { setIsSignUp(!isSignUp); setAuthError(""); }
            }, isSignUp ? "Inicia sesión" : "Regístrate")
          )
        )
      )
    );
  }

  return React.createElement(React.Fragment, null,
    React.createElement("header", { className: "app-header" },
      React.createElement("div", { className: "app-header__inner" },
        React.createElement("div", { className: "app-header__brand" },
          React.createElement("span", { className: "app-header__brand-icon" }, "T"),
          "TDC Control"
        ),
        React.createElement("nav", { className: "app-nav" },
          navItems.map((item) =>
            React.createElement("button", {
              key: item.id,
              className: "app-nav__btn" + (vistaActiva === item.id ? " app-nav__btn--active" : ""),
              onClick: () => setVistaActiva(item.id)
            }, item.label)
          ),
          React.createElement("button", {
            className: "app-nav__btn",
            onClick: handleLogout,
            style: { color: "var(--color-text-muted)" }
          }, "Salir")
        )
      )
    ),

    React.createElement("main", { key: vistaActiva },
      vistaActiva === "resumen" && React.createElement(ResumenView, { tarjetas, user }),
      vistaActiva === "tarjetas" && React.createElement(TarjetasModule, null),
      vistaActiva === "estados" && React.createElement(EstadoDeCuentaModule, null)
    )
  );
}

function ResumenView({ tarjetas, user }) {
  const totalLimite = tarjetas.reduce((s, t) => s + parseFloat(t.limite || 0), 0);
  const totalSaldo = tarjetas.reduce((s, t) => s + parseFloat(t.saldo || 0), 0);
  const disponible = totalLimite - totalSaldo;
  const pctGlobal = totalLimite > 0 ? (totalSaldo / totalLimite) * 100 : 0;

  return React.createElement("div", { className: "app-container" },
    React.createElement("div", { className: "resumen-grid", style: { animationDelay: "0.05s" } },
      React.createElement("div", { className: "resumen-card" },
        React.createElement("div", { className: "resumen-card__label" }, "Límite total"),
        React.createElement("div", { className: "resumen-card__value resumen-card__value--primary" }, darFormatoMoneda(totalLimite))
      ),
      React.createElement("div", { className: "resumen-card" },
        React.createElement("div", { className: "resumen-card__label" }, "Saldo total"),
        React.createElement("div", { className: "resumen-card__value resumen-card__value--danger" }, darFormatoMoneda(totalSaldo))
      ),
      React.createElement("div", { className: "resumen-card" },
        React.createElement("div", { className: "resumen-card__label" }, "Disponible total"),
        React.createElement("div", { className: "resumen-card__value resumen-card__value--success" }, darFormatoMoneda(disponible))
      )
    ),

    React.createElement("div", { style: { background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", padding: 20 } },
      React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 } },
        React.createElement("span", { style: { fontWeight: 600 } }, "Uso total de crédito"),
        React.createElement("span", { style: { fontWeight: 700, fontSize: "1.125rem" } }, pctGlobal.toFixed(1) + "%")
      ),
      React.createElement("div", { className: "tarjeta-card__bar", style: { marginBottom: 16 } },
        React.createElement("div", {
          className: "tarjeta-card__bar-fill tarjeta-card__bar-fill--" + (pctGlobal > 70 ? "high" : pctGlobal > 30 ? "mid" : "low"),
          style: { width: Math.min(pctGlobal, 100) + "%" }
        })
      ),
      React.createElement("p", { style: { fontSize: "0.8125rem", color: "var(--color-text-muted)" } },
        "Tienes " + tarjetas.length + " tarjeta" + (tarjetas.length !== 1 ? "s" : "") + " registrada" + (tarjetas.length !== 1 ? "s" : "")
      )
    ),

    tarjetas.length === 0 && React.createElement("div", { className: "empty-state", style: { marginTop: 24 } },
      React.createElement("div", { className: "empty-state__icon" }, "💳"),
      React.createElement("div", { className: "empty-state__title" }, "Bienvenido a TDC Control"),
      React.createElement("div", { className: "empty-state__desc" }, "Agrega tu primera tarjeta en la sección Tarjetas para empezar"),
      React.createElement("button", {
        className: "btn btn--primary",
        onClick: () => document.querySelector(".app-nav__btn:nth-child(2)")?.click()
      }, "Ir a Tarjetas")
    )
  );
}

window.App = App;
