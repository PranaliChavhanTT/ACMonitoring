// // import React from "react";

// // function Active_Power({ value = 0 }) {
// //   return (
// //     <div className="kpi-card">
// //       <div className="kpi-icon">⚡</div>

// //       <div className="kpi-content">
// //         <p>Active Power</p>

// //         <h2>{Number(value).toFixed(2)}</h2>

// //         <span>W</span>
// //       </div>
// //     </div>
// //   );
// // }

// // export default Active_Power;


// import React, { useEffect, useMemo, useRef, useState } from "react";
// import {
//   ResponsiveContainer,
//   LineChart,
//   Line,
//   CartesianGrid,
//   XAxis,
//   YAxis,
//   Tooltip,
// } from "recharts";

// /* ------------------------------------------------------------------
//    CurrentFluctuationChart — live current, no average, no stats

//    Props:
//      data        : array   — optional seed data (e.g. last N readings
//                              from the API). Shape:
//                              { timestamp | time, current | ampere | amps }
//      liveCurrent : number  — the current (A) reading coming in on every
//                              poll / websocket message
//      maxPoints   : number  — rolling window size (default 60)
//      interval    : number  — ms between auto-samples (default 2000).
//                              Set to 0 to sample only when liveCurrent changes.
//      unit        : string  — unit label (default "A")
//      lineColor   : string  — line color (default "#3182BD")
// ------------------------------------------------------------------- */

// const DEFAULT_MAX_POINTS = 60;
// const DEFAULT_INTERVAL   = 2000;

// const formatTime = (date = new Date()) =>
//   `${String(date.getHours()).padStart(2, "0")}:${String(
//     date.getMinutes()
//   ).padStart(2, "0")}:${String(date.getSeconds()).padStart(2, "0")}`;

// const pickNumber = (item) =>
//   Number(item?.current ?? item?.ampere ?? item?.amps ?? item?.value ?? 0) || 0;

// function CurrentFluctuationChart({
//   data = [],
//   liveCurrent = 0,
//   maxPoints = DEFAULT_MAX_POINTS,
//   interval = DEFAULT_INTERVAL,
//   unit = "A",
//   lineColor = "#3182BD",
// }) {
//   const [buffer, setBuffer] = useState([]);
//   const liveRef = useRef(Number(liveCurrent) || 0);
//   const lastValueRef = useRef(null);

//   /* Keep latest live value in a ref so the interval callback sees it */
//   useEffect(() => {
//     liveRef.current = Number(liveCurrent) || 0;
//   }, [liveCurrent]);

//   /* -------- Seed from prop data (once / when it changes) -------- */
//   useEffect(() => {
//     if (!Array.isArray(data) || data.length === 0) return;

//     const seeded = data.slice(-maxPoints).map((item, index) => {
//       const raw = item?.timestamp ?? item?.time ?? item?.date;
//       const label = raw ? formatTime(new Date(raw)) : `T-${data.length - index}`;
//       return { name: label, current: pickNumber(item) };
//     });

//     setBuffer(seeded);
//   }, [data, maxPoints]);

//   /* -------- Auto-sample on a timer -------- */
//   useEffect(() => {
//     if (!interval || interval <= 0) return undefined;

//     const id = setInterval(() => {
//       const value = liveRef.current;
//       const label = formatTime();

//       setBuffer((prev) => {
//         const next = [...prev, { name: label, current: value }];
//         return next.length > maxPoints
//           ? next.slice(next.length - maxPoints)
//           : next;
//       });

//       lastValueRef.current = value;
//     }, interval);

//     return () => clearInterval(id);
//   }, [interval, maxPoints]);

//   /* -------- Push immediately when liveCurrent changes (opt-in) -------- */
//   useEffect(() => {
//     if (interval && interval > 0) return; // timer mode handles it

//     const value = Number(liveCurrent) || 0;
//     if (value === lastValueRef.current) return;
//     lastValueRef.current = value;

//     setBuffer((prev) => {
//       const next = [...prev, { name: formatTime(), current: value }];
//       return next.length > maxPoints
//         ? next.slice(next.length - maxPoints)
//         : next;
//     });
//   }, [liveCurrent, interval, maxPoints]);

//   const isEmpty = buffer.length === 0;
//   const lastReading = buffer.length ? buffer[buffer.length - 1].current : 0;

//   return (
//     <div className="chart-box">
//       <div className="chart-header">
//         <h3>⚡Active Power </h3>

//         <span
//           style={{
//             fontSize: 13,
//             fontWeight: 600,
//             color: lineColor,
//             fontVariantNumeric: "tabular-nums",
//           }}
//         >
//           {lastReading.toFixed(2)} {unit}
//         </span>
//       </div>

//       <ResponsiveContainer width="100%" height={250}>
//         <LineChart
//           data={buffer}
//           margin={{ top: 8, right: 16, bottom: 0, left: 0 }}
//         >
//           <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

//           <XAxis
//             dataKey="name"
//             tick={{ fontSize: 11 }}
//             interval="preserveStartEnd"
//             minTickGap={24}
//           />

//           <YAxis
//             tick={{ fontSize: 11 }}
//             label={{
//               value: `Current (${unit})`,
//               angle: -90,
//               position: "insideLeft",
//               fontSize: 11,
//             }}
//             domain={["auto", "auto"]}
//             width={52}
//           />

//           <Tooltip
//             formatter={(value) => [
//               `${Number(value).toFixed(2)} ${unit}`,
//               "Current",
//             ]}
//             labelFormatter={(label) => `Time: ${label}`}
//           />

//           <Line
//             type="monotone"
//             dataKey="current"
//             name="Current"
//             stroke={lineColor}
//             strokeWidth={2.5}
//             dot={false}
//             activeDot={{ r: 4 }}
//             isAnimationActive={false}
//           />
//         </LineChart>
//       </ResponsiveContainer>

//       {isEmpty && (
//         <div
//           style={{
//             textAlign: "center",
//             fontSize: 12,
//             color: "#94a3b8",
//             marginTop: 6,
//           }}
//         >
//           Waiting for live current readings…
//         </div>
//       )}
//     </div>
//   );
// }

// export default CurrentFluctuationChart;


import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

/* ------------------------------------------------------------------
   CurrentFluctuationChart — live current, no average, no stats

   Props:
     data        : array   — optional seed data (e.g. last N readings
                             from the API). Shape:
                             { timestamp | time, current | ampere | amps }
     liveCurrent : number  — the current (A) reading coming in on every
                             poll / websocket message
     maxPoints   : number  — rolling window size (default 60)
     interval    : number  — ms between auto-samples (default 2000).
                             Set to 0 to sample only when liveCurrent changes.
     unit        : string  — unit label (default "A")
     lineColor   : string  — line color (default "#3182BD")
------------------------------------------------------------------- */

const DEFAULT_MAX_POINTS = 60;
const DEFAULT_INTERVAL   = 2000;

const formatTime = (date = new Date()) =>
  `${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes()
  ).padStart(2, "0")}:${String(date.getSeconds()).padStart(2, "0")}`;

const pickNumber = (item) =>
  Number(item?.current ?? item?.ampere ?? item?.amps ?? item?.value ?? 0) || 0;

function CurrentFluctuationChart({
  data = [],
  liveCurrent = 0,
  maxPoints = DEFAULT_MAX_POINTS,
  interval = DEFAULT_INTERVAL,
  unit = "A",
  lineColor = "#3182BD",
}) {
  const [buffer, setBuffer] = useState([]);
  const liveRef = useRef(Number(liveCurrent) || 0);
  const lastValueRef = useRef(null);

  /* Keep latest live value in a ref so the interval callback sees it */
  useEffect(() => {
    liveRef.current = Number(liveCurrent) || 0;
  }, [liveCurrent]);

  /* -------- Seed from prop data (once / when it changes) -------- */
  useEffect(() => {
    if (!Array.isArray(data) || data.length === 0) return;

    const seeded = data.slice(-maxPoints).map((item, index) => {
      const raw = item?.timestamp ?? item?.time ?? item?.date;
      const label = raw ? formatTime(new Date(raw)) : `T-${data.length - index}`;
      return { name: label, current: pickNumber(item) };
    });

    setBuffer(seeded);
  }, [data, maxPoints]);

  /* -------- Auto-sample on a timer -------- */
  useEffect(() => {
    if (!interval || interval <= 0) return undefined;

    const id = setInterval(() => {
      const value = liveRef.current;
      const label = formatTime();

      setBuffer((prev) => {
        const next = [...prev, { name: label, current: value }];
        return next.length > maxPoints
          ? next.slice(next.length - maxPoints)
          : next;
      });

      lastValueRef.current = value;
    }, interval);

    return () => clearInterval(id);
  }, [interval, maxPoints]);

  /* -------- Push immediately when liveCurrent changes (opt-in) -------- */
  useEffect(() => {
    if (interval && interval > 0) return; // timer mode handles it

    const value = Number(liveCurrent) || 0;
    if (value === lastValueRef.current) return;
    lastValueRef.current = value;

    setBuffer((prev) => {
      const next = [...prev, { name: formatTime(), current: value }];
      return next.length > maxPoints
        ? next.slice(next.length - maxPoints)
        : next;
    });
  }, [liveCurrent, interval, maxPoints]);

  const isEmpty = buffer.length === 0;
  const lastReading = buffer.length ? buffer[buffer.length - 1].current : 0;

  return (
    <div className="chart-box">
      <div className="chart-header">
        {/* <h3>▥ Current Fluctuation (Live)</h3> */}
        <h3>⚡Active Power </h3>


        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: lineColor,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {lastReading.toFixed(2)} {unit}
        </span>
      </div>

      <ResponsiveContainer width="100%" height={250}>
        <LineChart
          data={buffer}
          margin={{ top: 8, right: 16, bottom: 0, left: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

          <XAxis
            dataKey="name"
            tick={{ fontSize: 11 }}
            interval="preserveStartEnd"
            minTickGap={24}
          />

          <YAxis
            tick={{ fontSize: 11 }}
            label={{
              value: `Current (${unit})`,
              angle: -90,
              position: "insideLeft",
              fontSize: 11,
            }}
            domain={["auto", "auto"]}
            width={52}
          />

          <Tooltip
            formatter={(value) => [
              `${Number(value).toFixed(2)} ${unit}`,
              "Current",
            ]}
            labelFormatter={(label) => `Time: ${label}`}
          />

          <Line
            type="monotone"
            dataKey="current"
            name="Current"
            stroke={lineColor}
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>

      {isEmpty && (
        <div
          style={{
            textAlign: "center",
            fontSize: 12,
            color: "#94a3b8",
            marginTop: 6,
          }}
        >
          Waiting for live current readings…
        </div>
      )}
    </div>
  );
}

export default CurrentFluctuationChart;