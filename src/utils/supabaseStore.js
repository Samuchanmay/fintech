const SUPABASE_URL = "https://your-project.supabase.co";
const SUPABASE_ANON_KEY = "your-anon-key";

const supabase = window.supabase?.createClient
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

const STORAGE_BUCKET = "documentos";

async function getTarjetas(userId) {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("tarjetas")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

async function crearTarjeta(tarjeta) {
  if (!supabase) throw new Error("Supabase no configurado");
  const { data, error } = await supabase
    .from("tarjetas")
    .insert(tarjeta)
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function actualizarTarjeta(id, updates) {
  if (!supabase) throw new Error("Supabase no configurado");
  const { data, error } = await supabase
    .from("tarjetas")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function eliminarTarjeta(id) {
  if (!supabase) throw new Error("Supabase no configurado");
  const { error } = await supabase
    .from("tarjetas")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

async function getEstadosCuenta(userId, tarjetaId) {
  if (!supabase) return [];
  let query = supabase
    .from("estados_cuenta")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (tarjetaId) query = query.eq("tarjeta_id", tarjetaId);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

async function crearEstadoCuenta(estado) {
  if (!supabase) throw new Error("Supabase no configurado");
  const { data, error } = await supabase
    .from("estados_cuenta")
    .insert(estado)
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function eliminarEstadoCuenta(id) {
  if (!supabase) throw new Error("Supabase no configurado");
  const { error } = await supabase
    .from("estados_cuenta")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

async function subirPDF(file, userId, tarjetaId) {
  if (!supabase) throw new Error("Supabase no configurado");
  const filePath = `${userId}/${tarjetaId}/${Date.now()}_${file.name}`;
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });
  if (error) throw error;
  const { data: urlData } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(filePath);
  return urlData?.publicUrl || "";
}

async function login(email, password) {
  if (!supabase) throw new Error("Supabase no configurado");
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

async function signUp(email, password) {
  if (!supabase) throw new Error("Supabase no configurado");
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

async function logout() {
  if (!supabase) return;
  await supabase.auth.signOut();
}

function onAuthChange(callback) {
  if (!supabase) return () => {};
  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    callback(session?.user || null);
  });
  return () => data?.subscription?.unsubscribe();
}

async function getCurrentUser() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data?.user || null;
}

window.supabaseClient = supabase;
window.STORAGE_BUCKET = STORAGE_BUCKET;
window.getTarjetas = getTarjetas;
window.crearTarjeta = crearTarjeta;
window.actualizarTarjeta = actualizarTarjeta;
window.eliminarTarjeta = eliminarTarjeta;
window.getEstadosCuenta = getEstadosCuenta;
window.crearEstadoCuenta = crearEstadoCuenta;
window.eliminarEstadoCuenta = eliminarEstadoCuenta;
window.subirPDF = subirPDF;
window.login = login;
window.signUp = signUp;
window.logout = logout;
window.onAuthChange = onAuthChange;
window.getCurrentUser = getCurrentUser;
