import React, { useContext } from "react";
import { UserContext } from "../App";

// PUBLIC_INTERFACE
const Dashboard = () => {
  const { user } = useContext(UserContext);

  return (
    <div>
      <h2 className="crm-section-title">Dashboard</h2>
      <div style={{marginBottom: 20}}>Welcome, <strong>{user?.name}</strong>!</div>
      <div className="crm-flex-row">
        <div className="crm-chart-container">
          {/* Widget: quick links */}
          <div style={{fontSize: "1.07rem", fontWeight: 600, marginBottom: 14, color:"var(--primary)"}}>Quick Links</div>
          <ul style={{listStyle: "disc", paddingLeft: 22, fontSize: "1rem", color:"var(--secondary)"}}>
            <li><a href="/customers" className="crm-link">Go to Customers</a></li>
            <li><a href="/interactions" className="crm-link">Go to Interactions</a></li>
            <li><a href="/tasks" className="crm-link">Go to Tasks</a></li>
            <li><a href="/metrics" className="crm-link">Go to Metrics</a></li>
          </ul>
        </div>
        <div className="crm-chart-container">
          <div style={{fontSize: "1.07rem", fontWeight: 600, marginBottom: 10, color:"var(--primary)"}}>
            CRM Info
          </div>
          <table className="crm-table" style={{fontSize: "0.98em", background:"#fafbfc"}}>
            <tbody>
              <tr><td>Your Email</td><td><strong>{user?.email}</strong></td></tr>
              <tr><td>Registered</td><td>{user?.created_at ? (new Date(user.created_at)).toLocaleString() : ""}</td></tr>
            </tbody>
          </table>
        </div>
      </div>
      <div style={{marginTop:40, color:"var(--text-light)", fontSize:"1em"}}>
        Tip: Use the sidebar to access Customers, Tasks, Interactions, and view real-time metrics!
      </div>
    </div>
  );
};

export default Dashboard;
