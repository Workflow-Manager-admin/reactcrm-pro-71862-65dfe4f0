const db = require('../db');
const { format } = require('date-fns');
const { PassThrough } = require('stream');
const { format: csvFormat } = require('@fast-csv/format');

class CustomersService {
  // PUBLIC_INTERFACE
  async listCustomers(ownerId) {
    const q = await db.query(
      'SELECT * FROM customers WHERE owner_id = $1 ORDER BY created_at DESC',
      [ownerId]
    );
    return q.rows;
  }

  async getCustomer(id, ownerId) {
    const q = await db.query('SELECT * FROM customers WHERE id=$1 AND owner_id=$2', [id, ownerId]);
    return q.rows[0] || null;
  }

  async createCustomer({ name, email, phone, company, notes, owner_id }) {
    const q = await db.query(
      'INSERT INTO customers (name,email,phone,company,notes,owner_id) VALUES($1,$2,$3,$4,$5,$6) RETURNING *',
      [name, email, phone, company, notes, owner_id]
    );
    return q.rows[0];
  }

  async updateCustomer(id, updates, ownerId) {
    const cur = await this.getCustomer(id, ownerId);
    if (!cur) return null;
    const { name, email, phone, company, notes } = { ...cur, ...updates };
    const res = await db.query(
      'UPDATE customers SET name=$1, email=$2, phone=$3, company=$4, notes=$5 WHERE id=$6 RETURNING *',
      [name, email, phone, company, notes, id]
    );
    return res.rows[0];
  }

  async deleteCustomer(id, ownerId) {
    const res = await db.query('DELETE FROM customers WHERE id=$1 AND owner_id=$2', [id, ownerId]);
    return res.rowCount > 0;
  }

  async exportCustomersCSV(ownerId) {
    const rows = await this.listCustomers(ownerId);
    const csvStream = new PassThrough();
    const csv = csvFormat({ headers: true });
    csv.pipe(csvStream);
    rows.forEach(r => {
      csv.write({
        id: r.id,
        name: r.name,
        email: r.email,
        phone: r.phone,
        company: r.company,
        notes: r.notes,
        created_at: format(new Date(r.created_at), 'yyyy-MM-dd HH:mm:ss'),
      });
    });
    csv.end();
    return csvStream;
  }
}

module.exports = new CustomersService();
