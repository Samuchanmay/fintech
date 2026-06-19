-- ============================================================
-- TDC CONTROL — Esquema de base de datos para Supabase
-- ============================================================
-- Cómo usar este archivo:
-- 1. En tu proyecto de Supabase, ve a "SQL Editor" (ícono en el menú izquierdo).
-- 2. Da clic en "New query".
-- 3. Pega TODO el contenido de este archivo.
-- 4. Da clic en "Run" (o Ctrl+Enter).
-- 5. Deberías ver "Success. No rows returned" — eso significa que las
--    tablas se crearon correctamente.
--
-- Qué hace este script:
-- - Crea 3 tablas: tarjetas, gastos, msi.
-- - Cada fila tiene una columna user_id que la vincula a tu cuenta.
-- - Activa "Row Level Security" (RLS): esto es lo que garantiza que,
--   aunque la clave pública de la app esté en el código, cada persona
--   solo puede leer y escribir SUS PROPIOS datos, nunca los de otra
--   cuenta. Sin esto, cualquiera con la clave podría ver todo.
-- ============================================================

-- Tabla de tarjetas
create table if not exists tarjetas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  alias text not null,
  banco text,
  color text default '#3DDC97',
  limite numeric not null default 0,
  saldo numeric not null default 0,
  tasa_anual numeric not null default 0,
  dia_corte integer not null default 1,
  dia_pago integer not null default 1,
  pago_minimo numeric not null default 0,
  created_at timestamptz default now()
);

-- Tabla de gastos
create table if not exists gastos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tarjeta_id uuid references tarjetas(id) on delete set null,
  fecha date not null,
  categoria text not null default 'Otros',
  descripcion text,
  monto numeric not null,
  created_at timestamptz default now()
);

-- Tabla de compras a meses sin intereses
create table if not exists msi (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tarjeta_id uuid references tarjetas(id) on delete set null,
  producto text not null,
  monto_total numeric not null,
  fecha_compra date not null,
  meses_contratados integer not null default 12,
  created_at timestamptz default now()
);

-- ============================================================
-- Row Level Security: activar en las 3 tablas
-- ============================================================
alter table tarjetas enable row level security;
alter table gastos enable row level security;
alter table msi enable row level security;

-- Políticas: cada usuario solo puede ver/crear/editar/borrar SUS PROPIAS filas.
-- (auth.uid() es la función de Supabase que devuelve el ID del usuario que
-- está haciendo la petición, basado en su sesión de login.)

create policy "Los usuarios ven solo sus tarjetas"
  on tarjetas for select using (auth.uid() = user_id);
create policy "Los usuarios crean sus propias tarjetas"
  on tarjetas for insert with check (auth.uid() = user_id);
create policy "Los usuarios editan solo sus tarjetas"
  on tarjetas for update using (auth.uid() = user_id);
create policy "Los usuarios borran solo sus tarjetas"
  on tarjetas for delete using (auth.uid() = user_id);

create policy "Los usuarios ven solo sus gastos"
  on gastos for select using (auth.uid() = user_id);
create policy "Los usuarios crean sus propios gastos"
  on gastos for insert with check (auth.uid() = user_id);
create policy "Los usuarios editan solo sus gastos"
  on gastos for update using (auth.uid() = user_id);
create policy "Los usuarios borran solo sus gastos"
  on gastos for delete using (auth.uid() = user_id);

create policy "Los usuarios ven solo sus MSI"
  on msi for select using (auth.uid() = user_id);
create policy "Los usuarios crean sus propios MSI"
  on msi for insert with check (auth.uid() = user_id);
create policy "Los usuarios editan solo sus MSI"
  on msi for update using (auth.uid() = user_id);
create policy "Los usuarios borran solo sus MSI"
  on msi for delete using (auth.uid() = user_id);

-- ============================================================
-- Índices para que las consultas sean rápidas
-- ============================================================
create index if not exists idx_tarjetas_user on tarjetas(user_id);
create index if not exists idx_gastos_user on gastos(user_id);
create index if not exists idx_gastos_tarjeta on gastos(tarjeta_id);
create index if not exists idx_msi_user on msi(user_id);
create index if not exists idx_msi_tarjeta on msi(tarjeta_id);
