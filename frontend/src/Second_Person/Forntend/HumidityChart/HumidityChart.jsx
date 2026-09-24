import React, { useMemo } from "react";

import {
    ResponsiveContainer,
    LineChart,
    Line,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
} from "recharts";


function HumidityChart({ data = [] }) {

    const chartData = useMemo(() => {

        return data.map((item, index) => {

            const timestamp =
                item.timestamp ??
                item.time ??
                item.created_at ??
                "";

            return {

                name:
                    timestamp
                        ? String(timestamp).slice(11, 16)
                        : item.ac_id ??
                          `AC ${index + 1}`,

                indoor: Number(
                    item.indoor_humidity ??
                    item.humidity ??
                    0
                ),

                outdoor: Number(
                    item.outdoor_humidity ??
                    0
                ),

            };

        });

    }, [data]);


    return (

        <div className="chart-box">

            <div className="chart-header">

                <div>

                    <h3>
                        💧 Humidity Monitoring
                    </h3>

                    <span>
                        Indoor vs Outdoor
                    </span>

                </div>

            </div>


            <ResponsiveContainer
                width="100%"
                height={280}
            >

                <LineChart data={chartData}>

                    <CartesianGrid
                        strokeDasharray="3 3"
                    />

                    <XAxis
                        dataKey="name"
                        tick={{ fontSize: 11 }}
                    />

                    <YAxis
                        domain={[0, 100]}
                        tickFormatter={(value) =>
                            `${value}%`
                        }
                        tick={{ fontSize: 11 }}
                    />

                    <Tooltip
                        formatter={(value) =>
                            `${Number(value).toFixed(1)}%`
                        }
                    />

                    <Legend />


                    <Line
                        type="monotone"
                        dataKey="indoor"
                        name="Indoor Humidity"
                        stroke="#3182BD"
                        strokeWidth={3}
                        dot={false}
                    />

                    <Line
                        type="monotone"
                        dataKey="outdoor"
                        name="Outdoor Humidity"
                        stroke="#94a3b8"
                        strokeWidth={2}
                        dot={false}
                    />

                </LineChart>

            </ResponsiveContainer>

        </div>

    );
}


export default HumidityChart;