import React, { createContext, useContext, useMemo } from "react";

import { getViewRange } from "./metricHistory";

export const LIVE = "live";
export const MAX_RANGE_DAYS = 93;

export const TIME_PRESETS = [
  // { value: LIVE, label: "Live" },
  { value: "today", label: "Today" },
  { value: "last-hour", label: "Last hour" },
  // { value: "last-6-hours", label: "Last 6 hours" },
  { value: "last-12-hours", label: "Last 12 hours" },
  { value: "last-24-hours", label: "Last 24 hours" },
  // { value: "yesterday", label: "Yesterday" },
  { value: "last-7-days", label: "Last 7 Days" },
  { value: "last-30-days", label: "Last 30 Days" },
  { value: "month", label: "This Month" },
  // { value: "custom", label: "Custom range" },
];

export const DEFAULT_TIME_RANGE = { preset: "today", customFrom: "", customTo: "" };

const pad2 = (n) => String(n).padStart(2, "0");

export const toDateInput = (date) =>
  `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;

/** Make any stored / incoming value a valid selection. */
export function normalizeTimeRange(input) {
  const preset = TIME_PRESETS.some((p) => p.value === input?.preset) ? input.preset : "today";
  return {
    preset,
    customFrom: String(input?.customFrom || ""),
    customTo: String(input?.customTo || ""),
  };
}

/** Is the selection a historical window (anything other than "Live")? */
export const isWindowed = (selection) => (selection?.preset || "today") !== "today";

/**
 * Resolve a selection to concrete epoch-ms bounds, or null for "Live"
 * (no window: widgets show their live snapshot).
 */
export function resolveTimeRange(selection, now = new Date()) {
  if (!isWindowed(selection)) return null;
  return getViewRange(selection.preset, 0, now, selection.customFrom, selection.customTo);
}

/** Validation message for a custom range, or "" when fine. */
export function validateTimeRange(selection) {
  if (selection?.preset !== "custom") return "";
  const { customFrom, customTo } = selection;
  if (!customFrom || !customTo) return "Pick both a start and an end.";
  const { from, to } = getViewRange("custom", 0, new Date(), customFrom, customTo);
  if (!(to > from)) return "The start must be earlier than the end.";
  if (to - from > MAX_RANGE_DAYS * 24 * 60 * 60 * 1000) {
    return `Ranges are limited to ${MAX_RANGE_DAYS} days.`;
  }
  return "";
}

/** Add `from` / `to` (ISO) to URLSearchParams when a window is active. */
export function applyTimeRangeParams(params, selection, now = new Date()) {
  const range = resolveTimeRange(selection, now);
  if (range) {
    params.set("from", new Date(range.from).toISOString());
    params.set("to", new Date(range.to).toISOString());
  }
  return params;
}

const TimeRangeContext = createContext(null);

export function TimeRangeProvider({ value, children }) {
  const selection = useMemo(() => normalizeTimeRange(value), [value?.preset, value?.customFrom, value?.customTo]);
  return <TimeRangeContext.Provider value={selection}>{children}</TimeRangeContext.Provider>;
}

/**
 * The dashboard's selection, or null when a widget is rendered outside a
 * provider (it then keeps its own local controls).
 */
export function useTimeRange() {
  return useContext(TimeRangeContext);
}
