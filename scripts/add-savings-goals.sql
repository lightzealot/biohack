-- Crear tabla de metas de ahorro
CREATE TABLE savings_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  couple_id UUID REFERENCES couples(id) ON DELETE CASCADE,
  title VARCHAR(100) NOT NULL,
  target_amount BIGINT NOT NULL,
  current_amount BIGINT DEFAULT 0,
  target_date DATE,
  category VARCHAR(50) DEFAULT 'general',
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices
CREATE INDEX idx_savings_goals_couple_id ON savings_goals(couple_id);
CREATE INDEX idx_savings_goals_completed ON savings_goals(is_completed);

-- Habilitar RLS
ALTER TABLE savings_goals ENABLE ROW LEVEL SECURITY;

-- Política de seguridad
CREATE POLICY "Allow public access to savings_goals" ON savings_goals
  FOR ALL USING (true);

-- Insertar metas de ejemplo
INSERT INTO savings_goals (couple_id, title, target_amount, current_amount, target_date, category)
SELECT 
  c.id,
  'Vacaciones en Cartagena',
  3000000,
  800000,
  '2024-06-15',
  'travel'
FROM couples c WHERE c.name = 'Pareja Demo';

INSERT INTO savings_goals (couple_id, title, target_amount, current_amount, target_date, category)
SELECT 
  c.id,
  'Fondo de emergencia',
  5000000,
  1200000,
  '2024-12-31',
  'emergency'
FROM couples c WHERE c.name = 'Pareja Demo';

-- Crear tabla de categorías de gastos mensuales para estadísticas
CREATE TABLE monthly_budgets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  couple_id UUID REFERENCES couples(id) ON DELETE CASCADE,
  category VARCHAR(50) NOT NULL,
  budget_amount BIGINT NOT NULL,
  month_year VARCHAR(7) NOT NULL, -- formato: 2024-01
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para budgets
CREATE INDEX idx_monthly_budgets_couple_month ON monthly_budgets(couple_id, month_year);
CREATE UNIQUE INDEX idx_monthly_budgets_unique ON monthly_budgets(couple_id, category, month_year);

-- RLS para budgets
ALTER TABLE monthly_budgets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access to monthly_budgets" ON monthly_budgets FOR ALL USING (true);

-- Insertar presupuestos de ejemplo para el mes actual
INSERT INTO monthly_budgets (couple_id, category, budget_amount, month_year)
SELECT 
  c.id,
  category,
  amount,
  TO_CHAR(CURRENT_DATE, 'YYYY-MM')
FROM couples c, (VALUES 
  ('housing', 1000000),
  ('food', 800000),
  ('transport', 400000),
  ('entertainment', 300000),
  ('health', 200000)
) AS budgets(category, amount)
WHERE c.name = 'Pareja Demo';
