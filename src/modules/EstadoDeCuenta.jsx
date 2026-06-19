function EstadoDeCuentaModule() {
  const [user, setUser] = React.useState(null);
  const [tarjetas, setTarjetas] = React.useState([]);
  const [estados, setEstados] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [uploading, setUploading] = React.useState(false);
  const [selectedTarjeta, setSelectedTarjeta] = React.useState("");
  const [extractedData, setExtractedData] = React.useState(null);
  const [toast, setToast] = React.useState(null);
  const [showCreateCard, setShowCreateCard] = React.useState(false);

  React.useEffect(() => {
    async function load() {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      if (currentUser) {
        try {
          const [tData, eData] = await Promise.all([
            getTarjetas(currentUser.id),
            getEstadosCuenta(currentUser.id),
          ]);
          setTarjetas(tData);
          setEstados(eData);
          if (tData.length > 0) setSelectedTarjeta(tData[0].id.toString());
        } catch {
          setToast({ type: "error", message: "Error al cargar datos" });
        }
      }
      setLoading(false);
    }
    load();
  }, []);

  async function handleFileUpload(file) {
    if (!file || file.type !== "application/pdf") {
      setToast({ type: "error", message: "Selecciona un archivo PDF" });
      return;
    }
    setUploading(true);
    setExtractedData(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let text = "";
      for (let i = 1; i <= Math.min(pdf.numPages, 5); i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map((item) => item.str).join(" ") + "\n";
      }

      const data = extractDataFromText(text);
      setExtractedData({ ...data, text });

      if (data.banco && selectedTarjeta) {
        const tarjeta = tarjetas.find((t) => t.id === selectedTarjeta);
        if (tarjeta && user) {
          const pdfUrl = await subirPDF(file, user.id, selectedTarjeta);
          const estadoData = {
            tarjeta_id: selectedTarjeta,
            user_id: user.id,
            pdf_url: pdfUrl,
            periodo: data.periodo,
            saldo_total: data.saldoTotal,
            pago_minimo: data.pagoMinimo,
            limite_credito: data.limiteCredito,
            fecha_corte: data.fechaCorte,
            fecha_pago: data.fechaPago,
            banco_detectado: data.banco,
            datos_extra: { texto_extraido: text.substring(0, 2000) }
          };
          const created = await crearEstadoCuenta(estadoData);
          setEstados((prev) => [created, ...prev]);
          setToast({ type: "success", message: "Estado de cuenta procesado" });
        }
      }
    } catch {
      setToast({ type: "error", message: "Error al procesar el PDF" });
    }
    setUploading(false);
  }

  function extractDataFromText(text) {
    const result = {
      saldoTotal: null,
      pagoMinimo: null,
      limeteCredito: null,
      fechaCorte: null,
      fechaPago: null,
      periodo: null,
      banco: null,
    };

    const saldoTotalMatch = text.match(/(?:saldo\s+(?:total|actual)|total\s+a\s+pagar)\s*[:\$]?\s*\$?[\s]*([\d,]+\.?\d*)/i);
    if (saldoTotalMatch) result.saldoTotal = parseFloat(saldoTotalMatch[1].replace(/,/g, ""));

    const pagoMinimoMatch = text.match(/(?:pago\s+m[íi]nimo|pago\s+para\s+no\s+generar\s+intereses)\s*[:\$]?\s*\$?[\s]*([\d,]+\.?\d*)/i);
    if (pagoMinimoMatch) result.pagoMinimo = parseFloat(pagoMinimoMatch[1].replace(/,/g, ""));

    const limiteMatch = text.match(/(?:l[íi]mite\s+(?:de\s+)?cr[eé]dito|l[íi]mite)\s*[:\$]?\s*\$?[\s]*([\d,]+\.?\d*)/i);
    if (limiteMatch) result.limiteCredito = parseFloat(limiteMatch[1].replace(/,/g, ""));

    const fechaCorteMatch = text.match(/(?:fecha\s+de\s+corte|corte)\s*[:\s]*(\d{1,2}\s*(?:de\s+)?[a-z]+\s*(?:de\s+)?\d{4}|\d{2}\/\d{2}\/\d{4}|\d{4}-\d{2}-\d{2})/i);
    if (fechaCorteMatch) result.fechaCorte = fechaCorteMatch[1];

    const fechaPagoMatch = text.match(/(?:fecha\s+(?:de\s+)?(?:l[íi]mite\s+de\s+)?pago|pago\s+m[áa]x)\s*[:\s]*(\d{1,2}\s*(?:de\s+)?[a-z]+\s*(?:de\s+)?\d{4}|\d{2}\/\d{2}\/\d{4}|\d{4}-\d{2}-\d{2})/i);
    if (fechaPagoMatch) result.fechaPago = fechaPagoMatch[1];

    const periodoMatch = text.match(/(?:periodo|del)\s*[:\s]*(\d{1,2}\s*(?:de\s+)?[a-z]+\s*(?:de\s+)?\d{4})/i);
    if (periodoMatch) result.periodo = periodoMatch[1];

    const bancos = [
      { regex: /bbva/i, nombre: "BBVA" },
      { regex: /hsbc/i, nombre: "HSBC" },
      { regex: /santander/i, nombre: "Santander" },
      { regex: /banamex|citibanamex/i, nombre: "Citibanamex" },
      { regex: /banorte/i, nombre: "Banorte" },
      { regex: /scotiabank/i, nombre: "Scotiabank" },
      { regex: /inbursa/i, nombre: "Inbursa" },
      { regex: /banregio/i, nombre: "Banregio" },
      { regex: /nu\s*m[eé]xico|nu\s*card/i, nombre: "Nu México" },
      { regex: /american\s*express|amex/i, nombre: "American Express" },
    ];
    for (const b of bancos) {
      if (b.regex.test(text)) {
        result.banco = b.nombre;
        break;
      }
    }

    return result;
  }

  async function handleCreateCardFromStatement() {
    if (!extractedData || !user) return;
    try {
      const nombre = prompt("Nombre para la nueva tarjeta:", extractedData.banco || "Nueva tarjeta");
      if (!nombre) return;
      const tarjetaData = {
        nombre,
        banco: extractedData.banco || "Automático",
        limite: extractedData.limiteCredito || 0,
        saldo_disponible: (extractedData.limiteCredito || 0) - (extractedData.saldoTotal || 0),
        fecha_corte: extractedData.fechaCorte ? parseInt(extractedData.fechaCorte) : null,
        fecha_pago: extractedData.fechaPago ? parseInt(extractedData.fechaPago) : null,
        user_id: user.id,
      };
      const created = await crearTarjeta(tarjetaData);
      setTarjetas((prev) => [created, ...prev]);
      setSelectedTarjeta(created.id.toString());
      setShowCreateCard(false);
      setToast({ type: "success", message: `Tarjeta "${nombre}" creada desde el estado de cuenta` });
    } catch {
      setToast({ type: "error", message: "Error al crear tarjeta" });
    }
  }

  React.useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  if (loading) {
    return React.createElement("div", { className: "app-container" },
      React.createElement("div", { className: "skeleton", style: { height: 200, marginBottom: 16 } }),
      React.createElement("div", { className: "skeleton", style: { height: 100 } })
    );
  }

  return React.createElement("div", { className: "app-container" },
    React.createElement("h2", { style: { fontSize: "1.25rem", fontWeight: 700, marginBottom: 8 } }, "Estado de Cuenta"),
    React.createElement("p", { style: { fontSize: "0.875rem", color: "var(--color-text-secondary)", marginBottom: 24 } },
      "Sube tu estado de cuenta PDF para extraer automáticamente los datos"
    ),

    tarjetas.length > 0 && React.createElement("div", { className: "form-group" },
      React.createElement("label", { className: "form-label" }, "Vincular a tarjeta"),
      React.createElement("select", {
        className: "form-input",
        value: selectedTarjeta,
        onChange: (e) => setSelectedTarjeta(e.target.value)
      },
        tarjetas.map((t) =>
          React.createElement("option", { key: t.id, value: t.id.toString() },
            t.nombre + " (" + t.banco + ")"
          )
        )
      )
    ),

    React.createElement("div", {
      className: "upload-zone",
      onClick: () => document.getElementById("pdf-upload-input").click(),
      onDragOver: (e) => { e.preventDefault(); e.currentTarget.classList.add("upload-zone--active"); },
      onDragLeave: (e) => e.currentTarget.classList.remove("upload-zone--active"),
      onDrop: (e) => {
        e.preventDefault();
        e.currentTarget.classList.remove("upload-zone--active");
        const file = e.dataTransfer.files[0];
        if (file) handleFileUpload(file);
      }
    },
      React.createElement("input", {
        id: "pdf-upload-input",
        type: "file",
        accept: ".pdf,application/pdf",
        onChange: (e) => {
          const file = e.target.files[0];
          if (file) handleFileUpload(file);
          e.target.value = "";
        }
      }),
      uploading
        ? React.createElement(React.Fragment, null,
            React.createElement("div", { className: "upload-zone__icon", style: { opacity: 1 } }, "⏳"),
            React.createElement("div", { className: "upload-zone__text" }, "Procesando PDF…")
          )
        : React.createElement(React.Fragment, null,
            React.createElement("div", { className: "upload-zone__icon" }, "📄"),
            React.createElement("div", { className: "upload-zone__text" }, "Sube tu estado de cuenta"),
            React.createElement("div", { className: "upload-zone__hint" }, "Arrastra un PDF o haz clic para seleccionar")
          )
    ),

    extractedData && React.createElement("div", {
      style: { background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", padding: 20, marginTop: 24, animation: "fadeSlideIn 0.3s var(--ease-out)" }
    },
      React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 } },
        React.createElement("h3", { style: { fontSize: "1rem", fontWeight: 600 } }, "Datos extraídos"),
        extractedData.banco && React.createElement("span", { className: "detection-badge detection-badge--success" }, extractedData.banco)
      ),
      React.createElement("div", { className: "stats-grid" },
        extractedData.saldoTotal && React.createElement("div", { className: "stat" },
          React.createElement("div", { className: "stat__label" }, "Saldo total"),
          React.createElement("div", { className: "stat__value" }, darFormatoMoneda(extractedData.saldoTotal))
        ),
        extractedData.pagoMinimo && React.createElement("div", { className: "stat" },
          React.createElement("div", { className: "stat__label" }, "Pago mínimo"),
          React.createElement("div", { className: "stat__value" }, darFormatoMoneda(extractedData.pagoMinimo))
        ),
        extractedData.limiteCredito && React.createElement("div", { className: "stat" },
          React.createElement("div", { className: "stat__label" }, "Límite"),
          React.createElement("div", { className: "stat__value" }, darFormatoMoneda(extractedData.limiteCredito))
        ),
        extractedData.periodo && React.createElement("div", { className: "stat" },
          React.createElement("div", { className: "stat__label" }, "Período"),
          React.createElement("div", { className: "stat__value", style: { fontSize: "0.875rem" } }, extractedData.periodo)
        )
      ),
      !tarjetas.find((t) => t.id === selectedTarjeta) && React.createElement("div", { style: { marginTop: 16 } },
        React.createElement("button", { className: "btn btn--primary btn--block", onClick: handleCreateCardFromStatement },
          "Crear tarjeta desde este estado de cuenta"
        )
      )
    ),

    estados.length > 0 && React.createElement("div", { style: { marginTop: 32 } },
      React.createElement("h3", { style: { fontSize: "1rem", fontWeight: 600, marginBottom: 16 } }, "Historial de estados de cuenta"),
      React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 12 } },
        estados.slice(0, 10).map((e) =>
          React.createElement("div", {
            key: e.id,
            style: { background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }
          },
            React.createElement("div", null,
              React.createElement("div", { style: { fontSize: "0.875rem", fontWeight: 600 } }, e.periodo || "Estado de cuenta"),
              e.banco_detectado && React.createElement("div", { style: { fontSize: "0.75rem", color: "var(--color-text-muted)" } }, e.banco_detectado)
            ),
            React.createElement("div", { style: { textAlign: "right" } },
              e.saldo_total && React.createElement("div", { style: { fontWeight: 700 } }, darFormatoMoneda(e.saldo_total)),
              React.createElement("div", { style: { fontSize: "0.75rem", color: "var(--color-text-muted)" } },
                new Date(e.created_at).toLocaleDateString("es-MX")
              )
            )
          )
        )
      )
    ),

    toast && React.createElement("div", { className: "toast toast--" + toast.type }, toast.message)
  );
}

window.EstadoDeCuentaModule = EstadoDeCuentaModule;
