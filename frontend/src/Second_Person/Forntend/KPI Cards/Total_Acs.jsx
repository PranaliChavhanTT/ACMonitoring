import React from "react";

function Total_Acs({ value = 0 }) {

    return (

        <div className="kpi-card">

            <div className="kpi-icon">
                ❄️
            </div>

            <div className="kpi-content">

                <p>
                    Total ACs
                </p>

                <h2>
                    {value}
                </h2>

                <span>
                    Installed Units
                </span>

            </div>

        </div>

    );
}

export default Total_Acs;