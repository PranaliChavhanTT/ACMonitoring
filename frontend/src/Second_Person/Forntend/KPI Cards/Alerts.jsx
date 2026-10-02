import React from "react";

function Alerts({ data = [], active = false, onClick }) {
  const alertCount = data.filter(
    (item) => Number(item.alarm_status) === 1
  ).length;

  return (
    <button
      type="button"
      className="kpi-card"
      onClick={onClick}
      title={active ? "Showing alert ACs. Click to clear." : "Show alert ACs"}
      style={{
        textAlign: "left",
        width: "100%",
        cursor: onClick ? "pointer" : "default",
        border: active ? "2px solid #dc2626" : undefined,
      }}
    >
      <div className="kpi-icon">⚠️</div>

      <div className="kpi-content">
        <p>Alerts</p>
        <h2>{alertCount}</h2>
        <span>{active ? "Filtered Alerts" : "Active Alerts"}</span>
      </div>
    </button>
  );
}

export default Alerts;
