import React from "react";

function Alerts({ value = 0 }) {
  return (
    <div className="kpi-card">
      <div className="kpi-icon">⚠️</div>

      <div className="kpi-content">
        <p>Alerts</p>

        <h2>{value}</h2>

        <span>Active Alerts</span>
      </div>
    </div>
  );
}

export default Alerts;