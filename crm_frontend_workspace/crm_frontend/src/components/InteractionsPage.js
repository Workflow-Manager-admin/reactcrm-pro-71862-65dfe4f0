import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "../App";
import { api } from "../utils/api";
import Modal from "./Modal";

// PUBLIC_INTERFACE
const InteractionsPage = () => {
  const { token } = useContext(UserContext);
  const [data, setData] = useState([]); // { customer_id, ...interaction }
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalInteraction, setModalInteraction] = useState(null);
  const [error, setError] = useState("");

  async function fetchCustomers() {
    const res = await api("/customers", "GET", token);
    setCustomers(res.customers || []);
    if (!selectedCustomer && res.customers?.length) setSelectedCustomer(res.customers[0].id);
  }
  async function fetchInteractions(customerId) {
    if (!customerId) return;
    setLoading(true);
    const res = await api(`/customers/${customerId}/interactions`, "GET", token);
    setData(res.interactions || []);
    setLoading(false);
  }

  useEffect(() => { fetchCustomers(); }, [token]);
  useEffect(() => { if (selectedCustomer) fetchInteractions(selectedCustomer); }, [selectedCustomer]);

  const handleFormSubmit = async (obj) => {
    setError("");
    let res;
    if (obj.id) {
      res = await api("/interactions/" + obj.id, "PUT", token, obj);
    } else {
      res = await api(`/customers/${obj.customer_id}/interactions`, "POST", token, obj);
    }
    if (res.status === "ok") {
      fetchInteractions(obj.customer_id);
      setShowModal(false);
    } else setError(res.message || "Operation failed.");
  };
  const handleDelete = async (id) => {
    if (!window.confirm("Delete interaction?")) return;
    const res = await api("/interactions/" + id, "DELETE", token);
    if (res.status === "ok") fetchInteractions(selectedCustomer);
    else setError(res.message || "Delete failed.");
  };

  return (
    <div>
      <div className="crm-section-title">Interactions</div>
      <div className="crm-search-bar">
        <select
          className="crm-select"
          style={{ width: 210 }}
          value={selectedCustomer}
          onChange={e => setSelectedCustomer(e.target.value)}
        >
          {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <button className="crm-btn light" onClick={() => { setModalInteraction(null); setShowModal(true); }}>
          + Add Interaction
        </button>
        {loading && <span style={{ marginLeft: '10px' }}>Loading...</span>}
      </div>
      <div className="crm-table-container">
        <table className="crm-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Description</th>
              <th>Timestamp</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((i) => (
              <tr key={i.id}>
                <td>{i.type}</td>
                <td>{i.description}</td>
                <td>{(new Date(i.timestamp)).toLocaleString()}</td>
                <td>
                  <button className="crm-btn" onClick={() => { setModalInteraction(i); setShowModal(true); }}>Edit</button>
                  <button className="crm-btn danger" onClick={() => handleDelete(i.id)}>Delete</button>
                </td>
              </tr>
            ))}
            {!data.length && (
              <tr>
                <td colSpan={4} className="crm-text-light" style={{ textAlign: "center" }}>No interactions found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {showModal && <InteractionModal
        interaction={modalInteraction}
        customerOptions={customers}
        selectedCustomer={selectedCustomer}
        onClose={() => { setShowModal(false); setModalInteraction(null); setError(""); }}
        onSubmit={handleFormSubmit}
        error={error}
      />}
    </div>
  );
};

const types = ["call", "meeting", "email"];
const InteractionModal = ({ interaction, customerOptions, selectedCustomer, onClose, onSubmit, error }) => {
  const [form, setForm] = useState({
    customer_id: interaction?.customer_id || selectedCustomer || "",
    type: interaction?.type || types[0],
    description: interaction?.description || "",
    timestamp: interaction?.timestamp ? new Date(interaction.timestamp).toISOString().slice(0, 16) : (new Date()).toISOString().slice(0, 16),
  });
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) { setForm({ ...form, [e.target.name]: e.target.value }); }
  function validate() {
    if (!form.customer_id) return "Select customer.";
    if (!types.includes(form.type)) return "Select interaction type.";
    if (!form.description.trim()) return "Provide a description.";
    return "";
  }
  async function handleSubmit(e) {
    e.preventDefault();
    const vErr = validate();
    setFormError(vErr);
    if (vErr) return;
    setLoading(true);
    await onSubmit({
      ...form,
      timestamp: (new Date(form.timestamp)).toISOString(),
      id: interaction?.id
    });
    setLoading(false);
  }
  return (
    <Modal onClose={onClose}>
      <form onSubmit={handleSubmit} autoComplete="off">
        <div style={{ fontWeight: 700, marginBottom: 12, color: "var(--primary)" }}>
          {interaction ? "Edit Interaction" : "Log Interaction"}
        </div>
        <div className="crm-form-group">
          <label className="crm-form-label" htmlFor="customer_id">Customer</label>
          <select className="crm-select" name="customer_id" id="customer_id" value={form.customer_id} onChange={handleChange} required>
            {customerOptions.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="crm-form-group">
          <label className="crm-form-label" htmlFor="type">Type</label>
          <select className="crm-select" name="type" id="type" value={form.type} onChange={handleChange} required>
            {types.map(t => <option value={t} key={t}>{t}</option>)}
          </select>
        </div>
        <div className="crm-form-group">
          <label className="crm-form-label" htmlFor="description">Description</label>
          <textarea className="crm-textarea" name="description" id="description" value={form.description} onChange={handleChange} required />
        </div>
        <div className="crm-form-group">
          <label className="crm-form-label" htmlFor="timestamp">Datetime</label>
          <input className="crm-input" type="datetime-local"
            name="timestamp" id="timestamp"
            value={form.timestamp}
            onChange={handleChange} required />
        </div>
        {formError && <div className="crm-error crm-mb-1">{formError}</div>}
        {error && <div className="crm-error crm-mb-1">{error}</div>}
        <div className="crm-modal-actions">
          <button className="crm-btn" type="submit" disabled={loading}>{loading ? "Saving..." : interaction ? "Save" : "Create"}</button>
          <button className="crm-btn light" onClick={onClose} type="button">Cancel</button>
        </div>
      </form>
    </Modal>
  );
};
export default InteractionsPage;
