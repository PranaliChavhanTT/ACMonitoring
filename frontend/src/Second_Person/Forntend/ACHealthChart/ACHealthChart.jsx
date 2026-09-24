import React, { useMemo } from "react";

import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
} from "recharts";

const COLORS = {
    Healthy: "#16a34a",
    Attention: "#f59e0b",
    Critical: "#ef4444",
};

function ACHealthChart({ data = [] }) {
    const chartData = useMemo(() => {
        let healthy = 0;
        let attention = 0;
        let critical = 0;

        data.forEach((item) => {
            const status = String(
                item.health_status ??
                item.health ??
                "Healthy"
            ).toLowerCase();

            if (status === "critical") {
                critical++;
            }
            else if ( status === "attention" || status === "warning" ) {
                attention++;
            }
            else {
                healthy++;
            }
        });

        return [
            {
                name: "Healthy",
                value: healthy,
            },
            {
                name: "Attention",
                value: attention,
            },
            {
                name: "Critical",
                value: critical,
            },
        ];
    }, [data]);

    const total = data.length;

    return (
        <div className="chart-box">
            <div className="chart-header">
                <div>
                    <h3>
                        ❤️ AC Health Status
                    </h3>
                    <span>
                        Current unit health
                    </span>
                </div>
            </div>
            {total === 0 ? (
                <div className="chart-empty">
                    No health data available
                </div>
            ) : (
                <div className="health-chart-container">
                    <ResponsiveContainer
                        width="60%"
                        height={240}
                    >
                        <PieChart>
                            <Pie
                                data={chartData}
                                dataKey="value"
                                nameKey="name"
                                cx="40%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={90}
                                paddingAngle={3}
                            >
                                {chartData.map(
                                    (entry) => (
                                        <Cell 
                                            key={entry.name}
                                            fill={ COLORS[ entry.name ] }
                                        />
                                    )
                                )}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>

                    <div className="health-center">
                        <strong> {total} </strong>
                        <span> Total AC Units </span>
                    </div>

                    <div className="health-legend">
                        {chartData.map(
                            (item) => {
                                const percentage =
                                    total > 0
                                        ? (
                                            item.value /
                                            total *
                                            100
                                        ).toFixed(0)
                                        : 0;

                                return (
                                    <div
                                        className="health-item"
                                        key={item.name}
                                    >
                                        <span
                                            className="health-dot"
                                            style={{
                                                backgroundColor:
                                                    COLORS[
                                                        item.name
                                                    ],
                                            }}
                                        />
                                        <span>
                                            {item.name}
                                        </span>
                                        <strong>
                                            {item.value}
                                            {" "}
                                            ({percentage}%)
                                        </strong>
                                    </div>
                                );
                            }
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default ACHealthChart;