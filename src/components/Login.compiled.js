function PantallaLogin({ onSesionIniciada }) {
  const [modo, setModo] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  async function manejarSubmit(e) {
    e.preventDefault();
    setMensaje(null);
    if (!email || !password) {
      setMensaje({ tipo: "error", texto: "Completa correo y contrase\xF1a." });
      return;
    }
    setCargando(true);
    try {
      if (modo === "login") {
        await SupabaseStore.iniciarSesion(email, password);
      } else {
        await SupabaseStore.registrarse(email, password);
        setMensaje({
          tipo: "success",
          texto: "Cuenta creada. Revisa tu correo para confirmar tu cuenta antes de iniciar sesi\xF3n."
        });
      }
    } catch (err) {
      setMensaje({ tipo: "error", texto: traducirError(err.message) });
    } finally {
      setCargando(false);
    }
  }
  function traducirError(msg) {
    if (msg.indexOf("Invalid login credentials") !== -1) return "Correo o contrase\xF1a incorrectos.";
    if (msg.indexOf("already registered") !== -1) return "Ese correo ya tiene una cuenta. Intenta iniciar sesi\xF3n.";
    if (msg.indexOf("Password should be at least") !== -1) return "La contrase\xF1a debe tener al menos 6 caracteres.";
    return msg;
  }
  return /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "20px" } }, /* @__PURE__ */ React.createElement("div", { className: "card", style: { width: "100%", maxWidth: "380px" } }, /* @__PURE__ */ React.createElement("div", { style: { textAlign: "center", marginBottom: "24px" } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-display)", fontSize: "24px", fontWeight: 600 } }, "TDC Control"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "12px", color: "var(--text-dim)" } }, "Sal de tus deudas, no de tus casillas")), /* @__PURE__ */ React.createElement("form", { onSubmit: manejarSubmit }, /* @__PURE__ */ React.createElement("div", { className: "form-group" }, /* @__PURE__ */ React.createElement("label", null, "Correo"), /* @__PURE__ */ React.createElement("input", { type: "email", value: email, onChange: (e) => setEmail(e.target.value), placeholder: "tu@correo.com", autoComplete: "email" })), /* @__PURE__ */ React.createElement("div", { className: "form-group" }, /* @__PURE__ */ React.createElement("label", null, "Contrase\xF1a"), /* @__PURE__ */ React.createElement("input", { type: "password", value: password, onChange: (e) => setPassword(e.target.value), placeholder: "M\xEDnimo 6 caracteres", autoComplete: modo === "login" ? "current-password" : "new-password" })), mensaje && /* @__PURE__ */ React.createElement("div", { style: {
    fontSize: "13px",
    padding: "8px 10px",
    borderRadius: "6px",
    marginBottom: "12px",
    background: mensaje.tipo === "error" ? "rgba(255,107,91,0.12)" : "rgba(61,220,151,0.12)",
    color: mensaje.tipo === "error" ? "var(--danger)" : "var(--signal)"
  } }, mensaje.texto), /* @__PURE__ */ React.createElement("button", { type: "submit", className: "btn btn-primary", style: { width: "100%" }, disabled: cargando }, cargando ? "Un momento\u2026" : modo === "login" ? "Iniciar sesi\xF3n" : "Crear cuenta")), /* @__PURE__ */ React.createElement("div", { style: { textAlign: "center", marginTop: "16px", fontSize: "13px", color: "var(--text-dim)" } }, modo === "login" ? /* @__PURE__ */ React.createElement(React.Fragment, null, "\xBFNo tienes cuenta?", " ", /* @__PURE__ */ React.createElement("a", { href: "#", onClick: (e) => {
    e.preventDefault();
    setModo("registro");
    setMensaje(null);
  } }, "Crear una")) : /* @__PURE__ */ React.createElement(React.Fragment, null, "\xBFYa tienes cuenta?", " ", /* @__PURE__ */ React.createElement("a", { href: "#", onClick: (e) => {
    e.preventDefault();
    setModo("login");
    setMensaje(null);
  } }, "Iniciar sesi\xF3n"))), /* @__PURE__ */ React.createElement("p", { style: { fontSize: "11px", color: "var(--text-dim)", textAlign: "center", marginTop: "20px" } }, "Tus datos se guardan en una base de datos privada (Supabase). Solo t\xFA, con tu cuenta, puedes verlos.")));
}
