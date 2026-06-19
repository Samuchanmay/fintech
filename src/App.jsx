const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: "📊" },
  { id: "tarjetas", label: "Tarjetas", icon: "💳" },
  { id: "gastos", label: "Gastos", icon: "🧾" },
  { id: "msi", label: "Meses sin intereses", icon: "📦" },
  { id: "plan", label: "Plan de deudas", icon: "🎯" },
  { id: "simulador", label: "Simulador", icon: "🧮" },
];

function App() {
  const [sesion, setSesion] = useState(undefined); // undefined = aún no se sabe; null = sin sesión; objeto = con sesión
  const [datos, setDatos] = useState(null);
  const [cargandoDatos, setCargandoDatos] = useState(false);
  const [errorCarga, setErrorCarga] = useState(null);
  const [vistaActiva, setVistaActiva] = useState("dashboard");
  const [guardando, setGuardando] = useState(false);

  // Al montar: revisar si ya hay sesión, y suscribirse a cambios (login/logout).
  useEffect(() => {
    SupabaseStore.obtenerSesionActual()
      .then((s) => setSesion(s))
      .catch(() => setSesion(null));

    const subscription = SupabaseStore.suscribirseACambiosDeSesion((s) => setSesion(s));
    return () => subscription.unsubscribe();
  }, []);

  // Cuando hay sesión, cargar los datos del usuario desde Supabase.
  useEffect(() => {
    if (!sesion) {
      setDatos(null);
      return;
    }
    setCargandoDatos(true);
    setErrorCarga(null);
    SupabaseStore.cargarDatosSupabase(sesion.user.id)
      .then((d) => setDatos(d))
      .catch((err) => setErrorCarga(err.message))
      .finally(() => setCargandoDatos(false));
  }, [sesion]);

  async function agregarTarjeta(t) {
    setGuardando(true);
    try {
      const nueva = await SupabaseStore.crearTarjetaSupabase(t, sesion.user.id);
      setDatos((d) => ({ ...d, tarjetas: [...d.tarjetas, nueva] }));
    } catch (err) {
      alert("No se pudo guardar la tarjeta: " + err.message);
    } finally {
      setGuardando(false);
    }
  }

  async function actualizarTarjeta(t) {
    setGuardando(true);
    try {
      const actualizada = await SupabaseStore.actualizarTarjetaSupabase(t, sesion.user.id);
      setDatos((d) => ({ ...d, tarjetas: d.tarjetas.map((x) => (x.id === t.id ? actualizada : x)) }));
    } catch (err) {
      alert("No se pudo actualizar la tarjeta: " + err.message);
    } finally {
      setGuardando(false);
    }
  }

  async function eliminarTarjeta(id) {
    setGuardando(true);
    try {
      await SupabaseStore.eliminarTarjetaSupabase(id);
      setDatos((d) => ({ ...d, tarjetas: d.tarjetas.filter((x) => x.id !== id) }));
    } catch (err) {
      alert("No se pudo eliminar la tarjeta: " + err.message);
    } finally {
      setGuardando(false);
    }
  }

  async function agregarGasto(g) {
    setGuardando(true);
    try {
      const nuevo = await SupabaseStore.crearGastoSupabase(g, sesion.user.id);
      setDatos((d) => ({ ...d, gastos: [...d.gastos, nuevo] }));
    } catch (err) {
      alert("No se pudo guardar el gasto: " + err.message);
    } finally {
      setGuardando(false);
    }
  }

  async function eliminarGasto(id) {
    setGuardando(true);
    try {
      await SupabaseStore.eliminarGastoSupabase(id);
      setDatos((d) => ({ ...d, gastos: d.gastos.filter((x) => x.id !== id) }));
    } catch (err) {
      alert("No se pudo eliminar el gasto: " + err.message);
    } finally {
      setGuardando(false);
    }
  }

  async function agregarMSI(m) {
    setGuardando(true);
    try {
      const nueva = await SupabaseStore.crearMSISupabase(m, sesion.user.id);
      setDatos((d) => ({ ...d, msi: [...d.msi, nueva] }));
    } catch (err) {
      alert("No se pudo guardar la compra a MSI: " + err.message);
    } finally {
      setGuardando(false);
    }
  }

  async function eliminarMSI(id) {
    setGuardando(true);
    try {
      await SupabaseStore.eliminarMSISupabase(id);
      setDatos((d) => ({ ...d, msi: d.msi.filter((x) => x.id !== id) }));
    } catch (err) {
      alert("No se pudo eliminar la compra a MSI: " + err.message);
    } finally {
      setGuardando(false);
    }
  }

  function actualizarConfig(cambios) {
    setDatos((d) => {
      const nuevaConfig = { ...d.config, ...cambios };
      SupabaseStore.guardarConfigLocal(nuevaConfig);
      return { ...d, config: nuevaConfig };
    });
  }

  async function manejarCerrarSesion() {
    await SupabaseStore.cerrarSesion();
  }

  // ---------- Pantallas de carga / login ----------

  if (sesion === undefined) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", color: "var(--text-dim)" }}>
        Cargando…
      </div>
    );
  }

  if (sesion === null) {
    return <PantallaLogin />;
  }

  if (cargandoDatos || !datos) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", color: "var(--text-dim)" }}>
        Cargando tus datos…
      </div>
    );
  }

  if (errorCarga) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "20px" }}>
        <div className="card" style={{ maxWidth: "420px" }}>
          <h3 style={{ color: "var(--danger)", marginTop: 0 }}>No se pudieron cargar tus datos</h3>
          <p style={{ fontSize: "13px", color: "var(--text-dim)" }}>{errorCarga}</p>
          <button className="btn btn-secondary" onClick={() => window.location.reload()}>Reintentar</button>
        </div>
      </div>
    );
  }

  // ---------- App principal ----------

  let vista;
  switch (vistaActiva) {
    case "dashboard":
      vista = <DashboardModule tarjetas={datos.tarjetas} config={datos.config} />;
      break;
    case "tarjetas":
      vista = <TarjetasModule tarjetas={datos.tarjetas} config={datos.config} onAdd={agregarTarjeta} onUpdate={actualizarTarjeta} onDelete={eliminarTarjeta} />;
      break;
    case "gastos":
      vista = <GastosModule gastos={datos.gastos} tarjetas={datos.tarjetas} onAdd={agregarGasto} onDelete={eliminarGasto} />;
      break;
    case "msi":
      vista = <MSIModule msi={datos.msi} tarjetas={datos.tarjetas} onAdd={agregarMSI} onDelete={eliminarMSI} />;
      break;
    case "plan":
      vista = <PlanDeudasModule tarjetas={datos.tarjetas} config={datos.config} onUpdateConfig={actualizarConfig} />;
      break;
    case "simulador":
      vista = <SimuladorModule tarjetas={datos.tarjetas} />;
      break;
    default:
      vista = null;
  }

  return (
    <div className="app-shell">
      <div className="sidebar-wrapper">
        <nav className="sidebar">
          <div className="sidebar-brand">TDC Control</div>
          <div className="sidebar-tagline">Sal de tus deudas, no de tus casillas</div>

          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${vistaActiva === item.id ? "active" : ""}`}
              onClick={() => setVistaActiva(item.id)}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-account">
          {guardando && (
            <div style={{ fontSize: "11px", color: "var(--text-dim)", padding: "6px 12px" }}>Guardando…</div>
          )}
          <div style={{ fontSize: "11px", color: "var(--text-dim)", padding: "6px 12px", wordBreak: "break-all" }}>
            {sesion.user.email}
          </div>
          <button className="nav-item" style={{ color: "var(--danger)" }} onClick={manejarCerrarSesion}>
            🚪 Cerrar sesión
          </button>
        </div>
      </div>

      <main className="main-content">{vista}</main>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
