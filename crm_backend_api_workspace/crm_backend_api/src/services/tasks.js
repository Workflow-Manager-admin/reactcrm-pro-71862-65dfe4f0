const db = require('../db');

class TasksService {
  // PUBLIC_INTERFACE
  async listTasks(ownerId, customerId) {
    const q = await db.query(
      'SELECT * FROM tasks WHERE owner_id = $1 AND customer_id = $2 ORDER BY due_date',
      [ownerId, customerId]
    );
    return q.rows;
  }

  async getTask(id, ownerId) {
    const q = await db.query('SELECT * FROM tasks WHERE id=$1 AND owner_id=$2', [id, ownerId]);
    return q.rows[0] || null;
  }

  async createTask({ customer_id, title, due_date, status='pending', description}, ownerId) {
    const q = await db.query(
      'INSERT INTO tasks (customer_id, owner_id, title, due_date, status, description) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [customer_id, ownerId, title, due_date, status, description]
    );
    return q.rows[0];
  }

  async updateTask(id, update, ownerId) {
    const cur = await this.getTask(id, ownerId);
    if (!cur) return null;
    const { title, due_date, status, description } = { ...cur, ...update };
    const q = await db.query(
      'UPDATE tasks SET title=$1, due_date=$2, status=$3, description=$4 WHERE id=$5 RETURNING *',
      [title, due_date, status, description, id]
    );
    return q.rows[0];
  }

  async deleteTask(id, ownerId) {
    const res = await db.query('DELETE FROM tasks WHERE id=$1 AND owner_id=$2', [id, ownerId]);
    return res.rowCount > 0;
  }
}

module.exports = new TasksService();
