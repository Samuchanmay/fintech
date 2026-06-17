const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: "📊" },
  { id: "tarjetas", label: "Tarjetas", icon: "💳" },
  { id: "gastos", label: "Gastos", icon: "🧾" },
  { id: "msi", label: "Meses sin intereses", icon: "📦" },
  { id: "plan", label: "Plan de deudas", icon: "🎯" },
  { id: "simulador", label: "Simulador", icon: "🧮" },
];

function App() {
  const [datos, setDatos] = useState(() => StoreUtils.cargarDatos());
  const [vistaActiva, setVistaActiva] = useState("dashboard");

  useEffect(() => {
    StoreUtils.guardarDatos(datos);
  }, [datos]);

  function agregarTarjeta(t) {
    setDatos((d) => ({ ...d, tarjetas: [...d.tarjetas, { ...t, id: StoreUtils.generarId() }] }));
  }
  function actualizarTarjeta(t) {
    setDatos((d) => ({ ...d, tarjetas: d.tarjetas.map((x) => (x.id === t.id ? t : x)) }));
  }
  function eliminarTarjeta(id) {
    setDatos((d) => ({ ...d, tarjetas: d.tarjetas.filter((x) => x.id !== id) }));
  }

  function agregarGasto(g) {
    setDatos((d) => ({ ...d, gastos: [...d.gastos, { ...g, id: StoreUtils.generarId() }] }));
  }
  function eliminarGasto(id) {
    setDatos((d) => ({ ...d, gastos: d.gastos.filter((x) => x.id !== id) }));
  }

  function agregarMSI(m) {
    setDatos((d) => ({ ...d, msi: [...d.msi, { ...m, id: StoreUtils.generarId() }] }));
  }
  function eliminarMSI(id) {
    setDatos((d) => ({ ...d, msi: d.msi.filter((x) => x.id !== id) }));
  }

  function actualizarConfig(cambios) {
    setDatos((d) => ({ ...d, config: { ...d.config, ...cambios } }));
  }

  function manejarExportar() {
    StoreUtils.exportarDatos();
  }

  function manejarImportar(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        StoreUtils.importarDatos(reader.result);
        setDatos(StoreUtils.cargarDatos());
        alert("Datos importados correctamente.");
      } catch (err) {
        alert("No se pudo leer ese archivo. ¿Es un backup válido de TDC Control?");
      }
    };
    reader.readAsText(file);
  }

  function manejarBorrarTodo() {
    if (confirm("¿Borrar TODOS los datos de esta app? Esto no se puede deshacer. Considera exportar un backup antes.")) {
      StoreUtils.borrarTodo();
      setDatos(StoreUtils.cargarDatos());
    }
  }

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

        <div style={{ marginTop: "auto", paddingTop: "20px", borderTop: "1px solid var(--border)" }}>
          <button className="nav-item" onClick={manejarExportar}>⬇️ Exportar backup</button>
          <label className="nav-item" style={{ cursor: "pointer" }}>
            ⬆️ Importar backup
            <input type="file" accept="application/json" onChange={manejarImportar} style={{ display: "none" }} />
          </label>
          <button className="nav-item" style={{ color: "var(--danger)" }} onClick={manejarBorrarTodo}>🗑️ Borrar todo</button>
        </div>
      </nav>

      <main className="main-content">{vista}</main>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
