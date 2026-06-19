const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: "\u{1F4CA}" },
  { id: "tarjetas", label: "Tarjetas", icon: "\u{1F4B3}" },
  { id: "gastos", label: "Gastos", icon: "\u{1F9FE}" },
  { id: "msi", label: "Meses sin intereses", icon: "\u{1F4E6}" },
  { id: "plan", label: "Plan de deudas", icon: "\u{1F3AF}" },
  { id: "simulador", label: "Simulador", icon: "\u{1F9EE}" }
];
function App() {
  const [sesion, setSesion] = useState(void 0);
  const [datos, setDatos] = useState(null);
  const [cargandoDatos, setCargandoDatos] = useState(false);
  const [errorCarga, setErrorCarga] = useState(null);
  const [vistaActiva, setVistaActiva] = useState("dashboard");
  const [guardando, setGuardando] = useState(false);
  useEffect(() => {
    SupabaseStore.obtenerSesionActual().then((s) => setSesion(s)).catch(() => setSesion(null));
    const subscription = SupabaseStore.suscribirseACambiosDeSesion((s) => setSesion(s));
    return () => subscription.unsubscribe();
  }, []);
  useEffect(() => {
    if (!sesion) {
      setDatos(null);
      return;
    }
    setCargandoDatos(true);
    setErrorCarga(null);
    SupabaseStore.cargarDatosSupabase(sesion.user.id).then((d) => setDatos(d)).catch((err) => setErrorCarga(err.message)).finally(() => setCargandoDatos(false));
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
      setDatos((d) => ({ ...d, tarjetas: d.tarjetas.map((x) => x.id === t.id ? actualizada : x) }));
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
  if (sesion === void 0) {
    return /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", color: "var(--text-dim)" } }, "Cargando\u2026");
  }
  if (sesion === null) {
    return /* @__PURE__ */ React.createElement(PantallaLogin, null);
  }
  if (cargandoDatos || !datos) {
    return /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", color: "var(--text-dim)" } }, "Cargando tus datos\u2026");
  }
  if (errorCarga) {
    return /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "20px" } }, /* @__PURE__ */ React.createElement("div", { className: "card", style: { maxWidth: "420px" } }, /* @__PURE__ */ React.createElement("h3", { style: { color: "var(--danger)", marginTop: 0 } }, "No se pudieron cargar tus datos"), /* @__PURE__ */ React.createElement("p", { style: { fontSize: "13px", color: "var(--text-dim)" } }, errorCarga), /* @__PURE__ */ React.createElement("button", { className: "btn btn-secondary", onClick: () => window.location.reload() }, "Reintentar")));
  }
  let vista;
  switch (vistaActiva) {
    case "dashboard":
      vista = /* @__PURE__ */ React.createElement(DashboardModule, { tarjetas: datos.tarjetas, config: datos.config });
      break;
    case "tarjetas":
      vista = /* @__PURE__ */ React.createElement(TarjetasModule, { tarjetas: datos.tarjetas, config: datos.config, onAdd: agregarTarjeta, onUpdate: actualizarTarjeta, onDelete: eliminarTarjeta });
      break;
    case "gastos":
      vista = /* @__PURE__ */ React.createElement(GastosModule, { gastos: datos.gastos, tarjetas: datos.tarjetas, onAdd: agregarGasto, onDelete: eliminarGasto });
      break;
    case "msi":
      vista = /* @__PURE__ */ React.createElement(MSIModule, { msi: datos.msi, tarjetas: datos.tarjetas, onAdd: agregarMSI, onDelete: eliminarMSI });
      break;
    case "plan":
      vista = /* @__PURE__ */ React.createElement(PlanDeudasModule, { tarjetas: datos.tarjetas, config: datos.config, onUpdateConfig: actualizarConfig });
      break;
    case "simulador":
      vista = /* @__PURE__ */ React.createElement(SimuladorModule, { tarjetas: datos.tarjetas });
      break;
    default:
      vista = null;
  }
  return /* @__PURE__ */ React.createElement("div", { className: "app-shell" }, /* @__PURE__ */ React.createElement("div", { className: "sidebar-wrapper" }, /* @__PURE__ */ React.createElement("nav", { className: "sidebar" }, /* @__PURE__ */ React.createElement("div", { className: "sidebar-brand" }, "TDC Control"), /* @__PURE__ */ React.createElement("div", { className: "sidebar-tagline" }, "Sal de tus deudas, no de tus casillas"), NAV_ITEMS.map((item) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: item.id,
      className: `nav-item ${vistaActiva === item.id ? "active" : ""}`,
      onClick: () => setVistaActiva(item.id)
    },
    /* @__PURE__ */ React.createElement("span", null, item.icon),
    /* @__PURE__ */ React.createElement("span", null, item.label)
  ))), /* @__PURE__ */ React.createElement("div", { className: "sidebar-account" }, guardando && /* @__PURE__ */ React.createElement("div", { style: { fontSize: "11px", color: "var(--text-dim)", padding: "6px 12px" } }, "Guardando\u2026"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "11px", color: "var(--text-dim)", padding: "6px 12px", wordBreak: "break-all" } }, sesion.user.email), /* @__PURE__ */ React.createElement("button", { className: "nav-item", style: { color: "var(--danger)" }, onClick: manejarCerrarSesion }, "\u{1F6AA} Cerrar sesi\xF3n"))), /* @__PURE__ */ React.createElement("main", { className: "main-content" }, vista));
}
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(/* @__PURE__ */ React.createElement(App, null));
