function ACTable({ data }) {

    return (
        <section className="table-section">

            <div className="table-header">
                <h2>AC Live Data</h2>

                <span>
                    {data.length} Records
                </span>
            </div>


            <div className="table-wrapper">

                <table>

                    <thead>

                        <tr>
                            <th>Time</th>
                            <th>AC ID</th>
                            <th>Indoor °C</th>
                            <th>Outdoor °C</th>
                            <th>Indoor Humidity</th>
                            <th>Outdoor Humidity</th>
                            <th>Voltage</th>
                            <th>Current</th>
                            <th>Power</th>
                        </tr>

                    </thead>


                    <tbody>

                        {data.map((item, index) => {

                            const power =
                                Number(item.voltage || 0) *
                                Number(item.current || 0);

                            return (
                                <tr key={index}>

                                    <td>
                                        {item.timestamp}
                                    </td>

                                    <td>
                                        <strong>
                                            {item.ac_id}
                                        </strong>
                                    </td>

                                    <td>
                                        {item.indoor_temperature}
                                    </td>

                                    <td>
                                        {item.outdoor_temperature}
                                    </td>

                                    <td>
                                        {item.indoor_humidity}%
                                    </td>

                                    <td>
                                        {item.outdoor_humidity}%
                                    </td>

                                    <td>
                                        {item.voltage} V
                                    </td>

                                    <td>
                                        {item.current} A
                                    </td>

                                    <td>
                                        {power.toFixed(0)} VA
                                    </td>

                                </tr>
                            );

                        })}

                    </tbody>

                </table>

            </div>

        </section>
    );
}

export default ACTable;