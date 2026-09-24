import React from "react";

function Total_Energy({ value = 0 }) {
  return (
    <div className="kpi-card">
      <div className="kpi-icon">📊</div>

      <div className="kpi-content">
        <p>Total Energy</p>

        <h2>{Number(value).toFixed(2)}</h2>

        <span>kWh</span>
      </div>
    </div>
  );
}

export default Total_Energy;
