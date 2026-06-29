import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_STRING,
  max: 10,
  idleTimeoutMillis: 30000,
});

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guide_id VARCHAR(50) NOT NULL DEFAULT 'anonymous',
  guide_name VARCHAR(255) NOT NULL,
  group_name VARCHAR(255) NOT NULL DEFAULT '',
  arrival_date DATE NOT NULL,
  arrival_time TIME NOT NULL,
  male_tourists INTEGER NOT NULL DEFAULT 0,
  female_tourists INTEGER NOT NULL DEFAULT 0,
  sauna_male INTEGER NOT NULL DEFAULT 0,
  sauna_female INTEGER NOT NULL DEFAULT 0,
  guide_last_name VARCHAR(100) NOT NULL,
  guide_first_name VARCHAR(100) NOT NULL,
  guide_phone VARCHAR(20) NOT NULL,
  bus_number VARCHAR(50) NOT NULL DEFAULT '',
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
`;

let initialized = false;

export async function getPool(): Promise<Pool> {
  if (!initialized) {
    try {
      await pool.query(SCHEMA_SQL);
      initialized = true;
    } catch (err) {
      console.error('Failed to initialize database schema:', err);
      throw err;
    }
  }
  return pool;
}

export async function query(text: string, params?: unknown[]) {
  const p = await getPool();
  return p.query(text, params);
}

export default pool;
