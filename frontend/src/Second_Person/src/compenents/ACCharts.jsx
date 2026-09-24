import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from "recharts";


function ACCharts({ data }) {

    const chartData = data.map((item, index) => ({
        name: index + 1,

        indoor_temperature:
            Number(item.indoor_temperature || 0),

        outdoor_temperature:
            Number(item.outdoor_temperature || 0),

        current:
            Number(item.current || 0),

        voltage:
            Number(item.voltage || 0)
    }));


    return (
        <section className="charts">

            <div className="chart-container">

                <h2>Temperature Monitoring</h2>

                <ResponsiveContainer width="100%" height={350}>

                    <LineChart data={chartData}>

                        <CartesianGrid strokeDasharray="3 3" />

                        <XAxis
                            dataKey="name"
                        />

                        <YAxis />

                        <Tooltip />

                        <Legend />

                        <Line
                            type="monotone"
                            dataKey="indoor_temperature"
                            name="Indoor °C"
                            strokeWidth={2}
                        />

                        <Line
                            type="monotone"
                            dataKey="outdoor_temperature"
                            name="Outdoor °C"
                            strokeWidth={2}
                        />

                    </LineChart>

                </ResponsiveContainer>

            </div>


            <div className="chart-container">

                <h2>Electrical Monitoring</h2>

                <ResponsiveContainer width="100%" height={350}>

                    <LineChart data={chartData}>

                        <CartesianGrid strokeDasharray="3 3" />

                        <XAxis
                            dataKey="name"
                        />

                        <YAxis />

                        <Tooltip />

                        <Legend />

                        <Line
                            type="monotone"
                            dataKey="current"
                            name="Current (A)"
                            strokeWidth={2}
                        />

                        <Line
                            type="monotone"
                            dataKey="voltage"
                            name="Voltage (V)"
                            strokeWidth={2}
                        />

                    </LineChart>

                </ResponsiveContainer>

            </div>

        </section>
    );
}

export default ACCharts;