// // // src/utils/minuteAggregation.js

// // /**
// //  * Get timestamp from an API record.
// //  */
// // export const getTimestamp = (item) => {
// //     return (
// //         item.timestamp ||
// //         item.time_stamp ||
// //         item.timeStamp ||
// //         item.Timestamp ||
// //         item.created_at ||
// //         item.createdAt ||
// //         item.date_time ||
// //         item.datetime ||
// //         null
// //     );
// // };


// // /**
// //  * Convert timestamp to a minute bucket.
// //  *
// //  * Example:
// //  * 10:24:02 -> 10:24
// //  * 10:24:27 -> 10:24
// //  * 10:24:58 -> 10:24
// //  * 10:25:01 -> 10:25
// //  */
// // export const getMinuteKey = (timestamp) => {

// //     if (!timestamp) return null;

// //     const date = new Date(timestamp);

// //     if (Number.isNaN(date.getTime())) {
// //         return null;
// //     }

// //     date.setSeconds(0, 0);

// //     return date.toISOString();
// // };


// // /**
// //  * Calculate average.
// //  */
// // const average = (values) => {

// //     if (!values.length) {
// //         return 0;
// //     }

// //     const validValues = values.filter(
// //         value =>
// //             value !== null &&
// //             value !== undefined &&
// //             Number.isFinite(Number(value))
// //     );

// //     if (!validValues.length) {
// //         return 0;
// //     }

// //     const sum = validValues.reduce(
// //         (total, value) =>
// //             total + Number(value),
// //         0
// //     );

// //     return sum / validValues.length;
// // };


// // /**
// //  * Aggregate API data into 1-minute averages.
// //  *
// //  * Every minute becomes ONE record.
// //  */
// // export const aggregateByMinute = (
// //     data = [],
// //     fields = []
// // ) => {

// //     if (!Array.isArray(data)) {
// //         return [];
// //     }

// //     const buckets = {};


// //     data.forEach((item) => {

// //         const timestamp =
// //             getTimestamp(item);

// //         const minuteKey =
// //             getMinuteKey(timestamp);

// //         if (!minuteKey) {
// //             return;
// //         }


// //         if (!buckets[minuteKey]) {

// //             buckets[minuteKey] = {
// //                 timestamp: minuteKey,
// //                 records: []
// //             };
// //         }


// //         buckets[minuteKey].records.push(item);

// //     });


// //     const result = Object.values(buckets)
// //         .map((bucket) => {

// //             const output = {
// //                 timestamp: bucket.timestamp
// //             };


// //             fields.forEach((field) => {

// //                 const values =
// //                     bucket.records.map(
// //                         item => item[field]
// //                     );

// //                 output[field] =
// //                     average(values);

// //             });


// //             output.sampleCount =
// //                 bucket.records.length;


// //             return output;

// //         })
// //         .sort(
// //             (a, b) =>
// //                 new Date(a.timestamp) -
// //                 new Date(b.timestamp)
// //         );


// //     return result;
// // };



// import { useEffect, useState } from "react";

// const numberValue = (value) => {
//     const number = Number(value);
//     return Number.isFinite(number) ? number : 0;
// };

// const getTimestamp = (item) => {
//     return (
//         item.timestamp ??
//         item.time_stamp ??
//         item.timeStamp ??
//         item.Time_Stamp ??
//         item.datetime ??
//         item.date_time ??
//         item.created_at ??
//         item.createdAt ??
//         item.time ??
//         null
//     );
// };

// const getDeviceId = (item) => {
//     return (
//         item.device_id ??
//         item.Device_ID ??
//         item.deviceId ??
//         item.ac_id ??
//         item.AC_ID ??
//         item.id ??
//         "unknown"
//     );
// };

// const getEnergy = (item) => {
//     return numberValue(
//         item.energy_consumption ??
//         item.Energy_Consumption ??
//         item.energy ??
//         item.Energy ??
//         item.kwh ??
//         item.kWh
//     );
// };

// const getAverage = (values) => {
//     if (!values.length) return 0;

//     return (
//         values.reduce(
//             (sum, value) => sum + value,
//             0
//         ) / values.length
//     );
// };

// const aggregateMinute = (items) => {
//     if (!items.length) return null;

//     const sorted = [...items].sort(
//         (a, b) =>
//             new Date(getTimestamp(a)) -
//             new Date(getTimestamp(b))
//     );

//     const first = sorted[0];
//     const last = sorted[sorted.length - 1];

//     const firstEnergy = getEnergy(first);
//     const lastEnergy = getEnergy(last);

//     // Energy consumption for this minute.
//     // Assumes energy_consumption is a cumulative meter reading.
//     const energyConsumed = Math.max(
//         0,
//         lastEnergy - firstEnergy
//     );

//     return {
//         timestamp: getTimestamp(last),

//         energy_consumption: energyConsumed,

//         active_power: getAverage(
//             sorted.map(
//                 (item) =>
//                     numberValue(
//                         item.active_power ??
//                         item.Active_Power
//                     )
//             )
//         ),

//         voltage: getAverage(
//             sorted.map(
//                 (item) =>
//                     numberValue(
//                         item.voltage ??
//                         item.Voltage
//                     )
//             )
//         ),

//         current: getAverage(
//             sorted.map(
//                 (item) =>
//                     numberValue(
//                         item.current ??
//                         item.Current
//                     )
//             )
//         ),

//         temperature: getAverage(
//             sorted.map(
//                 (item) =>
//                     numberValue(
//                         item.temperature ??
//                         item.indoor_temperature ??
//                         item.indoor_temp
//                     )
//             )
//         ),

//         humidity: getAverage(
//             sorted.map(
//                 (item) =>
//                     numberValue(
//                         item.humidity ??
//                         item.indoor_humidity
//                     )
//             )
//         ),

//         frequency: getAverage(
//             sorted.map(
//                 (item) =>
//                     numberValue(
//                         item.frequency ??
//                         item.Frequency
//                     )
//             )
//         ),

//         power_factor: getAverage(
//             sorted.map(
//                 (item) =>
//                     numberValue(
//                         item.power_factor ??
//                         item.Power_Factor
//                     )
//             )
//         ),

//         device_id: getDeviceId(last),
//     };
// };

// const aggregateDataByMinute = (data) => {
//     if (!Array.isArray(data) || data.length === 0) {
//         return [];
//     }

//     const minuteGroups = {};

//     data.forEach((item) => {
//         const timestamp = getTimestamp(item);

//         if (!timestamp) return;

//         const date = new Date(timestamp);

//         if (Number.isNaN(date.getTime())) return;

//         const minuteKey = new Date(
//             date.getFullYear(),
//             date.getMonth(),
//             date.getDate(),
//             date.getHours(),
//             date.getMinutes(),
//             0,
//             0
//         ).getTime();

//         if (!minuteGroups[minuteKey]) {
//             minuteGroups[minuteKey] = [];
//         }

//         minuteGroups[minuteKey].push(item);
//     });

//     return Object.keys(minuteGroups)
//         .sort((a, b) => Number(a) - Number(b))
//         .map((minuteKey) =>
//             aggregateMinute(
//                 minuteGroups[minuteKey]
//             )
//         )
//         .filter(Boolean);
// };

// export const useMinuteData = (
//     data = [],
//     fields = []
// ) => {
//     const [minuteData, setMinuteData] = useState([]);

//     useEffect(() => {
//         const aggregated =
//             aggregateDataByMinute(data);

//         setMinuteData(aggregated);
//     }, [data, fields]);

//     return minuteData;
// };

// export default useMinuteData;



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