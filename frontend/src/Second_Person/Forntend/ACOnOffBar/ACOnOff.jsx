
import React, { useEffect, useMemo, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import "./ACOnOff.css";

// const CURRENT_HISTORY_URL =
//   `${window.location.origin}/api/current-history/`;

const CURRENT_HISTORY_URL =
  "http://localhost:8000/api/current-history/";

const PERIOD_CONFIG = {
  "24h": {
    label: "Last 24 Hours",
    center: "24h",
    apiPeriod: "24h",
    durationMs: 24 * 60 * 60 * 1000,
    intervalSeconds: 60,
  },
  "7d": {
    label: "Last 7 Days",
    center: "7d",
    apiPeriod: "week",
    durationMs: 7 * 24 * 60 * 60 * 1000,
    intervalSeconds: 900,
  },
  "30d": {
    label: "Last 30 Days",
    center: "30d",
    apiPeriod: "month",
    durationMs: 30 * 24 * 60 * 60 * 1000,
    intervalSeconds: 3600,
  },
};

const COLORS = ["#16A34A", "#EF4444"];

const getToken = () =>
  localStorage.getItem("token") ||
  localStorage.getItem("authToken") ||
  localStorage.getItem("access_token") ||
  localStorage.getItem("accessToken") ||
  "";

const formatDuration = (ms) => {
  const minutes = Math.floor(ms / 60000);
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;

  if (hours === 0) return `${remaining}m`;
  return remaining ? `${hours}h ${remaining}m` : `${hours}h`;
};

const pickCurrent = (row) => {
  const candidates = [
    row?.avg,
    row?.avg_current,
    row?.current,
    row?.value,
    row?.amps,
  ];

  for (const value of candidates) {
    if (value === null || value === undefined || value === "") continue;

    const number = Number(value);
    if (Number.isFinite(number)) return number;
  }

  return null;
};

const pickTimestamp = (row) => {
  const raw =
    row?.bucket ??
    row?.bucket_start ??
    row?.timestamp ??
    row?.ts ??
    row?.time ??
    row?.datetime;

  if (!raw) return null;

  const timestamp = new Date(raw).getTime();

  return Number.isFinite(timestamp) ? timestamp : null;
};

const ACOnOff = ({
  deviceId = "",
  scope = {},
  endpoint = CURRENT_HISTORY_URL,
  period = "24h",
}) => {
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const scopeKey = useMemo(
    () => JSON.stringify(scope || {}),
    [scope]
  );
  const config = PERIOD_CONFIG[period] || PERIOD_CONFIG["24h"];

  // Fetch last 24 hours
  useEffect(() => {
    if (!deviceId && !scope?.branch) {
      setRows([]);
      setStatus("idle");
      return;
    }

    const controller = new AbortController();
    let cancelled = false;

    const load = async () => {
      setStatus((prev) =>
        prev === "loaded" ? prev : "loading"
      );

      try {
        const end = Date.now();
        const start = end - config.durationMs;

        const params = new URLSearchParams({
          key: "current",
          period: config.apiPeriod,
          interval_seconds: String(config.intervalSeconds),
          from: String(start),
          to: String(end),
        });

        if (deviceId) {
          params.set("device_id", String(deviceId));
          params.set("ac_id", String(deviceId));
        } else {
          Object.entries(scope || {}).forEach(([key, value]) => {
            if (value != null && String(value).trim()) {
              params.set(key, String(value));
            }
          });
        }

        const token = getToken();

        const response = await fetch(
          `${endpoint}?${params.toString()}`,
          {
            signal: controller.signal,
            headers: token
              ? { Authorization: `Bearer ${token}` }
              : {},
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const payload = await response.json();

        // const result = Array.isArray(payload?.data)
        //   ? payload.data
        //   : Array.isArray(payload?.results)
        //   ? payload.results
        //   : Array.isArray(payload)
        //   ? payload
        //   : [];

        const result = Array.isArray(payload?.series)
          ? payload.series
          : Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload?.results)
          ? payload.results
          : Array.isArray(payload)
          ? payload
          : [];

        if (cancelled) return;

        setRows(result);
        setStatus(result.length ? "loaded" : "empty");
        setError("");
      } catch (err) {
        if (err.name === "AbortError" || cancelled) return;

        console.error("[ACOnOff] Error:", err);
        setStatus("error");
        setError(err.message || "Unable to load AC history.");
      }
    };

    load();

    const interval = window.setInterval(load, 10000);

    return () => {
      cancelled = true;
      controller.abort();
      window.clearInterval(interval);
    };
  }, [deviceId, scopeKey, endpoint, period]);

  // Calculate ON/OFF duration for one AC
  // const runtime = useMemo(() => {
  //   const now = Date.now();
  //   const windowMs = 24 * 60 * 60 * 1000;
  //   const start = now - windowMs;

  //   const MINUTE = 60000;
  //   const BIN_COUNT = 1440;

  //   const states = Array(BIN_COUNT).fill(null);

  //   const sortedRows = [...rows]
  //     .map((row) => ({
  //       timestamp: pickTimestamp(row),
  //       current: pickCurrent(row),
  //     }))
  //     .filter(
  //       (row) =>
  //         row.timestamp !== null &&
  //         row.current !== null &&
  //         row.timestamp >= start &&
  //         row.timestamp <= now
  //     )
  //     .sort((a, b) => a.timestamp - b.timestamp);

  //   sortedRows.forEach((row) => {
  //     const index = Math.min(
  //       Math.floor((row.timestamp - start) / MINUTE),
  //       BIN_COUNT - 1
  //     );

  //     states[index] = row.current > 0.0001 ? "ON" : "OFF";
  //   });

  //   // Fill gaps using the last known state.
  //   let lastState = null;

  //   for (let i = 0; i < BIN_COUNT; i++) {
  //     if (states[i] !== null) {
  //       lastState = states[i];
  //     } else if (lastState !== null) {
  //       states[i] = lastState;
  //     }
  //   }

  //   // Do not assume OFF before the first known measurement.
  //   let onMinutes = 0;
  //   let offMinutes = 0;
  //   let unknownMinutes = 0;
  //   let onEvents = 0;

  //   for (let i = 0; i < BIN_COUNT; i++) {
  //     if (states[i] === "ON") {
  //       onMinutes++;
  //       if (i > 0 && states[i - 1] === "OFF") {
  //         onEvents++;
  //       }
  //     } else if (states[i] === "OFF") {
  //       offMinutes++;
  //     } else {
  //       unknownMinutes++;
  //     }
  //   }

  //   const knownMinutes = onMinutes + offMinutes;

  //   return {
  //     onMs: onMinutes * MINUTE,
  //     offMs: offMinutes * MINUTE,
  //     unknownMs: unknownMinutes * MINUTE,
  //     onEvents,
  //     onPercent: knownMinutes
  //       ? (onMinutes / knownMinutes) * 100
  //       : 0,
  //     offPercent: knownMinutes
  //       ? (offMinutes / knownMinutes) * 100
  //       : 0,
  //     knownMinutes,
  //   };
  // }, [rows]);

  const runtime = useMemo(() => {
    const now = Date.now();
    const windowMs = config.durationMs;
    const start = now - windowMs;

    const bucketMs = config.intervalSeconds * 1000;
    const BIN_COUNT = Math.ceil(windowMs / bucketMs);

    const states = Array(BIN_COUNT).fill(null);

    const sortedRows = [...rows]
      .map((row) => ({
        timestamp: pickTimestamp(row),
        current: pickCurrent(row),
      }))
      .filter(
        (row) =>
          row.timestamp !== null &&
          row.current !== null &&
          row.timestamp >= start &&
          row.timestamp <= now
      )
      .sort((a, b) => a.timestamp - b.timestamp);

    sortedRows.forEach((row) => {
      const index = Math.min(
        Math.floor((row.timestamp - start) / bucketMs),
        BIN_COUNT - 1
      );

      states[index] = row.current > 0.0001 ? "ON" : "OFF";
    });

    // Fill missing buckets using the last known state.
    let lastState = null;

    for (let i = 0; i < BIN_COUNT; i++) {
      if (states[i] !== null) {
        lastState = states[i];
      } else if (lastState !== null) {
        states[i] = lastState;
      }
    }

    let onBuckets = 0;
    let offBuckets = 0;
    let unknownBuckets = 0;
    let onEvents = 0;

    for (let i = 0; i < BIN_COUNT; i++) {
      if (states[i] === "ON") {
        onBuckets++;

        if (i > 0 && states[i - 1] === "OFF") {
          onEvents++;
        }
      } else if (states[i] === "OFF") {
        offBuckets++;
      } else {
        unknownBuckets++;
      }
    }

    const knownBuckets = onBuckets + offBuckets;

    return {
      onMs: onBuckets * bucketMs,
      offMs: offBuckets * bucketMs,
      unknownMs: unknownBuckets * bucketMs,
      onEvents,

      onPercent: knownBuckets
        ? (onBuckets / knownBuckets) * 100
        : 0,

      offPercent: knownBuckets
        ? (offBuckets / knownBuckets) * 100
        : 0,

      knownMinutes: knownBuckets,
    };
  }, [rows, config]);

  const chartData = [
    { name: "ON", value: runtime.onMs, color: COLORS[0] },
    { name: "OFF", value: runtime.offMs, color: COLORS[1] },
  ];

  return (
    <div className="ac-power-state-card">

      <div className="ac-power-state-header">
        <div className="ac-power-state-title">
          AC Runtime ({config.label})
        </div>

        <span className="ac-runtime-live">
          <span className="ac-runtime-dot" />
          Live
        </span>
      </div>

      {status === "loading" && (
        <div className="ac-runtime-message">
          Loading AC runtime...
        </div>
      )}

      {status === "error" && (
        <div className="ac-runtime-message error">
          {error}
        </div>
      )}

      {status === "empty" && (
        <div className="ac-runtime-message">
          No current history available.
        </div>
      )}

      {status === "loaded" && runtime.knownMinutes > 0 && (
        <>
          <div className="ac-runtime-chart">
            <ResponsiveContainer width="100%" height={230}>
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={90}
                  paddingAngle={1}
                  stroke="none"
                >
                  {chartData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={entry.color}
                    />
                  ))}
                </Pie>

                <Tooltip
                  formatter={(value, name) => [
                    formatDuration(value),
                    name,
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>

            <div className="ac-runtime-center">
              <strong>{config.center}</strong>
              <span>Runtime</span>
            </div>
          </div>

          <div className="ac-runtime-stats">

            <div className="ac-runtime-stat">
              <div className="ac-runtime-label">
                <span className="ac-runtime-indicator on" />
                ON TIME
              </div>

              <strong>
                {formatDuration(runtime.onMs)}
              </strong>

              <span>
                {runtime.onPercent.toFixed(1)}%
              </span>
            </div>

            <div className="ac-runtime-stat">
              <div className="ac-runtime-label">
                <span className="ac-runtime-indicator off" />
                OFF TIME
              </div>

              <strong>
                {formatDuration(runtime.offMs)}
              </strong>

              <span>
                {runtime.offPercent.toFixed(1)}%
              </span>
            </div>

          </div>

          {/* <div className="ac-runtime-events">
            ON Events: <strong>{runtime.onEvents}</strong>
          </div> */}

          {runtime.unknownMs > 0 && (
            <div className="ac-runtime-unknown">
              No data: {formatDuration(runtime.unknownMs)}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ACOnOff;
