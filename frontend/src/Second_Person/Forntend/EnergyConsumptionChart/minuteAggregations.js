// minuteAggregations.js

const toNumber = (value) => {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
};

const getTimestamp = (item) =>
    item.timestamp ??
    item.time_stamp ??
    item.timeStamp ??
    item.Timestamp ??
    item.datetime ??
    item.date_time ??
    item.created_at ??
    item.createdAt ??
    item.time ??
    null;

const getDeviceId = (item) =>
    item.device_id ??
    item.Device_ID ??
    item.deviceId ??
    item.ac_id ??
    item.AC_ID ??
    item.device_name ??
    item.Device_Name ??
    item.id ??
    "unknown";

const average = (items, getter) => {
    if (!items.length) return 0;

    const values = items
        .map(getter)
        .filter((v) => Number.isFinite(v));

    if (!values.length) return 0;

    return values.reduce((sum, v) => sum + v, 0) / values.length;
};


// =====================================================
// AGGREGATE DATA INTO 1-MINUTE BUCKETS
// =====================================================
export const aggregateByMinute = (data = []) => {

    if (!Array.isArray(data) || data.length === 0) {
        return [];
    }

    const groups = {};

    // ---------------------------------------------
    // Group records by minute + device
    // ---------------------------------------------
    data.forEach((item) => {

        const timestamp = getTimestamp(item);

        if (!timestamp) return;

        const date = new Date(timestamp);

        if (Number.isNaN(date.getTime())) return;

        const minuteStart = new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
            date.getHours(),
            date.getMinutes(),
            0,
            0
        ).getTime();

        const deviceId = getDeviceId(item);

        const key = `${minuteStart}_${deviceId}`;

        if (!groups[key]) {
            groups[key] = [];
        }

        groups[key].push(item);
    });


    // ---------------------------------------------
    // Aggregate each device for each minute
    // ---------------------------------------------
    const deviceMinuteData = Object.values(groups).map((items) => {

        const sorted = [...items].sort(
            (a, b) =>
                new Date(getTimestamp(a)) -
                new Date(getTimestamp(b))
        );

        const first = sorted[0];
        const last = sorted[sorted.length - 1];

        const firstEnergy = toNumber(
            first.energy_consumption ??
            first.Energy_Consumption ??
            first.energy ??
            first.Energy
        );

        const lastEnergy = toNumber(
            last.energy_consumption ??
            last.Energy_Consumption ??
            last.energy ??
            last.Energy
        );

        return {

            device_id: getDeviceId(last),

            timestamp: getTimestamp(last),

            energy_consumption: Math.max(
                0,
                lastEnergy - firstEnergy
            ),

            active_power: average(
                sorted,
                (item) =>
                    toNumber(
                        item.active_power ??
                        item.Active_Power
                    )
            ),

            voltage: average(
                sorted,
                (item) =>
                    toNumber(
                        item.voltage ??
                        item.Voltage
                    )
            ),

            current: average(
                sorted,
                (item) =>
                    toNumber(
                        item.current ??
                        item.Current
                    )
            ),

            temperature: average(
                sorted,
                (item) =>
                    toNumber(
                        item.temperature ??
                        item.indoor_temperature ??
                        item.indoor_temp
                    )
            ),

            humidity: average(
                sorted,
                (item) =>
                    toNumber(
                        item.humidity ??
                        item.indoor_humidity
                    )
            ),

            frequency: average(
                sorted,
                (item) =>
                    toNumber(
                        item.frequency ??
                        item.Frequency
                    )
            ),

            power_factor: average(
                sorted,
                (item) =>
                    toNumber(
                        item.power_factor ??
                        item.Power_Factor
                    )
            )
        };
    });


    // ---------------------------------------------
    // Group all devices into the same minute
    // ---------------------------------------------
    const minuteGroups = {};

    deviceMinuteData.forEach((item) => {

        const date = new Date(item.timestamp);

        const minuteStart = new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
            date.getHours(),
            date.getMinutes(),
            0,
            0
        ).getTime();

        if (!minuteGroups[minuteStart]) {
            minuteGroups[minuteStart] = [];
        }

        minuteGroups[minuteStart].push(item);
    });


    // ---------------------------------------------
    // Final dashboard-level 1-minute data
    // ---------------------------------------------
    return Object.entries(minuteGroups)

        .sort(
            ([a], [b]) =>
                Number(a) - Number(b)
        )

        .map(([minute, devices]) => ({

            timestamp: new Date(
                Number(minute)
            ).toISOString(),

            energy_consumption:
                devices.reduce(
                    (sum, device) =>
                        sum +
                        device.energy_consumption,
                    0
                ),

            active_power:
                devices.reduce(
                    (sum, device) =>
                        sum +
                        device.active_power,
                    0
                ),

            voltage: average(
                devices,
                (device) => device.voltage
            ),

            current:
                devices.reduce(
                    (sum, device) =>
                        sum + device.current,
                    0
                ),

            temperature: average(
                devices,
                (device) => device.temperature
            ),

            humidity: average(
                devices,
                (device) => device.humidity
            ),

            frequency: average(
                devices,
                (device) => device.frequency
            ),

            power_factor: average(
                devices,
                (device) => device.power_factor
            ),

            device_count: devices.length
        }));
};


export default aggregateByMinute;