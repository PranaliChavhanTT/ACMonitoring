function SummaryCards({ data }) {

    const totalACs = new Set(
        data.map(item => item.ac_id)
    ).size;

    const averageIndoorTemp =
        data.length > 0
            ? (
                data.reduce(
                    (sum, item) =>
                        sum + Number(item.indoor_temperature || 0),
                    0
                ) / data.length
            ).toFixed(1)
            : "0";

    const averageOutdoorTemp =
        data.length > 0
            ? (
                data.reduce(
                    (sum, item) =>
                        sum + Number(item.outdoor_temperature || 0),
                    0
                ) / data.length
            ).toFixed(1)
            : "0";

    const totalCurrent =
        data.reduce(
            (sum, item) =>
                sum + Number(item.current || 0),
            0
        ).toFixed(2);

    const totalPower =
        data.reduce(
            (sum, item) =>
                sum +
                Number(item.voltage || 0) *
                Number(item.current || 0),
            0
        ).toFixed(0);

    return (
        <section className="cards">

            <div className="card">
                <div className="card-title">
                    Total ACs
                </div>

                <div className="card-value">
                    {totalACs}
                </div>

                <div className="card-unit">
                    Units
                </div>
            </div>


            <div className="card">
                <div className="card-title">
                    Indoor Temperature
                </div>

                <div className="card-value">
                    {averageIndoorTemp}
                    <span>°C</span>
                </div>

                <div className="card-unit">
                    Average
                </div>
            </div>


            <div className="card">
                <div className="card-title">
                    Outdoor Temperature
                </div>

                <div className="card-value">
                    {averageOutdoorTemp}
                    <span>°C</span>
                </div>

                <div className="card-unit">
                    Average
                </div>
            </div>


            <div className="card">
                <div className="card-title">
                    Total Current
                </div>

                <div className="card-value">
                    {totalCurrent}
                    <span>A</span>
                </div>

                <div className="card-unit">
                    Current
                </div>
            </div>


            <div className="card">
                <div className="card-title">
                    Apparent Power
                </div>

                <div className="card-value">
                    {totalPower}
                    <span>VA</span>
                </div>

                <div className="card-unit">
                    V × A
                </div>
            </div>

        </section>
    );
}

export default SummaryCards;