import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "../App";
import { api } from "../utils/api";
import Modal from "./Modal";

// PUBLIC_INTERFACE
const TasksPage = () => {
  const { token } = useContext(UserContext);
  const [tasks, setTasks] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalTask, setModalTask] = useState(null);
  const [error, setError] = useState("");

  async function fetchCustomers() {
    const res = await api("/customers", "GET", token);
    setCustomers(res.customers || []);
    if (!selectedCustomer && res.customers?.length) setSelectedCustomer(res.customers[0].id);
  }
  async function fetchTasks(customerId) {
    if (!customerId) return;
    setLoading(true);
    const res = await api(`/customers/${customerId}/tasks`, "GET", token);
    setTasks(res.tasks || []);
    setLoading(false);
  }
  useEffect(() => { fetchCustomers(); }, [token]);
  useEffect(() => { if (selectedCustomer) fetchTasks(selectedCustomer); }, [selectedCustomer]);

  const handleFormSubmit = async (obj) => {
    setError("");
    let res;
    if (obj.id) {
      res = await api("/tasks/" + obj.id, "PUT", token, obj);
    } else {
      res = await api(`/customers/${obj.customer_id}/tasks`, "POST", token, obj);
    }
    if (res.status === "ok") {
      fetchTasks(obj.customer_id);
      setShowModal(false);
    } else setError(res.message || "Operation failed.");
  };
  const handleDelete = async (id) => {
    if (!window.confirm("Delete task?")) return;
    const res = await api("/tasks/" + id, "DELETE", token);
    if (res.status === "ok") fetchTasks(selectedCustomer);
    else setError(res.message || "Delete failed.");
  };

  return (
    <div>
      <div className="crm-section-title">Tasks</div>
      <div className="crm-search-bar">
        <select className="crm-select" style={{ width: 210 }} value={selectedCustomer} onChange={e => setSelectedCustomer(e.target.value)}>
          {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <button className="crm-btn light" onClick={() => { setModalTask(null); setShowModal(true); }}>
          + Add Task
        </button>
        {loading && <span style={{ marginLeft: '10px' }}>Loading...</span>}
      </div>
      <div className="crm-table-container">
        <table className="crm-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Due Date</th>
              <th>Status</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((t) => (
              <tr key={t.id}>
                <td>{t.title}</td>
                <td>{(new Date(t.due_date)).toLocaleDateString()}</td>
                <td>{t.status}</td>
                <td>{t.description}</td>
                <td>
                  <button className="crm-btn" onClick={() => { setModalTask(t); setShowModal(true); }}>Edit</button>
                  <button className="crm-btn danger" onClick={() => handleDelete(t.id)}>Delete</button>
                </td>
              </tr>
            ))}
            {!tasks.length && (
              <tr>
                <td colSpan={5} className="crm-text-light" style={{ textAlign: "center" }}>No tasks found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {showModal && <TaskModal
        task={modalTask}
        customerOptions={customers}
        selectedCustomer={selectedCustomer}
        onClose={() => { setShowModal(false); setModalTask(null); setError(""); }}
        onSubmit={handleFormSubmit}
        error={error}
      />}
    </div>
  );
};

const statusOptions = ["pending", "completed"];
const TaskModal = ({ task, customerOptions, selectedCustomer, onClose, onSubmit, error }) => {
  const [form, setForm] = useState({
    customer_id: task?.customer_id || selectedCustomer || "",
    title: task?.title || "",
    due_date: task?.due_date ? new Date(task.due_date).toISOString().slice(0, 10) : "",
    status: task?.status || "pending",
    description: task?.description || "",
  });
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) { setForm({ ...form, [e.target.name]: e.target.value }); }
  function validate() {
    if (!form.customer_id) return "Select customer.";
    if (!form.title.trim()) return "Title required.";
    if (!form.due_date) return "Due date required.";
    if (!statusOptions.includes(form.status)) return "Pick status.";
    return "";
  }
  async function handleSubmit(e) {
    e.preventDefault();
    const vErr = validate();
    setFormError(vErr);
    if (vErr) return;
    setLoading(true);
    await onSubmit({ ...form, id: task?.id });
    setLoading(false);
  }
  return (
    <Modal onClose={onClose}>
      <form onSubmit={handleSubmit} autoComplete="off">
        <div style={{ fontWeight: 700, marginBottom: 12, color: "var(--primary)" }}>
          {task ? "Edit Task" : "Create Task"}
        </div>
        <div className="crm-form-group">
          <label className="crm-form-label" htmlFor="customer_id">Customer</label>
          <select className="crm-select" name="customer_id" id="customer_id" value={form.customer_id} onChange={handleChange} required>
            {customerOptions.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="crm-form-group">
          <label className="crm-form-label" htmlFor="title">Title</label>
          <input className="crm-input" name="title" id="title" type="text"
            value={form.title} onChange={handleChange} required />
        </div>
        <div className="crm-form-group">
          <label className="crm-form-label" htmlFor="due_date">Due Date</label>
          <input className="crm-input" name="due_date" id="due_date" type="date"
            value={form.due_date} onChange={handleChange} required />
        </div>
        <div className="crm-form-group">
          <label className="crm-form-label" htmlFor="status">Status</label>
          <select className="crm-select" name="status" id="status" value={form.status} onChange={handleChange} required>
            {statusOptions.map(t => <option value={t} key={t}>{t}</option>)}
          </select>
        </div>
        <div className="crm-form-group">
          <label className="crm-form-label" htmlFor="description">Description</label>
          <textarea className="crm-textarea" name="description" id="description" value={form.description} onChange={handleChange} />
        </div>
        {formError && <div className="crm-error crm-mb-1">{formError}</div>}
        {error && <div className="crm-error crm-mb-1">{error}</div>}
        <div className="crm-modal-actions">
          <button className="crm-btn" type="submit" disabled={loading}>{loading ? "Saving..." : task ? "Save" : "Create"}</button>
          <button className="crm-btn light" onClick={onClose} type="button">Cancel</button>
        </div>
      </form>
    </Modal>
  );
};
export default TasksPage;
