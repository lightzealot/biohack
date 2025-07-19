-- Crear tabla de usuarios/parejas
CREATE TABLE couples (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  person1_name VARCHAR(50) DEFAULT 'Persona 1',
  person2_name VARCHAR(50) DEFAULT 'Persona 2',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de transacciones
CREATE TABLE transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  couple_id UUID REFERENCES couples(id) ON DELETE CASCADE,
  amount BIGINT NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,
  type VARCHAR(10) CHECK (type IN ('income', 'expense')) NOT NULL,
  person VARCHAR(10) CHECK (person IN ('person1', 'person2')) NOT NULL,
  transaction_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejor rendimiento
CREATE INDEX idx_transactions_couple_id ON transactions(couple_id);
CREATE INDEX idx_transactions_date ON transactions(transaction_date);
CREATE INDEX idx_transactions_type ON transactions(type);

-- Habilitar Row Level Security
ALTER TABLE couples ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad (permitir acceso público para demo)
CREATE POLICY "Allow public access to couples" ON couples
  FOR ALL USING (true);

CREATE POLICY "Allow public access to transactions" ON transactions
  FOR ALL USING (true);

-- Insertar datos de ejemplo
INSERT INTO couples (name, person1_name, person2_name) 
VALUES ('Familia Gomez', 'Ana', 'Carlos');

-- Obtener el ID de la pareja para las transacciones de ejemplo
INSERT INTO transactions (couple_id, amount, description, category, type, person, transaction_date)
SELECT 
  c.id,
  2500000,
  'Salario mensual Ana',
  'salary',
  'income',
  'person1',
  CURRENT_DATE - INTERVAL '5 days'
FROM couples c WHERE c.name = 'Familia Gomez';

INSERT INTO transactions (couple_id, amount, description, category, type, person, transaction_date)
SELECT 
  c.id,
  2200000,
  'Salario mensual Carlos',
  'salary',
  'income',
  'person2',
  CURRENT_DATE - INTERVAL '5 days'
FROM couples c WHERE c.name = 'Familia Gomez';

INSERT INTO transactions (couple_id, amount, description, category, type, person, transaction_date)
SELECT 
  c.id,
  800000,
  'Arriendo apartamento',
  'housing',
  'expense',
  'person1',
  CURRENT_DATE - INTERVAL '3 days'
FROM couples c WHERE c.name = 'Familia Gomez';

INSERT INTO transactions (couple_id, amount, description, category, type, person, transaction_date)
SELECT 
  c.id,
  150000,
  'Mercado semanal',
  'food',
  'expense',
  'person2',
  CURRENT_DATE - INTERVAL '2 days'
FROM couples c WHERE c.name = 'Familia Gomez';
