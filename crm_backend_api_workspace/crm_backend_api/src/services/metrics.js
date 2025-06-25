const db = require('../db');

class MetricsService {
  // PUBLIC_INTERFACE
  async getTaskMetrics(ownerId) {
    // Aggregated: total, completed, pending per customer
    const total = await db.query(
      'SELECT customer_id, COUNT(*) as total FROM tasks WHERE owner_id=$1 GROUP BY customer_id',
      [ownerId]
    );
    const completed = await db.query(
      "SELECT customer_id, COUNT(*) as completed FROM tasks WHERE owner_id=$1 AND status='completed' GROUP BY customer_id",
      [ownerId]
    );
    return {
      total: total.rows,
      completed: completed.rows,
    };
  }

  async getInteractionMetrics(ownerId) {
    const count = await db.query(
      "SELECT customer_id, type, COUNT(*) as count FROM interactions WHERE owner_id=$1 GROUP BY customer_id,type",
      [ownerId]
    );
    return {
      byType: count.rows,
    };
  }
}

module.exports = new MetricsService();
