// const express = require('express');
// const cors = require('cors');
// const locationData = require('./data/locationData.json');

// const app = express();
// app.use(cors());

// app.get('/api/v1/filters/locations', (req, res) => {
//     res.status(200).json({ success: true, data: locationData });
// });

// const PORT = 5000;
// app.listen(PORT, () => console.log(`Backend server running on port ${PORT}`));



const express = require("express");
const cors = require("cors");

const zonalData = require("./data/locationData_zonal.json");
const geographicalData = require("./data/locationData_geographical.json");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/v1/filters/locations/zonal", (req, res) => {
    res.status(200).json({
        success: true,
        hierarchy_type: "ZONAL",
        data: zonalData
    });
});

app.get("/api/v1/filters/locations/geographical", (req, res) => {
    res.status(200).json({
        success: true,
        hierarchy_type: "GEOGRAPHICAL",
        data: geographicalData
    });
});

app.get("/api/v1/filters/locations", (req, res) => {
    res.status(200).json({
        success: true,

        zonal: {
            hierarchy_type: "ZONAL",
            data: zonalData
        },

        geographical: {
            hierarchy_type: "GEOGRAPHICAL",
            data: geographicalData
        }
    });
});

const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});
