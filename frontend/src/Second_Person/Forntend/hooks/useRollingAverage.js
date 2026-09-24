// useRollingAverage.js
//
// WHY THIS EXISTS
// ----------------------------------------------------------------------
// The API pushes a fresh reading every ~2 seconds. Plotting every single
// reading makes the energy map / temperature / humidity views look noisy
// and "jumpy" because tiny sensor fluctuations show up immediately.
//
// This hook keeps a short rolling buffer of the raw 2-second readings and,
// every `recalcMs` (default 30s), recomputes the average of the last
// `windowMs` (default 60s = "last minute") per device. That smoothed value
// is what components should render instead of the raw live reading.
//
// It returns two things:
//   - deviceData:   the latest smoothed reading PER DEVICE (use this for
//                    anything that needs to know "where" a reading is from
//                    - the energy map, zone/state/circle/city/branch
//                    comparisons, per-unit charts).
//   - trendHistory: one combined, dashboard-wide point appended every
//                    recalculation, so trend/line charts still show a
//                    moving history built from smoothed samples instead of
//                    raw noise.
// ----------------------------------------------------------------------

import { useEffect, useRef, useState } from "react";

const toNumber = (value) => {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
};

const numberOrZero = (value) => {
    const n = toNumber(value);
    return n === null ? 0 : n;
};

const getTimestamp = (item) =>
    item?.timestamp ??
    item?.time_stamp ??
    item?.timeStamp ??
    item?.Timestamp ??
    item?.datetime ??
    item?.date_time ??
    item?.created_at ??
    item?.createdAt ??
    item?.time ??
    null;

const getDeviceId = (item) =>
    item?.ac_id ??
    item?.AC_ID ??
    item?.device_id ??
    item?.Device_ID ??
    item?.deviceId ??
    item?.device_name ??
    item?.Device_Name ??
    item?.id ??
    item?.name ??
    "unknown";

// Numeric fields that get averaged over the rolling window.
// Includes a few alternate-casing aliases so this keeps working even if
// a different endpoint / future API uses slightly different keys.
const NUMERIC_FIELD_GROUPS = [
    ["energy_consumption", "Energy_Consumption", "energy", "Energy", "kwh", "kWh"],
    ["active_power", "Active_Power", "power", "Power"],
    ["voltage", "Voltage"],
    ["current", "Current"],
    ["frequency", "Frequency"],
    ["power_factor", "Power_Factor"],
    ["temperature", "indoor_temperature", "indoor_temp", "temp"],
    ["outdoor_temperature", "outdoor_temp"],
    ["humidity", "indoor_humidity"],
    ["outdoor_humidity"],
];

const average = (values) => {
    const nums = values.map(toNumber).filter((v) => v !== null);
    if (!nums.length) return 0;
    return nums.reduce((sum, v) => sum + v, 0) / nums.length;
};

/**
 * @param {Array} data - the latest raw snapshot (refreshed every ~2s by the parent poller)
 * @param {Object} options
 * @param {number} options.windowMs - how far back to average over (default 60000 = 1 minute)
 * @param {number} options.recalcMs - how often to recompute the smoothed values (default 30000 = 30s)
 * @param {number} options.historyLimit - max number of trend points to keep (default 60)
 */
export const useRollingAverage = (
    data = [],
    { windowMs = 60000, recalcMs = 30000, historyLimit = 60 } = {}
) => {
    // Ring buffer of raw snapshots: [{ receivedAt, items }]
    const bufferRef = useRef([]);

    const [deviceData, setDeviceData] = useState([]);
    const [trendHistory, setTrendHistory] = useState([]);

    // 1) Keep appending fresh snapshots into the buffer as they arrive.
    useEffect(() => {
        if (!Array.isArray(data) || data.length === 0) return;

        bufferRef.current.push({
            receivedAt: Date.now(),
            items: data,
        });

        const cutoff = Date.now() - windowMs;
        bufferRef.current = bufferRef.current.filter(
            (snapshot) => snapshot.receivedAt >= cutoff
        );
    }, [data, windowMs]);

    // 2) Every `recalcMs`, average whatever is currently in the buffer.
    useEffect(() => {
        const recalculate = () => {
            const cutoff = Date.now() - windowMs;

            bufferRef.current = bufferRef.current.filter(
                (snapshot) => snapshot.receivedAt >= cutoff
            );

            const buffered = bufferRef.current;
            if (!buffered.length) return;

            // Group every buffered raw reading by device.
            const byDevice = {};
            buffered.forEach((snapshot) => {
                snapshot.items.forEach((item) => {
                    const id = getDeviceId(item);
                    if (!byDevice[id]) byDevice[id] = [];
                    byDevice[id].push(item);
                });
            });

            const devices = Object.entries(byDevice).map(([id, items]) => {
                // Non-numeric fields (location, status, etc.) come from the
                // most recent reading for that device.
                const latest = items[items.length - 1];

                const averaged = {};
                NUMERIC_FIELD_GROUPS.forEach((aliasGroup) => {
                    const [primaryKey] = aliasGroup;
                    const present = items.some((it) =>
                        aliasGroup.some((key) => it?.[key] !== undefined)
                    );
                    if (!present) return;

                    averaged[primaryKey] = average(
                        items.map((it) => {
                            for (const key of aliasGroup) {
                                if (it?.[key] !== undefined) return it[key];
                            }
                            return undefined;
                        })
                    );
                });

                return {
                    ...latest,
                    ...averaged,
                    device_id: id,
                    timestamp: getTimestamp(latest),
                    sample_count: items.length,
                };
            });

            setDeviceData(devices);

            // Combined dashboard-wide point, for trend/line charts.
            const point = {
                timestamp: new Date().toISOString(),

                energy_consumption: devices.reduce(
                    (sum, d) => sum + numberOrZero(d.energy_consumption),
                    0
                ),

                active_power: devices.reduce(
                    (sum, d) => sum + numberOrZero(d.active_power),
                    0
                ),

                voltage: average(devices.map((d) => d.voltage)),

                current: devices.reduce(
                    (sum, d) => sum + numberOrZero(d.current),
                    0
                ),

                frequency: average(devices.map((d) => d.frequency)),
                power_factor: average(devices.map((d) => d.power_factor)),

                temperature: average(devices.map((d) => d.temperature)),
                outdoor_temperature: average(devices.map((d) => d.outdoor_temperature)),

                humidity: average(devices.map((d) => d.humidity)),
                outdoor_humidity: average(devices.map((d) => d.outdoor_humidity)),

                device_count: devices.length,
            };

            setTrendHistory((prev) => [...prev, point].slice(-historyLimit));
        };

        // Compute once immediately, then on the recalc cadence.
        recalculate();
        const interval = setInterval(recalculate, recalcMs);
        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [windowMs, recalcMs, historyLimit]);

    return { deviceData, trendHistory };
};

export default useRollingAverage;
