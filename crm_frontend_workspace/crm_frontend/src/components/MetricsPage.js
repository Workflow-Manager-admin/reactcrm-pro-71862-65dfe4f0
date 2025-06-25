import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "../App";
import { api } from "../utils/api";
import ChartWidget from "./ChartWidget";

// PUBLIC_INTERFACE
const MetricsPage = () => {
  const { token } = useContext(UserContext);
  const [taskMetrics, setTaskMetrics] = useState(null);
  const [interactionMetrics, setInteractionMetrics] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      const [tasks, inter, custs] = await Promise.all([
        api("/metrics/tasks", "GET", token),
        api("/metrics/interactions", "GET", token),
        api("/customers", "GET", token),
      ]);
      setTaskMetrics(tasks.metrics || {});
      setInteractionMetrics(inter.metrics || {});
      setCustomers(custs.customers || []);
      setLoading(false);
    }
    fetchAll();
  }, [token]);

  function custName(id) { return customers.find(c => c.id === Number(id))?.name || "(unknown)"; }

  // Tasks: total & completed per customer bar chart
  const taskData = [
    ...(taskMetrics?.total || []).map(row => ({
      customer: custName(row.customer_id),
      total: Number(row.total),
      completed: +(taskMetrics.completed.find(c => c.customer_id === row.customer_id)?.completed || 0),
    }))
  ];
  // Interactions: count by type bar chart
  const interactionData = {};
  (interactionMetrics?.byType || []).forEach(row => {
    if (!interactionData[row.customer_id]) interactionData[row.customer_id] = {};
    interactionData[row.customer_id][row.type] = +row.count;
  });

  return (
    <div>
      <div className="crm-section-title">Metrics & Visualization</div>
      {loading && <div>Loading metrics...</div>}
      {!loading && (
        <div>
          <div className="crm-flex-row">
            <ChartWidget
              title="Tasks by Customer"
              chartType="bar"
              data={taskData}
              labels={taskData.map(r => r.customer)}
              series={[
                { label: "Total Tasks", data: taskData.map(r => r.total) },
                { label: "Completed Tasks", data: taskData.map(r => r.completed) }
              ]}
            />
            <ChartWidget
              title="Interactions per Customer"
              chartType="stackedBar"
              data={interactionData}
              labels={Object.keys(interactionData).map(cid => custName(cid))}
              series={["call", "meeting", "email"].map(t => ({
                label: t[0].toUpperCase() + t.slice(1),
                data: Object.values(interactionData).map(ints => ints[t] || 0),
              }))}
            />
          </div>
          <div style={{ marginTop: 40, color: "var(--text-light)", fontSize: "0.98em" }}>
            Use these metrics to monitor CRM activity and productivity by customer!
          </div>
        </div>
      )}
    </div>
  );
};

export default MetricsPage;
