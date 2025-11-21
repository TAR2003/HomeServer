import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export interface MediaRecord {
  id: string;
  name: string;
  type: string;
  path: string;
  thumbnail: string;
  size: number;
  uploaded_at: string;
  category: string;
}

export async function initDatabase() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS media (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        path TEXT NOT NULL,
        thumbnail TEXT,
        size BIGINT NOT NULL,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        category VARCHAR(50) NOT NULL
      );
      
      CREATE INDEX IF NOT EXISTS idx_media_category ON media(category);
      CREATE INDEX IF NOT EXISTS idx_media_type ON media(type);
    `);
  } finally {
    client.release();
  }
}

export async function getAllMedia(): Promise<MediaRecord[]> {
  const result = await pool.query(
    "SELECT * FROM media ORDER BY uploaded_at DESC"
  );
  return result.rows;
}

export async function getMediaById(id: string): Promise<MediaRecord | null> {
  const result = await pool.query("SELECT * FROM media WHERE id = $1", [id]);
  return result.rows[0] || null;
}

export async function createMediaRecord(
  data: Omit<MediaRecord, "id" | "uploaded_at">
): Promise<MediaRecord> {
  const result = await pool.query(
    `INSERT INTO media (name, type, path, thumbnail, size, category)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [data.name, data.type, data.path, data.thumbnail, data.size, data.category]
  );
  return result.rows[0];
}

export async function deleteMediaRecord(id: string): Promise<boolean> {
  const result = await pool.query("DELETE FROM media WHERE id = $1", [id]);
  return result.rowCount! > 0;
}

export default pool;
