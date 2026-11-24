// import React, { useEffect, useMemo, useState } from "react";
// import { Clock } from "lucide-react";

// import {
//   DEFAULT_TIME_RANGE,
//   LIVE,
//   MAX_RANGE_DAYS,
//   TIME_PRESETS,
//   isWindowed,
//   resolveTimeRange,
//   validateTimeRange,
// } from "./TimeRangeContext";

// const pad2 = (n) => String(n).padStart(2, "0");
// const toLocalInput = (ms) => {
//   const d = new Date(ms);
//   return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
// };

// const formatStamp = (ms) =>
//   new Date(ms).toLocaleString([], {
//     day: "2-digit",
//     month: "short",
//     hour: "2-digit",
//     minute: "2-digit",
//     hour12: false,
//   });

// /**
//  * The single time filter, rendered directly below the geo / zonal filters.
//  * Controlled: `value` = { preset, customFrom, customTo }, `onChange(next)`.
//  */
// export default function TimeRangeFilter({ value, onChange }) {
//   const selection = value || DEFAULT_TIME_RANGE;
//   const custom = selection.preset === "custom";

//   // Draft custom dates: only a valid pair is pushed to the dashboard.
//   const [draft, setDraft] = useState({ from: selection.customFrom, to: selection.customTo });
//   useEffect(() => {
//     setDraft({ from: selection.customFrom, to: selection.customTo });
//   }, [selection.customFrom, selection.customTo]);

//   const draftError = useMemo(
//     () => (custom ? validateTimeRange({ preset: "custom", customFrom: draft.from, customTo: draft.to }) : ""),
//     [custom, draft.from, draft.to]
//   );

//   const choosePreset = (preset) => {
//     if (preset === "custom") {
//       // Start from the last 24 hours so the first custom view is never empty.
//       const now = Date.now();
//       const from = selection.customFrom || toLocalInput(now - 24 * 60 * 60 * 1000);
//       const to = selection.customTo || toLocalInput(now);
//       onChange?.({ preset, customFrom: from, customTo: to });
//       return;
//     }
//     onChange?.({ preset, customFrom: "", customTo: "" });
//   };

//   const editDraft = (patch) => {
//     const next = { ...draft, ...patch };
//     setDraft(next);
//     const error = validateTimeRange({ preset: "custom", customFrom: next.from, customTo: next.to });
//     if (!error) onChange?.({ preset: "custom", customFrom: next.from, customTo: next.to });
//   };

//   // Human-readable description of what the dashboard is showing.
//   const summary = useMemo(() => {
//     if (!isWindowed(selection)) return "Live readings · charts show the last 24 hours";
//     if (custom && draftError) return "";
//     const range = resolveTimeRange(selection);
//     return range ? `${formatStamp(range.from)} → ${formatStamp(range.to)}` : "";
//   }, [selection, custom, draftError]);

//   const nowInput = toLocalInput(Date.now());
//   const minInput = toLocalInput(Date.now() - MAX_RANGE_DAYS * 24 * 60 * 60 * 1000);

//   return (
//     <div
//       className="time-range-filter"
//       style={{
//         display: "flex",
//         alignItems: "center",
//         gap: "10px",
//         padding: "10px 15px",
//         background: "#ffffff",
//         border: "1px solid #e1e8f0",
//         borderRadius: "8px",
//         flexWrap: "wrap",
//         marginTop: "8px",
//       }}
//     >
//       <span
//         style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: "#374151" }}
//       >
//         <Clock size={15} /> Time
//       </span>

//       <select
//         className="filter-dropdown"
//         value={selection.preset}
//         onChange={(event) => choosePreset(event.target.value)}
//         aria-label="Dashboard time range"
//       >
//         {TIME_PRESETS.map((preset) => (
//           <option key={preset.value} value={preset.value}>
//             {preset.label}
//           </option>
//         ))}
//       </select>

//       {custom && (
//         <>
//           <input
//             className="filter-dropdown"
//             type="datetime-local"
//             aria-label="Start"
//             value={draft.from}
//             min={minInput}
//             max={draft.to || nowInput}
//             onChange={(event) => editDraft({ from: event.target.value })}
//           />
//           <span style={{ color: "#64748b", fontSize: 12 }}>to</span>
//           <input
//             className="filter-dropdown"
//             type="datetime-local"
//             aria-label="End"
//             value={draft.to}
//             min={draft.from || minInput}
//             max={nowInput}
//             onChange={(event) => editDraft({ to: event.target.value })}
//           />
//         </>
//       )}

//       {isWindowed(selection) && (
//         <button
//           type="button"
//           onClick={() => onChange?.({ preset: LIVE, customFrom: "", customTo: "" })}
//           style={{
//             height: "35px",
//             padding: "0 14px",
//             border: "1px solid #d1d5db",
//             borderRadius: "5px",
//             background: "#ffffff",
//             cursor: "pointer",
//             fontSize: "12px",
//           }}
//         >
//           Back to live
//         </button>
//       )}

//       {draftError ? (
//         <span style={{ color: "#c0392b", fontSize: 12 }}>{draftError}</span>
//       ) : (
//         summary && <span style={{ color: "#64748b", fontSize: 12 }}>{summary}</span>
//       )}
//     </div>
//   );
// }

import React, { useEffect, useMemo, useState } from "react";
import { Clock } from "lucide-react";

import {
  DEFAULT_TIME_RANGE,
  LIVE,
  MAX_RANGE_DAYS,
  TIME_PRESETS,
  isWindowed,
  resolveTimeRange,
  validateTimeRange,
} from "./TimeRangeContext";

const pad2 = (n) => String(n).padStart(2, "0");
const toLocalInput = (ms) => {
  const d = new Date(ms);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
};

const formatStamp = (ms) =>
  new Date(ms).toLocaleString([], {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

export default function TimeRangeFilter({ value, onChange }) {
  const selection = value || DEFAULT_TIME_RANGE;
  const custom = selection.preset === "custom";

  const [draft, setDraft] = useState({ from: selection.customFrom, to: selection.customTo });
  useEffect(() => {
    setDraft({ from: selection.customFrom, to: selection.customTo });
  }, [selection.customFrom, selection.customTo]);

  const draftError = useMemo(
    () => (custom ? validateTimeRange({ preset: "custom", customFrom: draft.from, customTo: draft.to }) : ""),
    [custom, draft.from, draft.to]
  );

  const choosePreset = (preset) => {
    if (preset === "custom") {
      const now = Date.now();
      const from = selection.customFrom || toLocalInput(now - 24 * 60 * 60 * 1000);
      const to = selection.customTo || toLocalInput(now);
      onChange?.({ preset, customFrom: from, customTo: to });
      return;
    }
    onChange?.({ preset, customFrom: "", customTo: "" });
  };

  const editDraft = (patch) => {
    const next = { ...draft, ...patch };
    setDraft(next);
    const error = validateTimeRange({ preset: "custom", customFrom: next.from, customTo: next.to });
    if (!error) onChange?.({ preset: "custom", customFrom: next.from, customTo: next.to });
  };

  const summary = useMemo(() => {
    if (!isWindowed(selection)) return "Live readings · charts show the last 24 hours";
    if (custom && draftError) return "";
    const range = resolveTimeRange(selection);
    return range ? `${formatStamp(range.from)} → ${formatStamp(range.to)}` : "";
  }, [selection, custom, draftError]);

  const nowInput = toLocalInput(Date.now());
  const minInput = toLocalInput(Date.now() - MAX_RANGE_DAYS * 24 * 60 * 60 * 1000);

  return (
    <div className="time-range-filter">
      {/* Top Row: Controls */}
      <div className="time-range-controls">
        {/* <span className="time-range-label">
          <Clock size={15} /> Time
        </span> */}

        {isWindowed(selection) && (
          <button
            type="button"
            className="time-range-live-btn"
            onClick={() => onChange?.({ preset: LIVE, customFrom: "", customTo: "" })}
          >
            Go Live
          </button>
        )}

        <div className="time-range-segmented" role="group" aria-label="Dashboard time range">
          {TIME_PRESETS.map((preset) => (
            <button
              key={preset.value}
              type="button"
              className={selection.preset === preset.value ? "active" : ""}
              onClick={() => choosePreset(preset.value)}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {custom && (
          <div className="time-range-custom">
            <input
              type="datetime-local"
              aria-label="Start"
              value={draft.from}
              min={minInput}
              max={draft.to || nowInput}
              onChange={(event) => editDraft({ from: event.target.value })}
            />
            <span className="time-range-to">to</span>
            <input
              type="datetime-local"
              aria-label="End"
              value={draft.to}
              min={draft.from || minInput}
              max={nowInput}
              onChange={(event) => editDraft({ to: event.target.value })}
            />
          </div>
        )}
      </div>

      {/* Bottom Row: Summary / Error */}
      {(draftError || summary) && (
        <div className="time-range-info">
          {draftError ? (
            <span className="time-range-error">{draftError}</span>
          ) : (
            <span className="time-range-summary">{summary}</span>
          )}
        </div>
      )}
    </div>
  );
}