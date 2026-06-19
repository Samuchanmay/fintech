// supabaseStore.js — Reemplaza a store.js. En vez de localStorage, lee y
// escribe en Supabase (Postgres en la nube), con autenticación real para
// que cada persona solo vea sus propios datos.
//
// Requiere que el script de Supabase (cargado desde CDN en index.html)
// haya definido window.supabase.createClient.

const SUPABASE_URL = "https://yunpghcdckwanfdunrsj.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1bnBnaGNkY2t3YW5mZHVucnNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE4MjcyNTEsImV4cCI6MjA5NzQwMzI1MX0.t6eUByi8XXw9yPt05KNRvkkQHX0dguY455Csu_tk0WQ";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function obtenerSesionActual() {
  const { data, error } = await supabaseClient.auth.getSession();
  if (error) throw error;
  return data.session;
}

async function registrarse(email, password) {
  const { data, error } = await supabaseClient.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

async function iniciarSesion(email, password) {
  const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

async function cerrarSesion() {
  const { error } = await supabaseClient.auth.signOut();
  if (error) throw error;
}

function suscribirseACambiosDeSesion(callback) {
  const { data } = supabaseClient.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
  return data.subscription;
}

function tarjetaDesdeFila(fila) {
  return {
    id: fila.id,
    alias: fila.alias,
    banco: fila.banco,
    color: fila.color,
    limite: Number(fila.limite),
    saldo: Number(fila.saldo),
    tasaAnual: Number(fila.tasa_anual),
    diaCorte: fila.dia_corte,
    diaPago: fila.dia_pago,
    pagoMinimo: Number(fila.pago_minimo),
  };
}

function tarjetaHaciaFila(tarjeta, userId) {
  return {
    user_id: userId,
    alias: tarjeta.alias,
    banco: tarjeta.banco,
    color: tarjeta.color,
    limite: tarjeta.limite,
    saldo: tarjeta.saldo,
    tasa_anual: tarjeta.tasaAnual,
    dia_corte: tarjeta.diaCorte,
    dia_pago: tarjeta.diaPago,
    pago_minimo: tarjeta.pagoMinimo,
  };
}

function gastoDesdeFila(fila) {
  return {
    id: fila.id,
    tarjetaId: fila.tarjeta_id,
    fecha: fila.fecha,
    categoria: fila.categoria,
    descripcion: fila.descripcion,
    monto: Number(fila.monto),
  };
}

function gastoHaciaFila(gasto, userId) {
  return {
    user_id: userId,
    tarjeta_id: gasto.tarjetaId,
    fecha: gasto.fecha,
    categoria: gasto.categoria,
    descripcion: gasto.descripcion,
    monto: gasto.monto,
  };
}

function msiDesdeFila(fila) {
  return {
    id: fila.id,
    tarjetaId: fila.tarjeta_id,
    producto: fila.producto,
    montoTotal: Number(fila.monto_total),
    fechaCompra: fila.fecha_compra,
    mesesContratados: fila.meses_contratados,
  };
}

function msiHaciaFila(compra, userId) {
  return {
    user_id: userId,
    tarjeta_id: compra.tarjetaId,
    producto: compra.producto,
    monto_total: compra.montoTotal,
    fecha_compra: compra.fechaCompra,
    meses_contratados: compra.mesesContratados,
  };
}

async function cargarDatosSupabase(userId) {
  const [tarjetasRes, gastosRes, msiRes] = await Promise.all([
    supabaseClient.from("tarjetas").select("*").order("created_at", { ascending: true }),
    supabaseClient.from("gastos").select("*").order("fecha", { ascending: false }),
    supabaseClient.from("msi").select("*").order("created_at", { ascending: true }),
  ]);

  if (tarjetasRes.error) throw tarjetasRes.error;
  if (gastosRes.error) throw gastosRes.error;
  if (msiRes.error) throw msiRes.error;

  return {
    tarjetas: tarjetasRes.data.map(tarjetaDesdeFila),
    gastos: gastosRes.data.map(gastoDesdeFila),
    msi: msiRes.data.map(msiDesdeFila),
    config: cargarConfigLocal(),
  };
}

const CONFIG_KEY = "tdc_control_config_v1";
const DEFAULT_CONFIG = { metodoPlan: "nieve", pagoExtraMensual: 3000, umbralRiesgo: 0.7, umbralSano: 0.3 };

function cargarConfigLocal() {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (!raw) return Object.assign({}, DEFAULT_CONFIG);
    return Object.assign({}, DEFAULT_CONFIG, JSON.parse(raw));
  } catch (err) {
    return Object.assign({}, DEFAULT_CONFIG);
  }
}

function guardarConfigLocal(config) {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
}

async function crearTarjetaSupabase(tarjeta, userId) {
  const { data, error } = await supabaseClient
    .from("tarjetas")
    .insert(tarjetaHaciaFila(tarjeta, userId))
    .select()
    .single();
  if (error) throw error;
  return tarjetaDesdeFila(data);
}

async function actualizarTarjetaSupabase(tarjeta, userId) {
  const { data, error } = await supabaseClient
    .from("tarjetas")
    .update(tarjetaHaciaFila(tarjeta, userId))
    .eq("id", tarjeta.id)
    .select()
    .single();
  if (error) throw error;
  return tarjetaDesdeFila(data);
}

async function eliminarTarjetaSupabase(id) {
  const { error } = await supabaseClient.from("tarjetas").delete().eq("id", id);
  if (error) throw error;
}

async function crearGastoSupabase(gasto, userId) {
  const { data, error } = await supabaseClient
    .from("gastos")
    .insert(gastoHaciaFila(gasto, userId))
    .select()
    .single();
  if (error) throw error;
  return gastoDesdeFila(data);
}

async function eliminarGastoSupabase(id) {
  const { error } = await supabaseClient.from("gastos").delete().eq("id", id);
  if (error) throw error;
}

async function crearMSISupabase(compra, userId) {
  const { data, error } = await supabaseClient
    .from("msi")
    .insert(msiHaciaFila(compra, userId))
    .select()
    .single();
  if (error) throw error;
  return msiDesdeFila(data);
}

async function eliminarMSISupabase(id) {
  const { error } = await supabaseClient.from("msi").delete().eq("id", id);
  if (error) throw error;
}

window.SupabaseStore = {
  obtenerSesionActual,
  registrarse,
  iniciarSesion,
  cerrarSesion,
  suscribirseACambiosDeSesion,
  cargarDatosSupabase,
  cargarConfigLocal,
  guardarConfigLocal,
  crearTarjetaSupabase,
  actualizarTarjetaSupabase,
  eliminarTarjetaSupabase,
  crearGastoSupabase,
  eliminarGastoSupabase,
  crearMSISupabase,
  eliminarMSISupabase,
};
