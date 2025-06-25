import React, { useEffect, useState, useContext, useMemo } from "react";
import { UserContext } from "../App";
import { api } from "../utils/api";
import Modal from "./Modal";

// PUBLIC_INTERFACE
const CustomersPage = () => {
  const { token } = useContext(UserContext);
  const [customers, setCustomers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalCustomer, setModalCustomer] = useState(null); // null = create, otherwise edit
  const [error, setError] = useState("");
  const [csvLoading, setCsvLoading] = useState(false);

  async function fetchCustomers() {
    setLoading(true);
    const res = await api("/customers", "GET", token);
    setCustomers(res.customers || []);
    setLoading(false);
  }

  useEffect(() => { fetchCustomers(); }, [token]);
  useEffect(() => {
    if (!search) setFiltered(customers);
    else {
      const s = search.toLowerCase();
      setFiltered(customers.filter(c =>
        (c.name && c.name.toLowerCase().includes(s)) ||
        (c.email && c.email.toLowerCase().includes(s)) ||
        (c.company && c.company.toLowerCase().includes(s)) ||
        (c.phone && c.phone.toLowerCase().includes(s))
      ));
    }
  }, [customers, search]);

  // PUBLIC_INTERFACE
  const handleFormSubmit = async (customer) => {
    setError("");
    let res;
    if (customer.id) {
      res = await api("/customers/" + customer.id, "PUT", token, customer);
      if (res.status === "ok") {
        setCustomers(cs => cs.map(c => c.id === customer.id ? res.customer : c));
        setShowModal(false);
      } else setError(res.message || "Update failed");
    } else {
      res = await api("/customers", "POST", token, customer);
      if (res.status === "ok") {
        setCustomers(cs => [res.customer, ...cs]);
        setShowModal(false);
      } else setError(res.message || "Create failed");
    }
  };
  const handleDelete = async (id) => {
    if (!window.confirm("Delete customer? This cannot be undone.")) return;
    const res = await api("/customers/" + id, "DELETE", token);
    if (res.status === "ok") setCustomers(cs => cs.filter(c => c.id !== id));
    else setError(res.message || "Delete failed.");
  };

  const handleExport = async () => {
    setCsvLoading(true);
    try {
      const blob = await api("/customers-export", "GET", token, null, "blob");
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "customers.csv";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch { /* fail silently */ }
    setCsvLoading(false);
  };

  return (
    <div>
      <div className="crm-section-title">Customers</div>
      <div className="crm-search-bar">
        <input
          className="crm-input"
          placeholder="Search name/email/company/phone"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: 210 }}
        />
        <button className="crm-btn light" onClick={() => { setModalCustomer(null); setShowModal(true); }}>
          + Add Customer
        </button>
        <button className="crm-btn" disabled={csvLoading} onClick={handleExport}>
          Export CSV
        </button>
        {loading && <span style={{ marginLeft: '10px' }}>Loading...</span>}
      </div>
      <div className="crm-table-container">
        <table className="crm-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Company</th>
              <th>Phone</th>
              <th>Notes</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td>{c.email}</td>
                <td>{c.company}</td>
                <td>{c.phone}</td>
                <td>{c.notes}</td>
                <td>
                  <button className="crm-btn" onClick={() => { setModalCustomer(c); setShowModal(true); }}>Edit</button>
                  <button className="crm-btn danger" onClick={() => handleDelete(c.id)}>Delete</button>
                </td>
              </tr>
            ))}
            {!filtered.length && (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", color: "var(--text-light)" }}>No customers found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {showModal && (
        <CustomerModal
          customer={modalCustomer}
          onClose={() => { setShowModal(false); setModalCustomer(null); setError(""); }}
          onSubmit={handleFormSubmit}
          error={error}
        />
      )}
    </div>
  );
};

const CustomerModal = ({ customer, onClose, onSubmit, error }) => {
  const [form, setForm] = useState({
    name: customer?.name || "",
    email: customer?.email || "",
    company: customer?.company || "",
    phone: customer?.phone || "",
    notes: customer?.notes || ""
  });
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) { setForm({ ...form, [e.target.name]: e.target.value }); }
  function validate() {
    if (!form.name.trim()) return "Name is required.";
    if (form.email && !/\S+@\S+\.\S+/.test(form.email)) return "Invalid email.";
    if (form.phone && !/^[0-9-\s()+]{7,32}$/.test(form.phone)) return "Invalid phone number.";
    return "";
  }
  async function handleSubmit(e) {
    e.preventDefault();
    const vErr = validate();
    setFormError(vErr);
    if (vErr) return;
    setLoading(true);
    await onSubmit({ ...form, id: customer?.id });
    setLoading(false);
  }
  return (
    <Modal onClose={onClose}>
      <form onSubmit={handleSubmit} autoComplete="off">
        <div style={{ fontWeight: 700, marginBottom: 14, color: "var(--primary)" }}>
          {customer ? "Edit Customer" : "Add Customer"}
        </div>
        <div className="crm-form-group">
          <label className="crm-form-label" htmlFor="name">Name</label>
          <input
            className="crm-input"
            name="name"
            id="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="crm-form-group">
          <label className="crm-form-label" htmlFor="email">Email</label>
          <input
            className="crm-input"
            name="email"
            id="email"
            type="email"
            value={form.email}
            onChange={handleChange}
          />
        </div>
        <div className="crm-form-group">
          <label className="crm-form-label" htmlFor="company">Company</label>
          <input
            className="crm-input"
            name="company"
            id="company"
            type="text"
            value={form.company}
            onChange={handleChange}
          />
        </div>
        <div className="crm-form-group">
          <label className="crm-form-label" htmlFor="phone">Phone</label>
          <input
            className="crm-input"
            name="phone"
            id="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
          />
        </div>
        <div className="crm-form-group">
          <label className="crm-form-label" htmlFor="notes">Notes</label>
          <textarea
            className="crm-textarea"
            name="notes"
            id="notes"
            value={form.notes}
            onChange={handleChange}
          />
        </div>
        {formError && <div className="crm-error crm-mb-1">{formError}</div>}
        {error && <div className="crm-error crm-mb-1">{error}</div>}
        <div className="crm-modal-actions">
          <button className="crm-btn" type="submit" disabled={loading}>{loading ? "Saving..." : customer ? "Save" : "Create"}</button>
          <button className="crm-btn light" onClick={onClose} type="button">Cancel</button>
        </div>
      </form>
    </Modal>
  );
};

export default CustomersPage;
