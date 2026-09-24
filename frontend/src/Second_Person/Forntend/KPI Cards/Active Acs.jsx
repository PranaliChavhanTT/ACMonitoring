import React from "react";

function Active_Acs({ value = 0 }) {
  return (
    <div className="kpi-card">
      <div className="kpi-icon">🟢</div>

      <div className="kpi-content">
        <p>Active ACs</p>

        <h2>{value}</h2>

        <span>Currently Running</span>
      </div>
    </div>
  );
}

export default Active_Acs;