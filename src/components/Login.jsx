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
      setMensaje({ tipo: "error", texto: "Completa correo y contraseña." });
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
          texto: "Cuenta creada. Revisa tu correo para confirmar tu cuenta antes de iniciar sesión.",
        });
      }
    } catch (err) {
      setMensaje({ tipo: "error", texto: traducirError(err.message) });
    } finally {
      setCargando(false);
    }
  }

  function traducirError(msg) {
    if (msg.indexOf("Invalid login credentials") !== -1) return "Correo o contraseña incorrectos.";
    if (msg.indexOf("already registered") !== -1) return "Ese correo ya tiene una cuenta. Intenta iniciar sesión.";
    if (msg.indexOf("Password should be at least") !== -1) return "La contraseña debe tener al menos 6 caracteres.";
    return msg;
  }

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "20px" }}>
      <div className="card" style={{ width: "100%", maxWidth: "380px" }}>
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "24px", fontWeight: 600 }}>TDC Control</div>
          <div style={{ fontSize: "12px", color: "var(--text-dim)" }}>Sal de tus deudas, no de tus casillas</div>
        </div>

        <form onSubmit={manejarSubmit}>
          <div className="form-group">
            <label>Correo</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@correo.com" autoComplete="email" />
          </div>
          <div className="form-group">
            <label>Contraseña</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" autoComplete={modo === "login" ? "current-password" : "new-password"} />
          </div>

          {mensaje && (
            <div style={{
              fontSize: "13px",
              padding: "8px 10px",
              borderRadius: "6px",
              marginBottom: "12px",
              background: mensaje.tipo === "error" ? "rgba(255,107,91,0.12)" : "rgba(61,220,151,0.12)",
              color: mensaje.tipo === "error" ? "var(--danger)" : "var(--signal)",
            }}>
              {mensaje.texto}
            </div>
          )}

          <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={cargando}>
            {cargando ? "Un momento…" : modo === "login" ? "Iniciar sesión" : "Crear cuenta"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "16px", fontSize: "13px", color: "var(--text-dim)" }}>
          {modo === "login" ? (
            <React.Fragment>¿No tienes cuenta?{" "}
              <a href="#" onClick={(e) => { e.preventDefault(); setModo("registro"); setMensaje(null); }}>Crear una</a>
            </React.Fragment>
          ) : (
            <React.Fragment>¿Ya tienes cuenta?{" "}
              <a href="#" onClick={(e) => { e.preventDefault(); setModo("login"); setMensaje(null); }}>Iniciar sesión</a>
            </React.Fragment>
          )}
        </div>

        <p style={{ fontSize: "11px", color: "var(--text-dim)", textAlign: "center", marginTop: "20px" }}>
          Tus datos se guardan en una base de datos privada (Supabase). Solo tú, con tu cuenta, puedes verlos.
        </p>
      </div>
    </div>
  );
}
