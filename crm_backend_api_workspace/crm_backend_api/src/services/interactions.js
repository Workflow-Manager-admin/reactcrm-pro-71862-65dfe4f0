const db = require('../db');

class InteractionsService {
  // PUBLIC_INTERFACE
  async listInteractions(ownerId, customerId) {
    const q = await db.query(
      'SELECT * FROM interactions WHERE owner_id = $1 AND customer_id = $2 ORDER BY timestamp DESC',
      [ownerId, customerId]
    );
    return q.rows;
  }

  async getInteraction(id, ownerId) {
    const q = await db.query('SELECT * FROM interactions WHERE id=$1 AND owner_id=$2', [id, ownerId]);
    return q.rows[0] || null;
  }

  async createInteraction({ customer_id, type, description, timestamp }, ownerId) {
    const ts = timestamp ? new Date(timestamp) : new Date();
    const q = await db.query(
      'INSERT INTO interactions (customer_id, owner_id, type, description, timestamp) VALUES($1, $2, $3, $4, $5) RETURNING *',
      [customer_id, ownerId, type, description, ts]
    );
    return q.rows[0];
  }

  async updateInteraction(id, update, ownerId) {
    const cur = await this.getInteraction(id, ownerId);
    if (!cur) return null;
    const { type, description, timestamp } = { ...cur, ...update };
    const q = await db.query(
      'UPDATE interactions SET type = $1, description = $2, timestamp=$3 WHERE id = $4 RETURNING *',
      [type, description, timestamp || cur.timestamp, id]
    );
    return q.rows[0];
  }

  async deleteInteraction(id, ownerId) {
    const res = await db.query('DELETE FROM interactions WHERE id=$1 AND owner_id=$2', [id, ownerId]);
    return res.rowCount > 0;
  }
}

module.exports = new InteractionsService();
