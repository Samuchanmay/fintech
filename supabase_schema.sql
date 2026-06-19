CREATE TABLE IF NOT EXISTS tarjetas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  nombre TEXT NOT NULL,
  banco TEXT NOT NULL,
  limite DECIMAL(12,2) NOT NULL DEFAULT 0,
  saldo_disponible DECIMAL(12,2) NOT NULL DEFAULT 0,
  saldo DECIMAL(12,2) GENERATED ALWAYS AS (limite - saldo_disponible) STORED,
  fecha_corte INTEGER,
  fecha_pago INTEGER,
  tasa_interes DECIMAL(5,2),
  notas TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS estados_cuenta (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  tarjeta_id UUID REFERENCES tarjetas(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  pdf_url TEXT,
  periodo TEXT,
  saldo_total DECIMAL(12,2),
  pago_minimo DECIMAL(12,2),
  limite_credito DECIMAL(12,2),
  fecha_corte DATE,
  fecha_pago DATE,
  banco_detectado TEXT,
  datos_extra JSONB DEFAULT '{}'
);

ALTER TABLE tarjetas ENABLE ROW LEVEL SECURITY;
ALTER TABLE estados_cuenta ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tarjetas" ON tarjetas
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tarjetas" ON tarjetas
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tarjetas" ON tarjetas
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own tarjetas" ON tarjetas
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own estados_cuenta" ON estados_cuenta
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own estados_cuenta" ON estados_cuenta
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own estados_cuenta" ON estados_cuenta
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own estados_cuenta" ON estados_cuenta
  FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_tarjetas_user ON tarjetas(user_id);
CREATE INDEX IF NOT EXISTS idx_estados_cuenta_user ON estados_cuenta(user_id);
CREATE INDEX IF NOT EXISTS idx_estados_cuenta_tarjeta ON estados_cuenta(tarjeta_id);
